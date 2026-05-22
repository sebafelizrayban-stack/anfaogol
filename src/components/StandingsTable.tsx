/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo } from 'react';
import { Shield, ShieldCheck, Trophy, ArrowRight, TrendingUp, Award, Activity } from 'lucide-react';
import { Team, Match, TeamStats } from '../types';

interface StandingsTableProps {
  teams: Team[];
  matches: Match[];
  onTriggerEditTeams?: () => void;
}

export function computeStandings(teams: Team[], matches: Match[]): TeamStats[] {
  // Initialize map
  const statsMap: Record<string, TeamStats> = {};
  teams.forEach((t) => {
    statsMap[t.id] = {
      teamId: t.id,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      history: [],
    };
  });

  // Track matches sorted by date/time to build the history sequence correctly
  const sortedMatches = [...matches]
    .filter((m) => m.status === 'finished' || m.status === 'live')
    .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());

  sortedMatches.forEach((m) => {
    const homeStats = statsMap[m.homeTeamId];
    const awayStats = statsMap[m.awayTeamId];

    // If teams are missing from the current selected teams list, skip safely
    if (!homeStats || !awayStats) return;

    homeStats.played += 1;
    awayStats.played += 1;

    homeStats.goalsFor += m.homeScore;
    homeStats.goalsAgainst += m.awayScore;

    awayStats.goalsFor += m.awayScore;
    awayStats.goalsAgainst += m.homeScore;

    if (m.homeScore > m.awayScore) {
      homeStats.won += 1;
      homeStats.points += 3;
      homeStats.history.push('W');

      awayStats.lost += 1;
      awayStats.history.push('L');
    } else if (m.homeScore < m.awayScore) {
      awayStats.won += 1;
      awayStats.points += 3;
      awayStats.history.push('W');

      homeStats.lost += 1;
      homeStats.history.push('L');
    } else {
      homeStats.drawn += 1;
      homeStats.points += 1;
      homeStats.history.push('D');

      awayStats.drawn += 1;
      awayStats.points += 1;
      awayStats.history.push('D');
    }

    homeStats.goalDifference = homeStats.goalsFor - homeStats.goalsAgainst;
    awayStats.goalDifference = awayStats.goalsFor - awayStats.goalsAgainst;
  });

  // Convert to array and sort
  return Object.values(statsMap).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.teamId.localeCompare(b.teamId); // Fallback
  });
}

