/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  X, Calendar, Clock, Trophy, MessageSquare, Send, User, 
  Image as ImageIcon, Video, AlertTriangle, ArrowRight 
} from 'lucide-react';
import { Match, Team } from '../types';

interface MatchDetailModalProps {
  match: Match;
  homeTeam: Team;
  awayTeam: Team;
  onClose: () => void;
  onAddComment: (matchId: string, text: string, username: string) => void;
}

export default function MatchDetailModal({
  match,
  homeTeam,
  awayTeam,
  onClose,
  onAddComment,
}: MatchDetailModalProps) {
  const [commentText, setCommentText] = useState('');
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('football_username') || `Hincha_${Math.floor(1000 + Math.random() * 9000)}`;
  });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    onAddComment(match.id, commentText.trim(), username.trim() || 'Anónimo');
    localStorage.setItem('football_username', username.trim() || 'Anónimo');
    setCommentText('');
  };

  // Sort events chronologically by minute
  const sortedEvents = [...match.events].sort((a, b) => a.minute - b.minute);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs"
      />

      {/* Modal Dialog Content */}
      <motion.div
        initial={{ y: 20, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.98 }}
        transition={{ type: 'spring', duration: 0.4 }}
        className="relative bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl z-10"
      >
        {/* Header Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/85 hover:bg-slate-700/90 transition cursor-pointer z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* TOP SCOREBOARD AREA */}
        <div className="bg-radial from-slate-800 to-slate-950 p-6 md:p-8 text-center border-b border-slate-800 relative">
          {/* Status Badge */}
          <div className="flex justify-center mb-3">
            <span className={`text-[10px] font-bold font-mono px-3 py-1 rounded-full uppercase tracking-widest ${
              match.status === 'live' ? 'bg-rose-500 text-white animate-pulse' :
              match.status === 'finished' ? 'bg-slate-700 text-slate-300' :
              'bg-blue-500/10 text-blue-400 border border-blue-500/25'
            }`}>
              {match.status === 'live' ? '🟢 EN VIVO' : 
               match.status === 'finished' ? '🏁 FINALIZADO' : '📅 PROGRAMADO'}
            </span>
          </div>

          <div className="flex items-center justify-center gap-4 sm:gap-10">
            {/* Home Team */}
            <div className="flex-1 text-right">
              <div className="flex flex-col items-end gap-1">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-inner border border-slate-700/50"
                  style={{ backgroundColor: `${homeTeam.color}20` }}
                >
                  {homeTeam.logoUrl.startsWith('data:image') || homeTeam.logoUrl.startsWith('http') ? (
                    <img src={homeTeam.logoUrl} alt={homeTeam.name} className="w-10 h-10 object-contain rounded-full" referrerPolicy="no-referrer" />
                  ) : (
                    <span>{homeTeam.logoUrl || '🛡️'}</span>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-100 mt-2 truncate max-w-[150px] sm:max-w-[200px]">
                  {homeTeam.name}
                </h3>
                <span className="text-[10px] font-semibold text-emerald-400 font-mono tracking-wide">LOCAL</span>
              </div>
            </div>

            {/* Score Display */}
            <div className="shrink-0 flex items-center gap-3">
              {match.status === 'scheduled' ? (
                <div className="bg-slate-800/60 border border-slate-700 text-slate-300 py-2.5 px-5 rounded-2xl">
                  <span className="text-xs font-bold block font-mono text-slate-400">VS</span>
                  <span className="text-sm font-semibold text-slate-100 font-mono block mt-1">{match.date} {match.time}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white select-none">
                    {match.homeScore}
                  </span>
                  <span className="text-xl font-bold text-slate-600 font-mono select-none">-</span>
                  <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white select-none">
                    {match.awayScore}
                  </span>
                </div>
              )}
            </div>

            {/* Away Team */}
            <div className="flex-1 text-left">
              <div className="flex flex-col items-start gap-1">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-inner border border-slate-700/50"
                  style={{ backgroundColor: `${awayTeam.color}20` }}
                >
                  {awayTeam.logoUrl.startsWith('data:image') || awayTeam.logoUrl.startsWith('http') ? (
                    <img src={awayTeam.logoUrl} alt={awayTeam.name} className="w-10 h-10 object-contain rounded-full" referrerPolicy="no-referrer" />
                  ) : (
                    <span>{awayTeam.logoUrl || '🛡️'}</span>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-100 mt-2 truncate max-w-[150px] sm:max-w-[200px]">
                  {awayTeam.name}
                </h3>
                <span className="text-[10px] font-semibold text-blue-400 font-mono tracking-wide">VISITANTE</span>
              </div>
            </div>
          </div>

          {/* Date and Place Footer inside score Area */}
          <div className="flex items-center justify-center gap-4 mt-4 text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              {match.date}
            </span>
            <span className="text-slate-700">•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              {match.time} hs
            </span>
          </div>
        </div>

        {/* MAIN BODY AREA WITH DUAL COLS */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0 bg-slate-900/40">
          
          {/* LEFT PANEL: TIMELINE & EVENTS */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2 mb-3 flex items-center gap-1.5 font-mono">
              <Trophy className="w-4 h-4 text-emerald-500" />
              Eventos e Incidencias del Juego
            </h4>

            {sortedEvents.length === 0 ? (
              <div className="text-center py-10 bg-slate-800/25 border border-slate-800/60 rounded-2xl">
                <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">Ningún evento registrado en este encuentro.</p>
                {match.status === 'scheduled' && (
                  <p className="text-[10px] text-slate-500 mt-1">El partido aún no ha iniciado.</p>
                )}
              </div>
            ) : (
              <div className="relative pl-5 border-l-2 border-slate-800 space-y-5 ml-2.5 pb-2">
                {sortedEvents.map((event) => {
                  const evTeam = event.teamId === homeTeam.id ? homeTeam : awayTeam;
                  const isHome = event.teamId === homeTeam.id;

                  return (
                    <div key={event.id} className="relative group">
                      {/* Timeline Dot with matching color */}
                      <span className={`absolute -left-[27px] top-1.5 w-3 h-3 rounded-full border-2 border-slate-900 shadow-sm ${
                        event.type === 'goal' ? 'bg-emerald-400' :
                        event.type === 'yellow_card' ? 'bg-amber-400' :
                        event.type === 'red_card' ? 'bg-rose-500' :
                        event.type === 'substitute' ? 'bg-blue-400' : 'bg-slate-400'
                      }`} />

                      <div className="bg-slate-800/45 hover:bg-slate-850 border border-slate-800/80 rounded-xl p-3 flex items-start gap-2.5 transition">
                        {/* Minute Circle Badge */}
                        <span className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold font-mono px-2 py-1 rounded-lg shrink-0 select-none">
                          {event.minute}'
                        </span>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-slate-150">
                              {event.playerName}
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono py-0.5 px-1.5 bg-slate-800/80 border border-slate-750 rounded-full">
                              {evTeam.name}
                            </span>
                          </div>

                          {event.description && (
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                              {event.description}
                            </p>
                          )}

                          {/* Detail indicators */}
                          <div className="flex items-center gap-1 mt-1.5">
                            {event.type === 'goal' && (
                              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 px-1.5 py-0.5 border border-emerald-500/25 rounded-md">
                                ⚽ ¡Gol!
                              </span>
                            )}
                            {event.type === 'yellow_card' && (
                              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider bg-amber-500/10 px-1.5 py-0.5 border border-amber-500/25 rounded-md">
                                🟨 Tarjeta Amarilla
                              </span>
                            )}
                            {event.type === 'red_card' && (
                              <span className="text-[10px] text-rose-500 font-bold uppercase tracking-wider bg-rose-500/10 px-1.5 py-0.5 border border-rose-500/25 rounded-md">
                                🟥 Tarjeta Roja
                              </span>
                            )}
                            {event.type === 'substitute' && (
                              <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider bg-blue-500/10 px-1.5 py-0.5 border border-blue-500/25 rounded-md">
                                🔄 Sustitución
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* MEDIA GALLERY SECTION IN LEFT LOWER PART IF EXISTS */}
            <div className="pt-4 border-t border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 mb-3 flex items-center gap-1.5 font-mono">
                <ImageIcon className="w-4 h-4 text-emerald-500" />
                Archivos Multimedia de Encuentro
              </h4>
              {match.media.length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-800/15 text-center text-xs text-slate-500 font-sans border border-slate-800/30">
                  Ningún archivo multimedia subido aún para este partido.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3" id="match-media-gallery">
                  {match.media.map((med) => (
                    <div key={med.id} className="relative group overflow-hidden bg-slate-950 border border-slate-800 rounded-xl max-h-48">
                      <img src={med.url} alt={med.caption} className="w-full h-32 object-cover opacity-85 hover:opacity-100 transition cursor-pointer" referrerPolicy="no-referrer" />
                      <div className="p-2 bg-slate-900 border-t border-slate-850">
                        <p className="text-[10px] text-slate-300 truncate font-sans" title={med.caption}>
                          {med.caption || 'Captura de pantalla'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANEL: COMMENTS SECTION */}
          <div className="flex flex-col border-l border-slate-800/65 pl-1 md:pl-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2 mb-3 flex items-center gap-1.5 font-mono">
              <MessageSquare className="w-4 h-4 text-emerald-500" />
              Sección de Comentarios ({match.comments.length})
            </h4>

            {/* Comment Feed */}
            <div className="flex-1 overflow-y-auto space-y-3 min-h-[160px] max-h-[300px] pr-1.5 scrollbar-thin">
              {match.comments.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <MessageSquare className="w-8 h-8 opacity-20 mx-auto mb-2" />
                  <p className="text-xs font-sans">No hay comentarios aún. ¡Sé el primero en opinar!</p>
                </div>
              ) : (
                match.comments.map((comm) => (
                  <div key={comm.id} className="bg-slate-800/40 border border-slate-800/85 p-3 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs">
                        <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="font-bold text-slate-200">{comm.user}</span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono">
                        {new Date(comm.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-sans leading-relaxed">
                      {comm.text}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Comment Input */}
            <form onSubmit={handleSubmitComment} className="mt-4 pt-3 border-t border-slate-800 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Tu Nombre</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nombre o @alias"
                    className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Escribe tu Mensaje</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="¿Gol con la mano o golazo? Escribe aquí..."
                    className="flex-1 text-xs bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-200 focus:outline-hidden focus:border-emerald-500 placeholder:text-slate-600"
                  />
                  <button
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-3 py-2 rounded-lg text-xs flex items-center justify-center transition cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </form>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
