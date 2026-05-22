/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutGrid, Trophy, Users, X, Sparkles, Star, ChevronRight } from 'lucide-react';
import { Series, Team } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  seriesList: Series[];
  activeSeriesId: string;
  onSelectSeries: (id: string) => void;
  teamsList: Record<string, Team[]>;
}

export default function Sidebar({
  isOpen,
  onClose,
  seriesList,
  activeSeriesId,
  onSelectSeries,
  teamsList,
}: SidebarProps) {
  
  // Custom decorative badges/emojis based on series ID or name
  const getSeriesDecorations = (id: string, name: string) => {
    if (name.toLowerCase().includes('profesional') || name.toLowerCase().includes('pro') || id === 's1') {
      return { emoji: '🏆', border: 'border-amber-200 hover:border-amber-400', badgeBg: 'bg-amber-100 text-amber-700' };
    }
    if (name.toLowerCase().includes('promoción') || id === 's2') {
      return { emoji: '⚡', border: 'border-blue-200 hover:border-blue-400', badgeBg: 'bg-blue-100 text-blue-700' };
    }
    if (name.toLowerCase().includes('femenina')) {
      return { emoji: '👑', border: 'border-pink-200 hover:border-pink-400', badgeBg: 'bg-pink-100 text-pink-700' };
    }
    if (name.toLowerCase().includes('juvenil') || name.toLowerCase().includes('sub')) {
      return { emoji: '🌱', border: 'border-emerald-200 hover:border-emerald-400', badgeBg: 'bg-emerald-100 text-emerald-700' };
    }
    return { emoji: '⚽', border: 'border-slate-200 hover:border-slate-400', badgeBg: 'bg-slate-100 text-slate-700' };
  };

  return (
    <>
      {/* 1. MOBILE DRAWER OVERLAY (Slide Over) */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 left-0 w-80 max-w-xs bg-slate-900 text-white shadow-2xl flex flex-col z-50 border-r border-slate-800"
            >
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-black font-mono tracking-widest text-slate-400 flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-emerald-400" />
                  PARRILLA DE SERIES
                </span>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain touch-pan-y p-4 space-y-3">
                {seriesList.map((series) => {
                  const isActive = series.id === activeSeriesId;
                  const numTeams = teamsList[series.id]?.length || 0;
                  const decor = getSeriesDecorations(series.id, series.name);

                  return (
                    <button
                      key={series.id}
                      onClick={() => {
                        onSelectSeries(series.id);
                        onClose();
                      }}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 flex items-center justify-between cursor-pointer group ${
                        isActive
                          ? 'bg-emerald-500 border-emerald-450 text-slate-950 shadow-md transform scale-[1.01]'
                          : 'bg-slate-950/40 border-slate-850 text-slate-300 hover:bg-slate-800/50 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl group-hover:scale-110 transition duration-200">
                          {decor.emoji}
                        </span>
                        <div>
                          <p className="text-xs font-bold leading-tight font-display">
                            {series.name}
                          </p>
                          <p className={`text-[10px] mt-0.5 font-mono ${isActive ? 'text-slate-800' : 'text-slate-500'}`}>
                            {numTeams} {numTeams === 1 ? 'equipo inscrito' : 'equipos inscritos'}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 ${
                        isActive ? 'text-slate-950' : 'text-slate-500'
                      }`} />
                    </button>
                  );
                })}
              </div>

              <div className="p-4 border-t border-slate-800 bg-slate-950/60">
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                  <p>Selecciona una serie para filtrar fixtures, tablas de posiciones y goleadores.</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. DESKTOP SYSTEM SIDEBAR PANEL (Static Column on left) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="hidden lg:flex flex-col shrink-0 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs self-start lg:sticky lg:top-24 max-h-[calc(100vh-120px)] overflow-hidden space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-[10px] font-black font-mono tracking-widest text-slate-400 flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-emerald-500" />
                PARRILLA DE SERIES
              </span>
              <button
                onClick={onClose}
                title="Contraer Menú Lateral"
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5 flex-1 min-h-0 overflow-y-auto pr-1">
              {seriesList.map((series) => {
                const isActive = series.id === activeSeriesId;
                const numTeams = teamsList[series.id]?.length || 0;
                const decor = getSeriesDecorations(series.id, series.name);

                return (
                  <button
                    key={series.id}
                    onClick={() => onSelectSeries(series.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all duration-200 flex items-center justify-between cursor-pointer group ${
                      isActive
                        ? 'bg-emerald-500 border-emerald-605 text-slate-950 font-bold shadow-xs transform scale-[1.01]'
                        : 'bg-slate-50 border-slate-150 text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-350'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-lg shrink-0 group-hover:scale-115 transition duration-200">
                        {decor.emoji}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold leading-tight font-display truncate">
                          {series.name}
                        </p>
                        <p className={`text-[9px] mt-0.5 font-mono ${isActive ? 'text-slate-800 font-semibold' : 'text-slate-400'}`}>
                          {numTeams} {numTeams === 1 ? 'equipo' : 'equipos'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className={`w-3 h-3 transition-transform group-hover:translate-x-0.5 shrink-0 ${
                      isActive ? 'text-slate-950' : 'text-slate-400'
                    }`} />
                  </button>
                );
              })}
            </div>

            <div className="pt-2">
              <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-xl flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[10px] leading-tight text-slate-500">
                  Tip: Selecciona una serie para actualizar todo el portal de manera dinámica y segura.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
