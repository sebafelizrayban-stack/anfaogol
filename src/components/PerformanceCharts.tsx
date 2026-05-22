/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { BarChart3, TrendingUp, ShieldAlert, Award, ChevronDown } from 'lucide-react';
import { Team, Match } from '../types';
import { computeStandings } from './StandingsTable';

interface PerformanceChartsProps {
  teams: Team[];
  matches: Match[];
}

export default function PerformanceCharts({ teams, matches }: PerformanceChartsProps) {
  const standings = useMemo(() => computeStandings(teams, matches), [teams, matches]);

  // Selected team for focus metrics
  const [selectedTeamId, setSelectedTeamId] = useState<string>(() => {
    return teams[0]?.id || '';
  });

  const activeStats = standings.find(s => s.teamId === selectedTeamId);
  const activeTeam = teams.find(t => t.id === selectedTeamId);

  // Fallback to first team if selectedTeamId becomes invalid after edit
  useMemo(() => {
    if (teams.length > 0 && !teams.some(t => t.id === selectedTeamId)) {
      setSelectedTeamId(teams[0].id);
    }
  }, [teams, selectedTeamId]);

  // Compute stats for all teams for comparative bar graphs
  const goalsData = useMemo(() => {
    return standings.map((s) => {
      const t = teams.find(team => team.id === s.teamId);
      return {
        name: t?.name || '?',
        goalsFor: s.goalsFor,
        goalsAgainst: s.goalsAgainst,
        points: s.points,
        color: t?.color || '#3b82f6',
      };
    }).sort((a, b) => b.points - a.points);
  }, [standings, teams]);

  if (teams.length === 0) {
    return (
      <div className="text-center py-12 bg-white border border-slate-100 rounded-3xl shadow-sm">
        <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">No hay datos para graficar</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
          Crea equipos y finaliza partidos en la pestaña de administración para ver las gráficas de rendimiento.
        </p>
      </div>
    );
  }

  // Calculate coordinates for custom SVG Trend Chart (Points tracking)
  // Let's assume matches progression chronologically. Every team starts at 0, then gains 1 or 3 per match.
  const teamPointCurve = useMemo(() => {
    if (!selectedTeamId) return [];

    const curve: { matchNumber: number; cumulPts: number; result: 'W' | 'D' | 'L' }[] = [
      { matchNumber: 0, cumulPts: 0, result: 'D' } // Start of season
    ];

    // Find and sort matches involving active team
    const teamMatches = matches
      .filter((m) => (m.status === 'finished' || m.status === 'live') && (m.homeTeamId === selectedTeamId || m.awayTeamId === selectedTeamId))
      .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());

    let accum = 0;
    teamMatches.forEach((m, idx) => {
      const isHome = m.homeTeamId === selectedTeamId;
      const scored = isHome ? m.homeScore : m.awayScore;
      const conceded = isHome ? m.awayScore : m.homeScore;

      let gain = 0;
      let res: 'W' | 'D' | 'L' = 'D';

      if (scored > conceded) {
        gain = 3;
        res = 'W';
      } else if (scored < conceded) {
        gain = 0;
        res = 'L';
      } else {
        gain = 1;
        res = 'D';
      }

      accum += gain;
      curve.push({
        matchNumber: idx + 1,
        cumulPts: accum,
        result: res
      });
    });

    return curve;
  }, [selectedTeamId, matches]);

  // Generate SVG coordinates for sparkline grid
  const linePointsString = useMemo(() => {
    if (teamPointCurve.length === 0) return '';
    const pointsCount = teamPointCurve.length;
    
    // Scale parameters
    const width = 500;
    const height = 150;
    const paddingX = 40;
    const paddingY = 25;

    const maxPts = Math.max(...teamPointCurve.map(c => c.cumulPts), 3); // minimum 3 points high for scale

    return teamPointCurve.map((c, idx) => {
      const x = paddingX + (idx / (pointsCount - 1 || 1)) * (width - 2 * paddingX);
      const y = height - paddingY - (c.cumulPts / maxPts) * (height - 2 * paddingY);
      return `${x},${y}`;
    }).join(' ');
  }, [teamPointCurve]);

  // Parse coords array for dot overlays
  const curveCoords = useMemo(() => {
    if (teamPointCurve.length === 0) return [];
    const pointsCount = teamPointCurve.length;
    const width = 500;
    const height = 150;
    const paddingX = 40;
    const paddingY = 25;

    const maxPts = Math.max(...teamPointCurve.map(c => c.cumulPts), 3);

    return teamPointCurve.map((c, idx) => {
      const x = paddingX + (idx / (pointsCount - 1 || 1)) * (width - 2 * paddingX);
      const y = height - paddingY - (c.cumulPts / maxPts) * (height - 2 * paddingY);
      return { x, y, ...c };
    });
  }, [teamPointCurve]);

  // Bar height logic for Comparative Goals bar charts
  const maxGoalVal = useMemo(() => {
    const vals = goalsData.flatMap(g => [g.goalsFor, g.goalsAgainst]);
    return Math.max(...vals, 5); // default limit of 5
  }, [goalsData]);

  return (
    <div className="space-y-6">
      
      {/* SELECTION GRID */}
      <div className="bg-white border border-slate-200/50 rounded-3xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            Análisis Estadístico de Rendimiento
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Filtra por equipo para evaluar curvas de puntuación y efectividad.</p>
        </div>

        {/* Dynamic drop-down */}
        <div className="relative w-full md:w-64">
          <label className="text-[10px] font-black font-mono tracking-wider text-slate-400 block uppercase mb-1.5">Equipo bajo inspección</label>
          <div className="relative">
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="w-full text-xs font-semibold appearance-none bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-2.5 pr-10 focus:outline-hidden focus:ring-1 focus:ring-slate-350 cursor-pointer"
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-3 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* DETAILED STATS ROW FOR FOCUS TEAM */}
      {activeTeam && activeStats && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* TEAM REPORT CARD & WIN RATIOS */}
          <div className="lg:col-span-5 bg-white border border-slate-200/50 rounded-3xl p-5 md:p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl select-none"
                  style={{ backgroundColor: `${activeTeam.color}15`, border: `1px solid ${activeTeam.color}35` }}
                >
                  {activeTeam.logoUrl.startsWith('data:image') || activeTeam.logoUrl.startsWith('http') ? (
                    <img src={activeTeam.logoUrl} alt={activeTeam.name} className="w-8 h-8 object-contain rounded-full" referrerPolicy="no-referrer" />
                  ) : (
                    <span>{activeTeam.logoUrl}</span>
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{activeTeam.name}</h3>
                  <span className="text-[11px] font-mono text-slate-400">Récord de Temporada</span>
                </div>
              </div>

              {/* CORE DATA VALUES */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-emerald-50 border border-emerald-100/50 p-3 rounded-xl text-center">
                  <span className="text-xl font-black text-emerald-600 font-mono block">{activeStats.won}</span>
                  <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider block font-sans">Victorias</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-center">
                  <span className="text-xl font-black text-slate-600 font-mono block">{activeStats.drawn}</span>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block font-sans">Empates</span>
                </div>
                <div className="bg-rose-50 border border-rose-100/50 p-3 rounded-xl text-center">
                  <span className="text-xl font-black text-rose-500 font-mono block">{activeStats.lost}</span>
                  <span className="text-[10px] font-semibold text-rose-600 uppercase tracking-wider block font-sans">Derrotas</span>
                </div>
              </div>

              {/* BAR GRAPH DISTRIBUTION W-D-L */}
              <div className="mt-5 space-y-1.5Packed">
                <div className="flex justify-between text-xs text-slate-500 font-semibold font-mono">
                  <span>Balance de Partidos</span>
                  <span>{activeStats.played} jugados</span>
                </div>
                {activeStats.played === 0 ? (
                  <p className="text-[11px] text-slate-400 py-2 italic">Sin encuentros para estimar proporción.</p>
                ) : (
                  <div className="w-full h-3 rounded-full flex overflow-hidden bg-slate-100 shadow-inner mt-1">
                    <div 
                      className="bg-emerald-500" 
                      style={{ width: `${(activeStats.won / activeStats.played) * 100}%` }} 
                      type="button" 
                      title={`Victorias: ${((activeStats.won / activeStats.played) * 100).toFixed(0)}%`}
                    />
                    <div 
                      className="bg-slate-400" 
                      style={{ width: `${(activeStats.drawn / activeStats.played) * 100}%` }}
                      type="button" 
                      title={`Empates: ${((activeStats.drawn / activeStats.played) * 100).toFixed(0)}%`}
                    />
                    <div 
                      className="bg-rose-500" 
                      style={{ width: `${(activeStats.lost / activeStats.played) * 100}%` }}
                      type="button" 
                      title={`Derrotas: ${((activeStats.lost / activeStats.played) * 100).toFixed(0)}%`}
                    />
                  </div>
                )}
                <div className="flex items-center gap-4 text-[10px] text-slate-400 mt-2 font-mono">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-xs" />
                    Ganados ({(activeStats.played > 0 ? (activeStats.won / activeStats.played * 100).toFixed(0) : 0)}%)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 bg-slate-350 rounded-xs" />
                    Empatados ({(activeStats.played > 0 ? (activeStats.drawn / activeStats.played * 100).toFixed(0) : 0)}%)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 bg-rose-500 rounded-xs" />
                    Perdidos ({(activeStats.played > 0 ? (activeStats.lost / activeStats.played * 100).toFixed(0) : 0)}%)
                  </span>
                </div>
              </div>
            </div>

            {/* KEY DATA BULLET INSIGHTS */}
            <div className="mt-5 pt-4 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between py-1">
                <span className="font-semibold">Efectividad general:</span>
                <span className="font-mono text-slate-900 font-bold">
                  {activeStats.played > 0 ? ((activeStats.points / (activeStats.played * 3)) * 100).toFixed(0) : 0}% de puntos
                </span>
              </div>
              <div className="flex justify-between py-1 border-t border-slate-50">
                <span className="font-semibold">Promedio goles marcados:</span>
                <span className="font-mono text-slate-900 font-bold">
                  {activeStats.played > 0 ? (activeStats.goalsFor / activeStats.played).toFixed(1) : 0} por juego
                </span>
              </div>
              <div className="flex justify-between py-1 border-t border-slate-50">
                <span className="font-semibold">Promedio goles concedidos:</span>
                <span className="font-mono text-slate-900 font-bold">
                  {activeStats.played > 0 ? (activeStats.goalsAgainst / activeStats.played).toFixed(1) : 0} por juego
                </span>
              </div>
            </div>
          </div>

          {/* TREND CHART: ACCUMULATED POINTS (SVG SPARKLINE) */}
          <div className="lg:col-span-7 bg-white border border-slate-200/50 rounded-3xl p-5 md:p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 font-sans">
                  <TrendingUp className="w-4 h-4 text-emerald-600 animate-pulse" />
                  Curva de Progresión de Puntos
                </h3>
                <p className="text-[11px] text-slate-400">Trayectoria de puntuación acumulada jornada tras jornada.</p>
              </div>
              <span className="text-[10px] font-mono bg-slate-100 text-slate-600 border border-slate-200 py-0.5 px-2 rounded-md">
                Pts Totales: {activeStats.points}
              </span>
            </div>

            {teamPointCurve.length <= 1 ? (
              <div className="text-center py-16 text-slate-400 italic">
                Aún no hay suficientes partidos completados para renderizar la curva de trayectoria de este equipo.
              </div>
            ) : (
              <div className="space-y-4">
                {/* SVG Visual Canvas */}
                <div className="relative w-full overflow-hidden bg-slate-50 border border-slate-150 rounded-2xl p-2.5">
                  <svg
                    viewBox="0 0 500 150"
                    className="w-full h-auto overflow-visible select-none"
                    style={{ maxHeight: '200px' }}
                  >
                    {/* Grid Lines */}
                    <line x1="40" y1="25" x2="460" y2="25" stroke="#e2e8f0" strokeDasharray="3 3" />
                    <line x1="40" y1="62.5" x2="460" y2="62.5" stroke="#e2e8f0" strokeDasharray="3 3" />
                    <line x1="40" y1="100" x2="460" y2="100" stroke="#e2e8f0" strokeDasharray="3 3" />
                    <line x1="40" y1="125" x2="460" y2="125" stroke="#cbd5e1" strokeWidth="1.5" />

                    {/* Left Axis Labels */}
                    <text x="32" y="30" fontSize="8" fill="#94a3b8" fontFamily="monospace" textAnchor="end">
                      {Math.max(...teamPointCurve.map(c => c.cumulPts), 3)} pts
                    </text>
                    <text x="32" y="78" fontSize="8" fill="#94a3b8" fontFamily="monospace" textAnchor="end">
                      {Math.ceil(Math.max(...teamPointCurve.map(c => c.cumulPts), 3) / 2)}
                    </text>
                    <text x="32" y="128" fontSize="8" fill="#94a3b8" fontFamily="monospace" textAnchor="end">0</text>

                    {/* Gradient under the line curve */}
                    <defs>
                      <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={activeTeam.color} stopOpacity="0.25" />
                        <stop offset="100%" stopColor={activeTeam.color} stopOpacity="0.01" />
                      </linearGradient>
                    </defs>
                    <path
                      d={`M ${curveCoords[0]?.x},125 ${curveCoords.map(c => `L ${c.x},${c.y}`).join(' ')} L ${curveCoords[curveCoords.length - 1]?.x},125 Z`}
                      fill="url(#curveGradient)"
                    />

                    {/* The Sparkline Curve */}
                    <polyline
                      fill="none"
                      stroke={activeTeam.color}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={linePointsString}
                    />

                    {/* Dot Overlays */}
                    {curveCoords.map((coord, i) => (
                      <g key={i} className="cursor-help">
                        <circle
                          cx={coord.x}
                          cy={coord.y}
                          r="5"
                          fill="#ffffff"
                          stroke={coord.result === 'W' ? '#10b981' : coord.result === 'L' ? '#ef4444' : '#6b7280'}
                          strokeWidth="2.5"
                        />
                        <title>
                          {i === 0 ? "Inicio de Temporada: 0 pts" : `Partido ${coord.matchNumber}: ${coord.cumulPts} puntos totales (${
                            coord.result === 'W' ? 'Ganó' : coord.result === 'L' ? 'Perdió' : 'Empató'
                          })`}
                        </title>
                      </g>
                    ))}
                  </svg>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono px-1">
                  <span>Jornada Inicial</span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> Ganado (+3)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-slate-400" /> Empatado (+1)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500" /> Perdido (+0)
                    </span>
                  </div>
                  <span>Última Jornada</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* COMPARATIVE ANALYSIS FOOTER: GOALS SCORED vs CONCEDED (BAR CHART OVERVIEW FOR ACTIVE SERIES) */}
      <div className="bg-white border border-slate-200/50 rounded-3xl p-5 md:p-6 shadow-xs">
        <div className="border-b border-slate-100 pb-4 mb-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 font-sans">
            <BarChart3 className="w-4 h-4 text-slate-500" />
            Análisis Comparativo del Torneo (Goles Marcados vs Concedidos)
          </h3>
          <p className="text-[11px] text-slate-400">Inspecciona el balance ofensivo y defensivo de todos los equipos ordenados por puntaje en la liga.</p>
        </div>

        {goalsData.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 italic text-center">Registra equipos para ver graficados los resultados de la liga.</p>
        ) : (
          <div className="space-y-5">
            {goalsData.map((data, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-slate-400">#{idx + 1}</span>
                    <span className="text-slate-950 font-bold">{data.name}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className="text-emerald-700 font-bold" title="Goles a Favor">F: {data.goalsFor}</span>
                    <span className="text-rose-600 font-bold" title="Goles en Contra">C: {data.goalsAgainst}</span>
                    <span className="text-slate-500 font-black">Pts: {data.points}</span>
                  </div>
                </div>

                {/* Double horizontal bar */}
                <div className="space-y-1">
                  {/* Goals For Bar */}
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${(data.goalsFor / maxGoalVal) * 100}%` }}
                    />
                  </div>
                  {/* Goals Against Bar */}
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className="bg-rose-400 rounded-full transition-all duration-500"
                      style={{ width: `${(data.goalsAgainst / maxGoalVal) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="flex items-center justify-center gap-6 text-[10px] text-slate-400 font-mono mt-2 bg-slate-55 p-2 rounded-xl border border-slate-100/50">
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-2 bg-emerald-500 rounded-xs" />
                Goles a Favor (Ataque)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-1.5 bg-rose-400 rounded-xs" />
                Goles en Contra (Defensa)
              </span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
