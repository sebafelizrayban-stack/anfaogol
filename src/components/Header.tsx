/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldAlert, Trophy, Settings, LogOut, User as UserIcon, LayoutGrid } from 'lucide-react';
import { Series, User } from '../types';

interface HeaderProps {
  seriesList: Series[];
  activeSeriesId: string;
  onSelectSeries: (id: string) => void;
  isAdmin: boolean;
  currentUser: User | null;
  onLogout: () => void;
  activeSubTab: 'matches' | 'standings' | 'stats' | 'admin';
  onChangeSubTab: (tab: 'matches' | 'standings' | 'stats' | 'admin') => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export default function Header({
  seriesList,
  activeSeriesId,
  onSelectSeries,
  isAdmin,
  currentUser,
  onLogout,
  activeSubTab,
  onChangeSubTab,
  isSidebarOpen,
  onToggleSidebar,
}: HeaderProps) {
  const activeSeries = seriesList.find((s) => s.id === activeSeriesId);
  
  const userInitials = currentUser?.name
    ? currentUser.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <header className="bg-emerald-700 text-white shrink-0 sticky top-0 z-40 shadow-md border-b border-emerald-850">
      {/* Top Main Navigation Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand/Logo Area */}
          <div className="flex items-center space-x-3">
            {/* Grid Icon to open/close team series sidebar */}
            <button
              onClick={onToggleSidebar}
              id="sidebar-toggle-btn"
              title={isSidebarOpen ? "Contraer menú de series" : "Mostrar menú de series"}
              className={`p-2 px-3 rounded-xl transition cursor-pointer active:scale-95 flex items-center gap-1.5 border ${
                isSidebarOpen 
                  ? 'bg-amber-500 border-amber-400 text-slate-950 hover:bg-amber-400' 
                  : 'bg-emerald-800 border-emerald-600/50 text-emerald-100 hover:bg-emerald-750 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4.5 h-4.5" />
              <span className="text-[9px] font-black uppercase tracking-wider">Series</span>
            </button>

            <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center font-black text-lg italic text-slate-950 font-display shadow-md">
              A
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-1.5 font-display uppercase">
                AFAOGOL
                <span className="text-emerald-250 font-normal text-xs ml-1 pl-1.5 border-l border-emerald-800 hidden sm:inline text-[11px]">
                  Futbol Amateur Ovalle
                </span>
                <span className="bg-amber-400 text-slate-950 border border-amber-300 text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wide animate-pulse">
                  TURNO LIVE
                </span>
              </h1>
              <p className="text-[10px] text-emerald-200 font-mono leading-none mt-0.5 hidden sm:block">Control de Canchas, Marcadores e Incidencias</p>
            </div>
          </div>

          {/* Controls & Mini Admin Profile on Right */}
          <div className="flex items-center space-x-3">
            {/* Live Indicator Dot */}
            <div className="hidden lg:flex items-center bg-emerald-800/40 rounded-full px-3 py-1 border border-emerald-600/60 text-[10px] font-bold font-mono text-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-550 mr-2 animate-pulse"></span>
              LIGA OFICIAL CHILE
            </div>

            {/* User Profile Details */}
            {currentUser && (
              <div className="flex items-center space-x-2.5">
                <div className="text-right leading-none hidden sm:block">
                  <p className="text-[11px] font-extrabold text-white font-display">{currentUser.name}</p>
                  <p className={`text-[9px] font-mono font-bold mt-0.5 ${
                    currentUser.role === 'admin' ? 'text-amber-300' : 'text-emerald-200'
                  }`}>
                    {currentUser.role === 'admin' ? '🛡️ Administrador' : '👁️ Lector / Visor'}
                  </p>
                </div>
                
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-extrabold font-mono shadow-md ${
                  currentUser.role === 'admin'
                    ? 'bg-amber-400 border-amber-300 text-slate-950'
                    : 'bg-emerald-850 border-emerald-600 text-white'
                }`}>
                  {userInitials}
                </div>

                {/* Logout Button */}
                <button
                  onClick={onLogout}
                  title="Cerrar Sesión Segura"
                  className="p-2 rounded-lg border border-emerald-600 bg-emerald-800 text-white hover:text-orange-400 hover:bg-emerald-850 transition cursor-pointer active:scale-95 flex items-center justify-center ml-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Premium Content Navigation Tabs: Clean white bar beneath */}
      <div className="bg-white border-b border-slate-200 text-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-6 sm:space-x-8 text-xs overflow-x-auto scrollbar-hide">
            <button
              onClick={() => onChangeSubTab('matches')}
              className={`py-3.5 px-1 border-b-2 font-semibold transition-all cursor-pointer shrink-0 font-display flex items-center gap-1.5 ${
                activeSubTab === 'matches'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              📋 El Fixture y Resultados
            </button>
            <button
              onClick={() => onChangeSubTab('standings')}
              className={`py-3.5 px-1 border-b-2 font-semibold transition-all cursor-pointer shrink-0 font-display flex items-center gap-1.5 ${
                activeSubTab === 'standings'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              📊 Tabla de Posiciones
            </button>
            <button
              onClick={() => onChangeSubTab('stats')}
              className={`py-3.5 px-1 border-b-2 font-semibold transition-all cursor-pointer shrink-0 font-display flex items-center gap-1.5 ${
                activeSubTab === 'stats'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              📈 Estadísticas y Camarín
            </button>
            
            {isAdmin && (
              <button
                onClick={() => onChangeSubTab('admin')}
                className={`py-3.5 px-1 border-b-2 font-semibold transition-all ml-auto cursor-pointer shrink-0 font-display flex items-center gap-1.5 ${
                  activeSubTab === 'admin'
                    ? 'border-amber-500 text-amber-600 font-bold'
                    : 'border-transparent text-amber-500 hover:text-amber-600'
                }`}
              >
                🛠️ Administrador ({activeSeries?.name})
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