export default function StandingsTable({ teams, matches, onTriggerEditTeams }: StandingsTableProps) {
  const standings = useMemo(() => computeStandings(teams, matches), [teams, matches]);

  // Compute special analytics highlights for stats card section
  const highlights = useMemo(() => {
    if (standings.length === 0) return null;

    let bestAttack = standings[0];
    let bestDefense = standings[0];
    let streakTeam = standings[0];

    standings.forEach((s) => {
      if (s.goalsFor > bestAttack.goalsFor) bestAttack = s;
      if (s.played > 0 && s.goalsAgainst / s.played < bestDefense.goalsAgainst / (bestDefense.played || 1)) {
        bestDefense = s;
      }
      // Compute wins in last matches
      const winsCount = s.history.filter(h => h === 'W').length;
      const bestWinsCount = streakTeam.history.filter(h => h === 'W').length;
      if (winsCount > bestWinsCount) streakTeam = s;
    });

    const bestAttackTeam = teams.find(t => t.id === bestAttack.teamId);
    const bestDefenseTeam = teams.find(t => t.id === bestDefense.teamId);
    const streakTeamObj = teams.find(t => t.id === streakTeam.teamId);

    return {
      bestAttack: { stats: bestAttack, team: bestAttackTeam },
      bestDefense: { stats: bestDefense, team: bestDefenseTeam },
      bestStreak: { stats: streakTeam, team: streakTeamObj },
    };
  }, [standings, teams]);

  if (teams.length === 0) {
    return (
      <div className="text-center py-12 bg-white border border-slate-100 rounded-3xl shadow-sm">
        <Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">No hay equipos registrados</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
          Ingresa al Modo Administrador arriba a la derecha para agregar equipos a esta serie.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Real-time calculated badges / Highlights */}
      {highlights && highlights.bestAttack.team && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="stats-highlights-grid">
          {/* Best Attack */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-xs relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none translate-x-3 translate-y-3">
              <Trophy className="w-24 h-24 text-emerald-500" />
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600">
                <Trophy className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Poder Ofensivo</span>
                <span className="text-sm font-bold text-slate-800">{highlights.bestAttack.team.name}</span>
                <span className="text-xs text-slate-500 block mt-0.5">{highlights.bestAttack.stats.goalsFor} Goles en contra/propio</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black font-mono text-emerald-600 pr-1">{highlights.bestAttack.stats.goalsFor}</span>
              <span className="text-[10px] text-slate-400 block font-mono">Goles</span>
            </div>
          </div>

          {/* Best Defense */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-xs relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none translate-x-3 translate-y-3">
              <ShieldCheck className="w-24 h-24 text-blue-500" />
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-xl text-blue-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Muro Defensivo</span>
                <span className="text-sm font-bold text-slate-800">{highlights.bestDefense.team.name}</span>
                <span className="text-xs text-slate-500 block mt-0.5">{highlights.bestDefense.stats.goalsAgainst} Goles en contra</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black font-mono text-blue-600 pr-1">{highlights.bestDefense.stats.goalsAgainst}</span>
              <span className="text-[10px] text-slate-400 block font-mono">Concedidos</span>
            </div>
          </div>

          {/* Winning Streak */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-xs relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none translate-x-3 translate-y-3">
              <Activity className="w-24 h-24 text-amber-500" />
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-50 border border-amber-100 rounded-xl text-amber-600">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Mayor Efectividad</span>
                <span className="text-sm font-bold text-slate-800">{highlights.bestStreak.team?.name}</span>
                <div className="flex items-center gap-1 mt-0.5">
                  {highlights.bestStreak.stats.history.slice(-5).map((h, i) => (
                    <span key={i} className={`w-4 h-4 rounded-full text-[8px] font-bold flex items-center justify-center text-white ${
                      h === 'W' ? 'bg-emerald-500' : h === 'D' ? 'bg-slate-400' : 'bg-rose-500'
                    }`}>{h}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black font-mono text-amber-600 pr-1">
                {(highlights.bestStreak.stats.won / (highlights.bestStreak.stats.played || 1) * 100).toFixed(0)}%
              </span>
              <span className="text-[10px] text-slate-400 block font-mono">Victorias</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Standings Card containing positions table */}
      <div className="bg-white border border-slate-200/50 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-slate-500" />
              Tabla de Clasificación
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Calculada automáticamente en base a resultados registrados canónicamente.</p>
          </div>
          <div className="flex items-center gap-3">
            {onTriggerEditTeams && (
              <button
                onClick={onTriggerEditTeams}
                className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg cursor-pointer transition"
              >
                ✏️ Editar Equipos
              </button>
            )}
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 border border-emerald-500/20 text-emerald-600 bg-emerald-50/60 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              ACTUALIZADO EN VIVO
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-150" id="standings-table-root">
            <thead className="bg-slate-50 font-mono">
              <tr>
                <th scope="col" className="px-5 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest w-12 text-center">Pos</th>
                <th scope="col" className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Equipo</th>
                <th scope="col" className="px-3 py-3 text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest w-16">PJ</th>
                <th scope="col" className="px-3 py-3 text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest w-14">PG</th>
                <th scope="col" className="px-3 py-3 text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest w-14">PE</th>
                <th scope="col" className="px-3 py-3 text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest w-14">PP</th>
                <th scope="col" className="px-3 py-3 text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest w-16">GF</th>
                <th scope="col" className="px-3 py-3 text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest w-16">GC</th>
                <th scope="col" className="px-3 py-3 text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest w-16">DG</th>
                <th scope="col" className="px-5 py-3 text-center text-[11px] font-black text-slate-600 uppercase tracking-widest bg-slate-100/30 w-16">PTS</th>
                <th scope="col" className="px-5 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest w-36">Últimos</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100 font-sans">
              {standings.map((stat, idx) => {
                const team = teams.find((t) => t.id === stat.teamId);
                if (!team) return null;

                const position = idx + 1;
                // Highlight color for top spots vs danger spots
                const posBg = position === 1 ? 'bg-amber-100/80 text-amber-800 border-amber-300 font-bold' :
                              position <= 3 ? 'bg-emerald-100/60 text-emerald-800 border-emerald-300' :
                              'bg-slate-100 text-slate-700 border-slate-200';

                return (
                  <tr key={stat.teamId} className="hover:bg-slate-50 transition">
                    {/* Position */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-semibold border ${posBg}`}>
                        {position}
                      </span>
                    </td>

                    {/* Team logo & name */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-lg select-none border border-slate-200/60 shadow-xs"
                          style={{ backgroundColor: `${team.color}15`, borderLeft: `3px solid ${team.color}` }}
                        >
                          {team.logoUrl.startsWith('data:image') || team.logoUrl.startsWith('http') ? (
                            <img src={team.logoUrl} alt={team.name} className="w-6 h-6 object-contain rounded-full" referrerPolicy="no-referrer" />
                          ) : (
                            <span>{team.logoUrl || '🛡️'}</span>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-slate-900">{team.name}</span>
                      </div>
                    </td>

                    {/* Played */}
                    <td className="px-3 py-3.5 whitespace-nowrap text-center text-sm font-medium text-slate-500 font-mono">
                      {stat.played}
                    </td>

                    {/* Won */}
                    <td className="px-3 py-3.5 whitespace-nowrap text-center text-sm font-medium text-slate-600 font-mono">
                      {stat.won}
                    </td>

                    {/* Drawn */}
                    <td className="px-3 py-3.5 whitespace-nowrap text-center text-sm font-medium text-slate-500 font-mono">
                      {stat.drawn}
                    </td>

                    {/* Lost */}
                    <td className="px-3 py-3.5 whitespace-nowrap text-center text-sm font-medium text-slate-500 font-mono">
                      {stat.lost}
                    </td>

                    {/* Goals For */}
                    <td className="px-3 py-3.5 whitespace-nowrap text-center text-sm font-medium text-slate-500 font-mono">
                      {stat.goalsFor}
                    </td>

                    {/* Goals Against */}
                    <td className="px-3 py-3.5 whitespace-nowrap text-center text-sm font-medium text-slate-500 font-mono">
                      {stat.goalsAgainst}
                    </td>

                    {/* Goal Difference */}
                    <td className={`px-3 py-3.5 whitespace-nowrap text-center text-sm font-bold font-mono ${
                      stat.goalDifference > 0 ? 'text-emerald-700' : stat.goalDifference < 0 ? 'text-rose-600' : 'text-slate-400'
                    }`}>
                      {stat.goalDifference > 0 ? `+${stat.goalDifference}` : stat.goalDifference}
                    </td>

                    {/* Points */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-center text-base font-black text-slate-900 bg-slate-100/20 font-mono">
                      {stat.points}
                    </td>

                    {/* Form Trend Indicators */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {stat.played === 0 ? (
                        <span className="text-[11px] text-slate-400 font-mono">Sin partidos</span>
                      ) : (
                        <div className="flex items-center gap-1">
                          {stat.history.slice(-5).map((outcome, index) => {
                            let dotColor = 'bg-slate-400 hover:bg-slate-500';
                            let outcomeChar = 'E';
                            if (outcome === 'W') {
                              dotColor = 'bg-emerald-500 hover:bg-emerald-600';
                              outcomeChar = 'G';
                            } else if (outcome === 'L') {
                              dotColor = 'bg-rose-500 hover:bg-rose-600';
                              outcomeChar = 'P';
                            }
                            return (
                              <span
                                key={index}
                                title={outcome === 'W' ? 'Ganado' : outcome === 'D' ? 'Empatado' : 'Perdido'}
                                className={`w-5 h-5 rounded-full ${dotColor} text-white text-[9px] font-black flex items-center justify-center cursor-help transition-all shadow-xs`}
                              >
                                {outcomeChar}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
