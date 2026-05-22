/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  Trophy, Search, Calendar, ChevronRight, AlertCircle, Plus, 
  MessageSquare, Image as ImageIcon, Sparkles, Volume2, ShieldAlert, Check
} from 'lucide-react';
import { Series, Team, Match, PushNotification, MatchComment, User } from './types';
import { initialSeries, initialTeams, initialMatches } from './initialData';

// Modular imports
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import StandingsTable from './components/StandingsTable';
import MatchDetailModal from './components/MatchDetailModal';
import PerformanceCharts from './components/PerformanceCharts';
import AdminPanel from './components/AdminPanel';
import NotificationToast from './components/NotificationToast';
import LoginModal from './components/LoginModal';

export default function App() {
  // --- GENERAL STATE ENGINE ---
  const [seriesList, setSeriesList] = useState<Series[]>(() => {
    const saved = localStorage.getItem('fb_series');
    return saved ? JSON.parse(saved) : initialSeries;
  });

  const [teamsList, setTeamsList] = useState<Record<string, Team[]>>(() => {
    const saved = localStorage.getItem('fb_teams');
    return saved ? JSON.parse(saved) : initialTeams;
  });

  const [matchesList, setMatchesList] = useState<Match[]>(() => {
    const saved = localStorage.getItem('fb_matches');
    return saved ? JSON.parse(saved) : initialMatches;
  });

  const [notifications, setNotifications] = useState<PushNotification[]>([]);

  // Navigation trackers
  const [activeSeriesId, setActiveSeriesId] = useState<string>('s1');
  const [activeSubTab, setActiveSubTab] = useState<'matches' | 'standings' | 'stats' | 'admin'>('matches');
  
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('afaogol_active_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const isAdmin = currentUser?.role === 'admin';
  const [adminSubTab, setAdminSubTab] = useState<'series' | 'teams' | 'matches' | 'scorer' | 'users'>('scorer');
  const [selectedMatchDetailId, setSelectedMatchDetailId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isMobileFrameActive, setIsMobileFrameActive] = useState<boolean>(true);

  // Match list internal filters
  const [matchFilter, setMatchFilter] = useState<'all' | 'live' | 'finished' | 'scheduled'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('fb_series', JSON.stringify(seriesList));
  }, [seriesList]);

  useEffect(() => {
    localStorage.setItem('fb_teams', JSON.stringify(teamsList));
  }, [teamsList]);

  useEffect(() => {
    localStorage.setItem('fb_matches', JSON.stringify(matchesList));
  }, [matchesList]);

  // --- HANDLERS FOR ADMINISTRATIVE COMMANDS ---

  // Series renaming
  const handleUpdateSeriesNames = (updatedSeries: Series[]) => {
    setSeriesList(updatedSeries);
  };

  // Add series
  const handleAddSeries = (name: string) => {
    const newId = `s_${Date.now()}`;
    const newSeries: Series = {
      id: newId,
      name,
    };
    setSeriesList((prev) => [...prev, newSeries]);
    setTeamsList((prev) => ({
      ...prev,
      [newId]: [],
    }));
    triggerPushNotification(
      'general',
      'info',
      '🏆 Nueva Serie Creada',
      `Se ha creado "${name}" satisfactoriamente.`
    );
  };

  // Delete series
  const handleDeleteSeries = (seriesId: string) => {
    if (seriesList.length <= 1) {
      triggerPushNotification(
        'general',
        'info',
        '⚠️ Error',
        'No se puede eliminar la única serie del sistema.'
      );
      return;
    }

    const seriesToDelete = seriesList.find((s) => s.id === seriesId);
    setSeriesList((prev) => prev.filter((s) => s.id !== seriesId));
    
    // Clean up teams and matches of that series
    setTeamsList((prev) => {
      const copy = { ...prev };
      delete copy[seriesId];
      return copy;
    });

    setMatchesList((prev) => prev.filter((m) => m.seriesId !== seriesId));

    // Update activeSeriesId if we deleted the current active one
    if (activeSeriesId === seriesId) {
      const remaining = seriesList.filter((s) => s.id !== seriesId);
      if (remaining.length > 0) {
        setActiveSeriesId(remaining[0].id);
      }
    }

    triggerPushNotification(
      'general',
      'info',
      '🗑️ Serie Eliminada',
      `Se ha eliminado "${seriesToDelete?.name || 'la serie'}" y limpiado sus equipos/partidos.`
    );
  };

  // Team manipulations (Add, Edit, Delete)
  const handleAddTeam = (seriesId: string, teamData: Omit<Team, 'id'>) => {
    const newTeam: Team = {
      ...teamData,
      id: `t_${seriesId}_${Date.now()}`,
    };
    setTeamsList((prev) => {
      const currentList = prev[seriesId] || [];
      return {
        ...prev,
        [seriesId]: [...currentList, newTeam],
      };
    });
    
    // Quick notification on adding news
    triggerPushNotification(
      'general',
      'info',
      '🛡️ Nuevo Equipo Registrado',
      `El equipo "${teamData.name}" se ha sumado a la liga con éxito.`
    );
  };

  const handleAddTeamsBulk = (seriesId: string, teamsData: Omit<Team, 'id'>[]) => {
    setTeamsList((prev) => {
      const working = { ...prev };
      const seriesToEnroll = seriesId === 'all' 
        ? seriesList.map(s => s.id) 
        : [seriesId];

      let addedCount = 0;

      seriesToEnroll.forEach((sId) => {
        const currentList = [...(working[sId] || [])];
        const existingNames = new Set(currentList.map(t => t.name.toLowerCase().trim()));
        
        const newTeamsUnique = teamsData
          .filter(teamData => !existingNames.has(teamData.name.toLowerCase().trim()))
          .map((teamData, index) => ({
            ...teamData,
            id: `t_${sId}_${Date.now()}_b${index}`,
          }));

        if (newTeamsUnique.length > 0) {
          working[sId] = [...currentList, ...newTeamsUnique];
          addedCount += newTeamsUnique.length;
        }
      });

      return working;
    });

    triggerPushNotification(
      'general',
      'info',
      '🛡️ Inscripción de Clubes',
      `Procedimiento de inscripción completado exitosamente.`
    );
  };

  const handleUpdateTeam = (seriesId: string, updatedTeam: Team) => {
    setTeamsList((prev) => {
      const currentList = prev[seriesId] || [];
      const updatedList = currentList.map((t) => (t.id === updatedTeam.id ? updatedTeam : t));
      return {
        ...prev,
        [seriesId]: updatedList,
      };
    });
  };

  const handleDeleteTeam = (seriesId: string, teamId: string) => {
    // Confirm safety check - remove matches associated with team to prevent crashes
    setTeamsList((prev) => {
      const currentList = prev[seriesId] || [];
      return {
        ...prev,
        [seriesId]: currentList.filter((t) => t.id !== teamId),
      };
    });
    setMatchesList((prev) => prev.filter((m) => m.homeTeamId !== teamId && m.awayTeamId !== teamId));
  };

  // Match manipulations (Add, Update, Delete)
  const handleAddMatch = (matchData: Omit<Match, 'id' | 'events' | 'media' | 'comments'>) => {
    const newMatch: Match = {
      ...matchData,
      id: `m_${Date.now()}`,
      events: [],
      media: [],
      comments: [],
    };
    setMatchesList((prev) => [...prev, newMatch]);

    const homeTeam = (teamsList[activeSeriesId] || []).find(t => t.id === matchData.homeTeamId);
    const awayTeam = (teamsList[activeSeriesId] || []).find(t => t.id === matchData.awayTeamId);

    triggerPushNotification(
      newMatch.id,
      'info',
      '📅 Partido Programado',
      `Creado en calendario: ${homeTeam?.name || 'Local'} vs ${awayTeam?.name || 'Visitante'} (${matchData.date} - ${matchData.time} hs)`
    );
  };

  const handleUpdateMatch = (updatedMatch: Match) => {
    setMatchesList((prev) => prev.map((m) => (m.id === updatedMatch.id ? updatedMatch : m)));
  };

  const handleDeleteMatch = (matchId: string) => {
    setMatchesList((prev) => prev.filter((m) => m.id !== matchId));
  };

  // Trigger floating simulation notification toast
  const triggerPushNotification = (
    matchId: string,
    type: 'goal' | 'card' | 'status' | 'info',
    title: string,
    body: string
  ) => {
    const newNotif: PushNotification = {
      id: `notif_${Date.now()}_${Math.random()}`,
      matchId,
      title,
      body,
      timestamp: new Date().toISOString(),
      type,
    };

    setNotifications((prev) => [...prev, newNotif]);

    // Auto-remove notification from popup view after 7.5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== newNotif.id));
    }, 7500);
  };

  const handleDismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // --- USER LEVEL INTERACTIONS ---

  // Add Comment from selected match detail modal
  const handleAddComment = (matchId: string, text: string, user: string) => {
    const newComment: MatchComment = {
      id: `c_${Date.now()}`,
      user,
      text,
      timestamp: new Date().toISOString(),
    };

    setMatchesList((prev) =>
      prev.map((m) => {
        if (m.id === matchId) {
          return {
            ...m,
            comments: [newComment, ...m.comments],
          };
        }
        return m;
      })
    );
  };

  // Filter schedules and results based on current user inputs
  const currentTeams = teamsList[activeSeriesId] || [];
  const activeSeriesMatchesSorted = matchesList
    .filter((m) => m.seriesId === activeSeriesId)
    .sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime()); // Newest first

  const filteredMatches = activeSeriesMatchesSorted.filter((m) => {
    // 1. Status Filter
    if (matchFilter === 'live' && m.status !== 'live') return false;
    if (matchFilter === 'finished' && m.status !== 'finished') return false;
    if (matchFilter === 'scheduled' && m.status !== 'scheduled') return false;

    // 2. Search Query filter (checks team names)
    if (searchQuery.trim()) {
      const hTeam = currentTeams.find((t) => t.id === m.homeTeamId)?.name.toLowerCase() || '';
      const aTeam = currentTeams.find((t) => t.id === m.awayTeamId)?.name.toLowerCase() || '';
      const query = searchQuery.toLowerCase();
      return hTeam.includes(query) || aTeam.includes(query);
    }

    return true;
  });

  // Target object when viewing match detail modal
  const activeDetailMatch = matchesList.find((m) => m.id === selectedMatchDetailId);
  const detailHomeTeam = activeDetailMatch ? currentTeams.find((t) => t.id === activeDetailMatch.homeTeamId) : null;
  const detailAwayTeam = activeDetailMatch ? currentTeams.find((t) => t.id === activeDetailMatch.awayTeamId) : null;
  const renderSimulatorControls = () => (
    <div className="hidden md:flex items-center justify-between bg-white border-2 border-emerald-600 rounded-3xl p-3 mb-6 w-full max-w-sm shadow-lg relative z-40 select-none text-slate-800">
      <div className="flex items-center gap-2 px-1">
        <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse shrink-0" />
        <span className="text-[10px] font-black font-mono tracking-wider text-emerald-800 uppercase flex items-center gap-1">🏆 AFAOGOL VISTA</span>
      </div>
      <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200">
        <button
          onClick={() => {
            setIsMobileFrameActive(true);
            setIsSidebarOpen(false);
          }}
          className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition cursor-pointer select-none ${
            isMobileFrameActive
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          📱 Vista Móvil
        </button>
        <button
          onClick={() => {
            setIsMobileFrameActive(false);
            setIsSidebarOpen(true);
          }}
          className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition cursor-pointer select-none ${
            !isMobileFrameActive
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          💻 Completa
        </button>
      </div>
    </div>
  );

  if (!currentUser) {
    return (
      <div className={`min-h-screen ${isMobileFrameActive ? 'bg-stone-100 flex flex-col items-center justify-center p-4 font-sans select-none' : 'bg-stone-50 flex flex-col items-center justify-center p-4 font-sans'}`}>
        {isMobileFrameActive && renderSimulatorControls()}
        
        {isMobileFrameActive ? (
          /* Simulated Smartphone Frame containing Login Screen */
          <div className="w-full md:w-[410px] h-[840px] md:rounded-[44px] bg-white relative flex flex-col border-0 md:border-[10px] md:border-emerald-600 md:shadow-[0_25px_60px_-15px_rgba(22,163,74,0.15)] overflow-hidden">
            {/* Top Speaker Notch */}
            <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-emerald-600 rounded-b-2xl z-50">
              <div className="absolute right-6 top-1.5 w-2 h-2 rounded-full bg-emerald-800 border border-emerald-500/20" />
              <div className="absolute left-1/2 -translate-x-1/2 top-1 w-12 h-1 rounded-full bg-emerald-500/30" />
            </div>

            {/* Simulated Phone Status Bar */}
            <div className="bg-white px-6 pt-3 pb-1 flex justify-between items-center text-[10px] font-mono font-bold text-slate-800 shrink-0 z-45 border-b border-stone-150">
              <span className="text-emerald-700">AFAOGOL</span>
              <div className="flex items-center space-x-1.5">
                <span className="text-[8px] tracking-tighter text-orange-600">5G CL</span>
                <div className="flex items-end space-x-[1px] h-2.5">
                  <div className="w-[2px] h-1 bg-slate-800" />
                  <div className="w-[2px] h-1.5 bg-slate-800" />
                  <div className="w-[2px] h-2 bg-slate-800" />
                  <div className="w-[2px] h-2.5 bg-emerald-600" />
                </div>
                <div className="w-4 h-2.5 border border-slate-800 rounded-xs p-[1px] flex items-center">
                  <div className="h-full w-4/5 bg-emerald-500 rounded-2xs" />
                </div>
              </div>
            </div>

            {/* Content Container */}
            <div className="flex-grow overflow-y-auto bg-white relative">
              <NotificationToast
                notifications={notifications}
                onDismiss={handleDismissNotification}
                onSelectMatch={() => {}}
              />
              <LoginModal
                onLoginSuccess={(user) => {
                  setCurrentUser(user);
                  localStorage.setItem('afaogol_active_user', JSON.stringify(user));
                  triggerPushNotification(
                    'general',
                    'status',
                    '🔓 Acceso Concedido',
                    `¡Hola de nuevo, ${user.name}! Sesión de delegado iniciada con éxito.`
                  );
                }}
              />
            </div>

            {/* Bottom Swipe Indicator */}
            <div className="hidden md:flex justify-center items-center py-2 bg-white shrink-0 z-45 border-t border-stone-150">
              <div className="w-28 h-1 bg-stone-300 rounded-full" />
            </div>
          </div>
        ) : (
          /* Normal Widescreen Login view */
          <div className="w-full flex flex-col justify-center items-center max-w-lg">
            <NotificationToast
              notifications={notifications}
              onDismiss={handleDismissNotification}
              onSelectMatch={() => {}}
            />
            <LoginModal
              onLoginSuccess={(user) => {
                setCurrentUser(user);
                localStorage.setItem('afaogol_active_user', JSON.stringify(user));
                triggerPushNotification(
                  'general',
                  'status',
                  '🔓 Acceso Concedido',
                  `¡Hola de nuevo, ${user.name}! Sesión de delegado iniciada con éxito.`
                );
              }}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* GLOBAL BACKGROUND ELEMENTS */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-linear-to-b from-slate-100/50 to-transparent pointer-events-none z-0" />

      {/* FLOATING EVENTS COMPONENT (Simulating Instant Android/iOS Notifications) */}
      <NotificationToast
        notifications={notifications}
        onDismiss={handleDismissNotification}
        onSelectMatch={(matchId) => {
          if (matchesList.some(m => m.id === matchId)) {
            setSelectedMatchDetailId(matchId);
          }
        }}
      />

      {/* APP HEADER WRAPPER */}
      <Header
        seriesList={seriesList}
        activeSeriesId={activeSeriesId}
        onSelectSeries={(id) => {
          setActiveSeriesId(id);
          // Auto switch off Admin subtab if switching, unless staying in valid area
        }}
        isAdmin={isAdmin}
        currentUser={currentUser}
        onLogout={() => {
          setCurrentUser(null);
          localStorage.removeItem('afaogol_active_user');
          setActiveSubTab('matches');
          triggerPushNotification(
            'general',
            'status',
            '🔒 Sesión Cerrada',
            'Has cerrado sesión de forma segura.'
          );
        }}
        activeSubTab={activeSubTab}
        onChangeSubTab={setActiveSubTab}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* CORE CONTENT LAYOUT */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full relative z-10 flex flex-col lg:flex-row gap-6">
        
        {/* SIDEBAR FOR TEAM SERIES SELECTION */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          seriesList={seriesList}
          activeSeriesId={activeSeriesId}
          onSelectSeries={setActiveSeriesId}
          teamsList={teamsList}
        />

        {/* MAIN BODY SECTION */}
        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeSeriesId}-${activeSubTab}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
            {/* 1. MATCH CALENDAR AND SCORES LIST TAB */}
            {activeSubTab === 'matches' && (
              <div className="space-y-6">
                
                {/* TOOLBAR: Search, Status Tabs and Quick Action */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                  {/* Search bar */}
                  <div className="relative w-full md:max-w-xs">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      placeholder="Buscar por equipo..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9.5 pr-4 py-3 placeholder:text-slate-400 text-slate-800 focus:outline-hidden focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  {/* Filter category badges */}
                  <div className="flex bg-slate-100 p-1 border border-slate-200 rounded-xl overflow-x-auto w-full md:w-auto">
                    <button
                      onClick={() => setMatchFilter('all')}
                      className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        matchFilter === 'all' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      ⭐ Todos
                    </button>
                    <button
                      onClick={() => setMatchFilter('live')}
                      className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                        matchFilter === 'live' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-500 hover:text-rose-600'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 bg-rose-500 rounded-full inline-block" />
                      🟢 En Vivo
                    </button>
                    <button
                      onClick={() => setMatchFilter('finished')}
                      className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        matchFilter === 'finished' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      🏁 Finalizados
                    </button>
                    <button
                      onClick={() => setMatchFilter('scheduled')}
                      className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        matchFilter === 'scheduled' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      📅 Programados
                    </button>
                  </div>

                  {/* Quick Shortcut to Administer Calendar */}
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setAdminSubTab('matches');
                        setActiveSubTab('admin');
                      }}
                      className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg transition cursor-pointer"
                    >
                      📅 Programar Partido
                    </button>
                  )}
                </div>

                {/* SEARCH RESULTS / MATCH CARDS GRID */}
                {filteredMatches.length === 0 ? (
                  <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl shadow-xs">
                    <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-slate-700 font-display">No se encontraron encuentros</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                      Intenta buscando otros equipos o cambia el filtro de estados seleccionado.
                    </p>
                    {isAdmin && (
                      <button
                        onClick={() => setActiveSubTab('admin')}
                        className="mt-4 inline-flex items-center gap-1.5 text-xs text-emerald-700 hover:text-white hover:bg-emerald-600 font-bold border border-emerald-500/20 bg-emerald-50 px-4 py-2 rounded-xl transition cursor-pointer font-display"
                      >
                        <Plus className="w-4 h-4" />
                        Programar Partido en Calendario
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="match-cards-grid">
                    {filteredMatches.map((match) => {
                      const home = currentTeams.find((t) => t.id === match.homeTeamId);
                      const away = currentTeams.find((t) => t.id === match.awayTeamId);

                      if (!home || !away) return null;

                      const isLive = match.status === 'live';
                      const isFinished = match.status === 'finished';

                      return (
                        <div
                          key={match.id}
                          onClick={() => setSelectedMatchDetailId(match.id)}
                          className="bg-white hover:bg-slate-50/50 border border-slate-200 hover:border-emerald-500/40 rounded-2xl overflow-hidden shadow-xs hover:shadow-xs hover:shadow-emerald-500/5 transition duration-150 cursor-pointer flex flex-col justify-between group"
                        >
                          {/* Top Status Belt */}
                          <div className="p-3 bg-slate-50/75 border-b border-slate-100 flex justify-between items-center text-[10px] font-mono select-none text-slate-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {match.date}
                            </span>
                            <span className={`px-2 py-0.5 rounded-md font-bold text-[9px] uppercase tracking-wider ${
                              isLive ? 'bg-rose-50 text-rose-600 border border-rose-200 animate-pulse' :
                              isFinished ? 'bg-slate-100 text-slate-600 border border-slate-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-150'
                            }`}>
                              {isLive ? 'EN VIVO' : isFinished ? 'FINALIZADO' : `HORA: ${match.time}`}
                            </span>
                          </div>

                          {/* Central Score block */}
                          <div className="p-5 py-6">
                            <div className="space-y-4">
                              {/* Home Row */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div
                                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs border border-slate-200"
                                    style={{ backgroundColor: `${home.color}15`, color: home.color }}
                                  >
                                    {home.logoUrl.startsWith('data:image') || home.logoUrl.startsWith('http') ? (
                                      <img src={home.logoUrl} alt={home.name} className="w-5 h-5 object-contain rounded-full" referrerPolicy="no-referrer" />
                                    ) : (
                                      <span className="font-bold">{home.logoUrl}</span>
                                    )}
                                  </div>
                                  <span className="text-xs sm:text-sm font-bold text-slate-800 truncate max-w-[124px] sm:max-w-[150px]">{home.name}</span>
                                </div>
                                {!isFinished && !isLive ? (
                                  <span className="text-[10px] font-bold text-slate-400 font-mono bg-slate-50 border border-slate-150 rounded px-2 py-0.5">L</span>
                                ) : (
                                  <span className="text-sm font-bold text-slate-900 font-mono bg-slate-100 border border-slate-200 rounded px-2.5 py-0.5 min-w-[28px] text-center">{match.homeScore}</span>
                                )}
                              </div>

                              {/* Away Row */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div
                                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs border border-slate-200"
                                    style={{ backgroundColor: `${away.color}15`, color: away.color }}
                                  >
                                    {away.logoUrl.startsWith('data:image') || away.logoUrl.startsWith('http') ? (
                                      <img src={away.logoUrl} alt={away.name} className="w-5 h-5 object-contain rounded-full" referrerPolicy="no-referrer" />
                                    ) : (
                                      <span className="font-bold">{away.logoUrl}</span>
                                    )}
                                  </div>
                                  <span className="text-xs sm:text-sm font-bold text-slate-800 truncate max-w-[124px] sm:max-w-[150px]">{away.name}</span>
                                </div>
                                {!isFinished && !isLive ? (
                                  <span className="text-[10px] font-bold text-slate-400 font-mono bg-slate-50 border border-slate-150 rounded px-2 py-0.5">V</span>
                                ) : (
                                  <span className="text-sm font-bold text-slate-900 font-mono bg-slate-100 border border-slate-200 rounded px-2.5 py-0.5 min-w-[28px] text-center">{match.awayScore}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Lower Stats Indicators bar */}
                          <div className="p-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-mono select-none">
                            <span className="text-slate-500 capitalize">
                              {match.events.length > 0 ? (
                                <span className="flex items-center gap-1">
                                  ⚽ {match.events.filter(e => e.type === 'goal').length} Goles registrados
                                </span>
                              ) : (
                                'Sin acta'
                              )}
                            </span>

                            <div className="flex items-center gap-2.5">
                              {match.comments.length > 0 && (
                                <span className="flex items-center gap-0.5 text-slate-400" title="Comentarios">
                                  <MessageSquare className="w-3 h-3 text-slate-400" />
                                  {match.comments.length}
                                </span>
                              )}
                              {match.media.length > 0 && (
                                <span className="flex items-center gap-0.5 text-slate-400" title="Galería de fotos">
                                  <ImageIcon className="w-3 h-3 text-slate-400" />
                                  {match.media.length}
                                </span>
                              )}
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 2. STANDINGS POSITIONS TABLE TAB */}
            {activeSubTab === 'standings' && (
              <StandingsTable
                teams={currentTeams}
                matches={matchesList.filter((m) => m.seriesId === activeSeriesId)}
                onTriggerEditTeams={isAdmin ? () => {
                  setAdminSubTab('teams');
                  setActiveSubTab('admin');
                } : undefined}
              />
            )}

            {/* 3. PERFORMANCE CHARTS AND ANALYTICS TAB */}
            {activeSubTab === 'stats' && (
              <PerformanceCharts
                teams={currentTeams}
                matches={matchesList}
              />
            )}

            {/* 4. MASTER ADMINISTRATION DESK TAB */}
            {activeSubTab === 'admin' && isAdmin && (
              <AdminPanel
                seriesList={seriesList}
                activeSeriesId={activeSeriesId}
                teams={currentTeams}
                matches={matchesList}
                onUpdateSeriesNames={handleUpdateSeriesNames}
                onAddSeries={handleAddSeries}
                onDeleteSeries={handleDeleteSeries}
                onAddTeam={handleAddTeam}
                onAddTeamsBulk={handleAddTeamsBulk}
                onUpdateTeam={handleUpdateTeam}
                onDeleteTeam={handleDeleteTeam}
                onAddMatch={handleAddMatch}
                onUpdateMatch={handleUpdateMatch}
                onDeleteMatch={handleDeleteMatch}
                onTriggerNotification={triggerPushNotification}
                adminSubTab={adminSubTab}
                onChangeAdminSubTab={setAdminSubTab}
              />
            )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* DETAILED DIALOG MODAL SHEET OVERLAY */}
      <AnimatePresence>
        {selectedMatchDetailId && activeDetailMatch && detailHomeTeam && detailAwayTeam && (
          <MatchDetailModal
            match={activeDetailMatch}
            homeTeam={detailHomeTeam}
            awayTeam={detailAwayTeam}
            onClose={() => setSelectedMatchDetailId(null)}
            onAddComment={handleAddComment}
          />
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <footer className="bg-white text-slate-500 text-xs py-8 mt-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
          <p className="font-semibold text-slate-700 font-display">AFAOGOL - Sistema Integrado de Fútbol Amateur</p>
          <p className="text-[10px] text-slate-400">Utiliza el botón superior derecho <strong>"Ingresar Resultados (Delegado)"</strong> o los accesos directos de edición para simular goles, tarjetas, programar calendario, subir fotos de partidos y renombrar series.</p>
          <div className="pt-2 text-[9px] font-mono text-slate-400">
            Powered by Goal-Sync Pro Platform & ANFA Chile • React & Tailwind CSS
          </div>
        </div>
      </footer>

    </div>
  );
}
