/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Calendar, Shield, Users, RefreshCw, 
  Upload, Image as ImageIcon, Video, Bell, Trophy, BookOpen, Clock, HeartHandshake, Check
} from 'lucide-react';
import { Team, Match, MatchEvent, Series, DEFAULT_SHIELDS, TEAM_COLORS } from '../types';

export const PRESET_CLUBS = [
  { name: "C.D Troncoso", emoji: "🌳", color: "#10b981" },
  { name: "C.D Tamaya", emoji: "⛰️", color: "#f97316" },
  { name: "C.D Matadero", emoji: "🥩", color: "#ef4444" },
  { name: "C.D Profesores", emoji: "🎓", color: "#3b82f6" },
  { name: "C.D Quiscal", emoji: "🌵", color: "#14b8a6" },
  { name: "C.D Bellavista", emoji: "🌅", color: "#8b5cf6" },
  { name: "C.D Limarí", emoji: "💧", color: "#06b6d4" },
  { name: "C.D Población Tapia", emoji: "🏘️", color: "#ec4899" },
  { name: "C.D Atenas", emoji: "🏛️", color: "#f59e0b" },
  { name: "C.D 21 de Mayo", emoji: "🗓️", color: "#06b6d4" },
  { name: "C.D Unión Lucitania", emoji: "🤝", color: "#f59e0b" },
  { name: "C.D Julio Martínez", emoji: "🎙️", color: "#6b7280" },
  { name: "C.D Feria Libre", emoji: "🍉", color: "#f97316" },
  { name: "C.D Perla Verde", emoji: "🟢", color: "#10b981" },
  { name: "Cl.D Norte Verde", emoji: "🌵", color: "#10b981" },
  { name: "C.D Mirador", emoji: "🔭", color: "#8b5cf6" },
  { name: "C.D Diablos Rojos", emoji: "😈", color: "#ef4444" },
  { name: "C.D Provincial Ovalle", emoji: "🛡️", color: "#3b82f6" },
  { name: "C.D Fenix de Puinitaqui", emoji: "🐦", color: "#ec4899" },
  { name: "C.D San Pedro", emoji: "⛵", color: "#3b82f6" }
];

interface AdminPanelProps {
  seriesList: Series[];
  activeSeriesId: string;
  teams: Team[];
  matches: Match[];
  onUpdateSeriesNames: (series: Series[]) => void;
  onAddSeries: (name: string) => void;
  onDeleteSeries: (id: string) => void;
  onAddTeam: (seriesId: string, team: Omit<Team, 'id'>) => void;
  onAddTeamsBulk: (seriesId: string, teams: Omit<Team, 'id'>[]) => void;
  onUpdateTeam: (seriesId: string, team: Team) => void;
  onDeleteTeam: (seriesId: string, teamId: string) => void;
  onAddMatch: (match: Omit<Match, 'id' | 'events' | 'media' | 'comments'>) => void;
  onUpdateMatch: (match: Match) => void;
  onDeleteMatch: (matchId: string) => void;
  onTriggerNotification: (matchId: string, type: 'goal' | 'card' | 'status' | 'info', title: string, body: string) => void;
  adminSubTab: 'series' | 'teams' | 'matches' | 'scorer' | 'users';
  onChangeAdminSubTab: (tab: 'series' | 'teams' | 'matches' | 'scorer' | 'users') => void;
}

export default function AdminPanel({
  seriesList,
  activeSeriesId,
  teams,
  matches,
  onUpdateSeriesNames,
  onAddSeries,
  onDeleteSeries,
  onAddTeam,
  onAddTeamsBulk,
  onUpdateTeam,
  onDeleteTeam,
  onAddMatch,
  onUpdateMatch,
  onDeleteMatch,
  onTriggerNotification,
  adminSubTab,
  onChangeAdminSubTab,
}: AdminPanelProps) {
  // --- SERIES EDIT STATE ---
  const [editSeriesList, setEditSeriesList] = useState<Series[]>([...seriesList]);

  useEffect(() => {
    setEditSeriesList([...seriesList]);
  }, [seriesList]);

  const [newSeriesNameState, setNewSeriesNameState] = useState('');
  const [seriesToDeleteId, setSeriesToDeleteId] = useState<string | null>(null);

  const handleSeriesNameChange = (id: string, newName: string) => {
    const updated = editSeriesList.map((s) => (s.id === id ? { ...s, name: newName } : s));
    setEditSeriesList(updated);
    onUpdateSeriesNames(updated);
  };

  // --- TEAMS STATE ---
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [teamName, setTeamName] = useState('');
  const [teamLogo, setTeamLogo] = useState('🛡️');
  const [teamColor, setTeamColor] = useState('#3b82f6');
  const [logoMode, setLogoMode] = useState<'emoji' | 'upload'>('emoji');

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTeamLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;

    if (editingTeam) {
      onUpdateTeam(activeSeriesId, {
        ...editingTeam,
        name: teamName.trim(),
        logoUrl: teamLogo,
        color: teamColor,
      });
      setEditingTeam(null);
    } else {
      onAddTeam(activeSeriesId, {
        name: teamName.trim(),
        logoUrl: teamLogo,
        color: teamColor,
      });
    }

    // Reset Form
    setTeamName('');
    setTeamLogo('🛡️');
    setTeamColor('#3b82f6');
    setLogoMode('emoji');
  };

  const handleEditTeamInit = (team: Team) => {
    setEditingTeam(team);
    setTeamName(team.name);
    setTeamLogo(team.logoUrl);
    setTeamColor(team.color);
    setLogoMode(team.logoUrl.startsWith('data:image') ? 'upload' : 'emoji');
  };

  const handleEnrollAllCurrentSeries = () => {
    const enrollData = PRESET_CLUBS.map(c => ({
      name: c.name,
      logoUrl: c.emoji,
      color: c.color
    }));
    onAddTeamsBulk(activeSeriesId, enrollData);
  };

  const handleEnrollAllSeriesGlobal = () => {
    const enrollData = PRESET_CLUBS.map(c => ({
      name: c.name,
      logoUrl: c.emoji,
      color: c.color
    }));
    onAddTeamsBulk('all', enrollData);
  };

  // --- USERS STATE AND HANDLERS ---
  const [usersList, setUsersList] = useState<any[]>(() => {
    const saved = localStorage.getItem('afaogol_users_db');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback to defaults
      }
    }
    const defaults = [
      { name: 'Seba Feliz', email: 'sebafeliz@gmail.com', password: 'afaogol2026', role: 'admin' },
      { name: 'Administrador General', email: 'admin@afaogol.cl', password: 'admin123', role: 'admin' },
      { name: 'Delegado Oficial', email: 'delegado@afaogol.cl', password: 'delegado123', role: 'admin' },
      { name: 'Juan Pérez (Visor)', email: 'juan@afaogol.cl', password: 'juan123', role: 'guest' }
    ];
    localStorage.setItem('afaogol_users_db', JSON.stringify(defaults));
    return defaults;
  });

  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'guest'>('admin');
  const [userError, setUserError] = useState('');
  const [userSuccess, setUserSuccess] = useState('');

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setUserError('');
    setUserSuccess('');

    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) {
      setUserError('Por favor, completa todos los campos.');
      return;
    }

    const emailNormalized = newUserEmail.toLowerCase().trim();
    if (usersList.some((u) => u.email.toLowerCase().trim() === emailNormalized)) {
      setUserError('Esa dirección de correo electrónico ya está registrada.');
      return;
    }

    const newUser = {
      name: newUserName.trim(),
      email: emailNormalized,
      password: newUserPassword,
      role: newUserRole,
    };

    const updated = [...usersList, newUser];
    setUsersList(updated);
    localStorage.setItem('afaogol_users_db', JSON.stringify(updated));

    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword('');
    setUserSuccess('🎉 El nuevo usuario registrado con éxito. Podrá ingresar de inmediato.');
    onTriggerNotification('general', 'info', '👤 Nuevo Usuario', `Se ha inscrito a ${newUser.name} al sistema.`);
  };

  const handleAuthorizeUser = (emailToAuthorize: string) => {
    const updated = usersList.map((u) => {
      if (u.email.toLowerCase().trim() === emailToAuthorize.toLowerCase().trim()) {
        return { ...u, status: 'authorized' };
      }
      return u;
    });
    setUsersList(updated);
    localStorage.setItem('afaogol_users_db', JSON.stringify(updated));
    
    const authorizedUser = usersList.find(u => u.email.toLowerCase().trim() === emailToAuthorize.toLowerCase().trim());
    onTriggerNotification(
      'general', 
      'info', 
      '👤 Usuario Autorizado', 
      `Se ha habilitado con éxito el acceso para ${authorizedUser?.name || emailToAuthorize}.`
    );
  };

  const getAdminMailUrl = (reqName: string, reqEmail: string, reqPass: string, reqRole: string) => {
    const recipient = reqEmail;
    const subject = encodeURIComponent(`[AFAOGOL] ¡Tu cuenta ha sido Autorizada! 🏆`);
    
    const bodyText = `Hola ${reqName},

Te informamos que tu solicitud de registro en la plataforma de fútbol amateur AFAOGOL ha sido revisada y AUTORIZADA exitosamente por la administración.

A contar de este momento, puedes iniciar sesión de forma segura con los siguientes antecedentes:
------------------------------------------
• Dirección de acceso: ${window.location.origin}
• Correo Electrónico: ${reqEmail}
• Contraseña Asignada: ${reqPass}
• Rol: ${reqRole === 'admin' ? 'Administrador Delegado (Edición y Configuración)' : 'Visor Lector (Acceso General)'}
------------------------------------------

Te damos la más cordial bienvenida a nuestra red oficial de gestión deportiva amateur.

Atentamente,
Dirección de Administración
AFAOGOL Chile`;

    const body = encodeURIComponent(bodyText);
    return `mailto:${recipient}?subject=${subject}&body=${body}`;
  };

  const handleDeleteUser = (emailToDelete: string) => {
    if (emailToDelete.toLowerCase().trim() === 'sebafeliz@gmail.com') {
      onTriggerNotification('general', 'info', '🛡️ Prohibido', 'No se puede eliminar la cuenta de Seba Feliz.');
      return;
    }

    const updated = usersList.filter((u) => u.email.toLowerCase().trim() !== emailToDelete.toLowerCase().trim());
    setUsersList(updated);
    localStorage.setItem('afaogol_users_db', JSON.stringify(updated));
    onTriggerNotification('general', 'status', '🗑️ Usuario Eliminado', `La cuenta ${emailToDelete} ha sido eliminada por el administrador.`);
  };

  // --- MATCH SCHEDULER STATE ---
  const [homeTeamId, setHomeTeamId] = useState('');
  const [awayTeamId, setAwayTeamId] = useState('');
  const [matchDate, setMatchDate] = useState('');
  const [matchTime, setMatchTime] = useState('');

  // --- QUICK TEAM REGISTER STATE ---
  const [showQuickAddTeam, setShowQuickAddTeam] = useState(false);
  const [quickTeamName, setQuickTeamName] = useState('');

  const handleQuickPresetChange = (presetName: string) => {
    if (!presetName) return;
    const preset = PRESET_CLUBS.find(c => c.name === presetName);
    if (preset) {
      const exists = teams.some(t => t.name.toLowerCase().trim() === presetName.toLowerCase().trim());
      if (exists) {
        onTriggerNotification('general', 'info', '⚠️ Duplicado', `El equipo "${presetName}" ya existe en esta serie.`);
        return;
      }
      onAddTeam(activeSeriesId, {
        name: preset.name,
        logoUrl: preset.emoji,
        color: preset.color
      });
      onTriggerNotification(
        'general', 
        'status', 
        '🛡️ Equipo Registrado', 
        `Se ha guardado "${preset.name}" en la serie.`
      );
    }
  };

  const handleAddMatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeTeamId || !awayTeamId || !matchDate || !matchTime) return;
    if (homeTeamId === awayTeamId) {
      alert("Un equipo no puede jugar contra sí mismo.");
      return;
    }

    onAddMatch({
      seriesId: activeSeriesId,
      homeTeamId,
      awayTeamId,
      homeScore: 0,
      awayScore: 0,
      date: matchDate,
      time: matchTime,
      status: 'scheduled',
    });

    setHomeTeamId('');
    setAwayTeamId('');
    setMatchDate('');
    setMatchTime('');
  };

  // --- SCORING & EVENTS TIMELINE ENGINE ---
  const [activeScorecardMatchId, setActiveScorecardMatchId] = useState<string>(() => {
    return matches.find((m) => m.seriesId === activeSeriesId && m.status === 'live')?.id || 
           matches.find((m) => m.seriesId === activeSeriesId)?.id || '';
  });

  const activeMatch = matches.find((m) => m.id === activeScorecardMatchId);
  const mHomeTeam = activeMatch ? teams.find((t) => t.id === activeMatch.homeTeamId) : null;
  const mAwayTeam = activeMatch ? teams.find((t) => t.id === activeMatch.awayTeamId) : null;

  // Manual editing of scores (+ / - buttons)
  const handleModifyScore = (side: 'home' | 'away', operation: 'inc' | 'dec') => {
    if (!activeMatch) return;
    let newHomeScore = activeMatch.homeScore;
    let newAwayScore = activeMatch.awayScore;

    if (side === 'home') {
      newHomeScore = operation === 'inc' ? newHomeScore + 1 : Math.max(0, newHomeScore - 1);
    } else {
      newAwayScore = operation === 'inc' ? newAwayScore + 1 : Math.max(0, newAwayScore - 1);
    }

    const updated = {
      ...activeMatch,
      homeScore: newHomeScore,
      awayScore: newAwayScore,
    };
    onUpdateMatch(updated);

    // Also prompt a quick informative push simulation toast for scores!
    if (operation === 'inc') {
      const scoringTeam = side === 'home' ? mHomeTeam : mAwayTeam;
      if (scoringTeam) {
        onTriggerNotification(
          activeMatch.id,
          'goal',
          `¡GOOOL de ${scoringTeam.name}!`,
          `El marcador se actualiza manualmente: ${mHomeTeam?.name} ${newHomeScore} - ${newAwayScore} ${mAwayTeam?.name}`
        );
      }
    }
  };

  // Change Match Status (Scheduled -> Live -> Finished)
  const handleChangeMatchStatus = (newStatus: 'scheduled' | 'live' | 'finished') => {
    if (!activeMatch || !mHomeTeam || !mAwayTeam) return;
    const oldStatus = activeMatch.status;
    const updated = { ...activeMatch, status: newStatus };
    onUpdateMatch(updated);

    // Status alert notification trigger
    let msgTitle = '';
    let msgBody = '';
    if (newStatus === 'live') {
      msgTitle = `¡Inicia el Partido! 🟢`;
      msgBody = `Ya rueda el balón en el encuentro: ${mHomeTeam.name} vs ${mAwayTeam.name}`;
    } else if (newStatus === 'finished') {
      msgTitle = `¡Partido Finalizado! 🏁`;
      msgBody = `Concluye el juego con marcador: ${mHomeTeam.name} ${activeMatch.homeScore} - ${activeMatch.awayScore} ${mAwayTeam.name}`;
    } else {
      msgTitle = `Encuentro Reprogramado`;
      msgBody = `El juego ${mHomeTeam.name} vs ${mAwayTeam.name} ha vuelto a estado de calendario.`;
    }

    onTriggerNotification(activeMatch.id, 'status', msgTitle, msgBody);
  };

  // Register New Match Event (Goles, Tarjetas, Incidencias)
  const [eventPlayer, setEventPlayer] = useState('');
  const [eventMinute, setEventMinute] = useState(45);
  const [eventType, setEventType] = useState<'goal' | 'yellow_card' | 'red_card' | 'substitute'>('goal');
  const [eventTeamId, setEventTeamId] = useState('');
  const [eventDesc, setEventDesc] = useState('');

  const handleRegisterEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMatch || !eventPlayer.trim() || !eventTeamId) return;

    const newEvent: MatchEvent = {
      id: `ev_${Date.now()}`,
      type: eventType,
      minute: Number(eventMinute),
      teamId: eventTeamId,
      playerName: eventPlayer.trim(),
      description: eventDesc.trim() || undefined,
    };

    // Automatically update match scores if registering a Goal
    let finalHomeScore = activeMatch.homeScore;
    let finalAwayScore = activeMatch.awayScore;
    if (eventType === 'goal') {
      if (eventTeamId === activeMatch.homeTeamId) {
        finalHomeScore += 1;
      } else {
        finalAwayScore += 1;
      }
    }

    const updatedEvents = [...activeMatch.events, newEvent];
    const updatedMatch: Match = {
      ...activeMatch,
      homeScore: finalHomeScore,
      awayScore: finalAwayScore,
      events: updatedEvents,
    };

    onUpdateMatch(updatedMatch);

    // TRIGGER LIVE PUSH NOTIFICATION TRIGGER
    const evTeamName = eventTeamId === activeMatch.homeTeamId ? mHomeTeam?.name : mAwayTeam?.name;
    let notifTitle = '';
    let notifBody = '';

    if (eventType === 'goal') {
      notifTitle = `⚽ ¡GOOOL de ${evTeamName}! Minuto ${eventMinute}`;
      notifBody = `${eventPlayer} define para poner el marcador en ${finalHomeScore} - ${finalAwayScore}.`;
    } else if (eventType === 'yellow_card') {
      notifTitle = `🟨 Tarjeta Amarilla - ${evTeamName}`;
      notifBody = `${eventPlayer} es amonestado en el minuto ${eventMinute}.`;
    } else if (eventType === 'red_card') {
      notifTitle = `🟥 TARJETA ROJA - Expulsión en ${evTeamName}`;
      notifBody = `¡Durísimo! ${eventPlayer} se va expulsado en el minuto ${eventMinute}.`;
    } else {
      notifTitle = `🔄 Sustitución en ${evTeamName}`;
      notifBody = `Cambio realizado en el minuto ${eventMinute}: ${eventPlayer}.`;
    }

    onTriggerNotification(activeMatch.id, eventType === 'goal' ? 'goal' : 'card', notifTitle, notifBody);

    // Reset Event inputs
    setEventPlayer('');
    setEventDesc('');
  };

  // --- MULTIMEDIA UPLOAD ENGINE ---
  const [mediaCaption, setMediaCaption] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaMode, setMediaMode] = useState<'url' | 'file'>('url');

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMatch || !mediaUrl) return;

    const newMedia = {
      id: `med_${Date.now()}`,
      type: 'image' as const,
      url: mediaUrl,
      caption: mediaCaption || 'Foto del partido',
    };

    const updatedMatch: Match = {
      ...activeMatch,
      media: [...activeMatch.media, newMedia],
    };

    onUpdateMatch(updatedMatch);
    onTriggerNotification(activeMatch.id, 'info', "📸 Galería Actualizada", `Se ha agregado una imagen destacada al encuentro entre ${mHomeTeam?.name} y ${mAwayTeam?.name}.`);

    setMediaCaption('');
    setMediaUrl('');
    setMediaMode('url');
  };

  return (
    <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-4 sm:p-6 shadow-xs space-y-6">
      
      {/* SECTOR SUB NAVIGATION */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-200/60 rounded-xl" id="admin-tabs">
        <button
          onClick={() => onChangeAdminSubTab('scorer')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            adminSubTab === 'scorer'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          ⚽ Controlar Partido
        </button>
        <button
          onClick={() => onChangeAdminSubTab('teams')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            adminSubTab === 'teams'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          🛡️ Gestionar Equipos
        </button>
        <button
          onClick={() => onChangeAdminSubTab('matches')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            adminSubTab === 'matches'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          📅 Crear Calendario
        </button>
        <button
          onClick={() => onChangeAdminSubTab('series')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            adminSubTab === 'series'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          📝 Gestionar Series
        </button>
        <button
          onClick={() => onChangeAdminSubTab('users')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            adminSubTab === 'users'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          👤 Gestionar Usuarios
        </button>
      </div>

      {/* RENDER DYNAMIC SUB PANELS */}

      {/* --- GESTIONAR SERIES TAB --- */}
      {adminSubTab === 'series' && (
        <div className="space-y-6 max-w-xl">
          {/* Header */}
          <div className="border-b border-slate-200 pb-2">
            <h3 className="text-sm font-bold text-slate-800">Gestionar y Renombrar de Series</h3>
            <p className="text-xs text-slate-400 mt-0.5">Crea nuevas series para torneos o elimina las existentes. También puedes cambiar sus nombres oficiales.</p>
          </div>

          {/* Form to add a new series */}
          <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl space-y-3">
            <h4 className="text-xs font-black font-mono tracking-wider uppercase text-emerald-800 flex items-center gap-1">
              🏆 Añadir Nueva Serie / División
            </h4>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (newSeriesNameState.trim()) {
                  onAddSeries(newSeriesNameState.trim());
                  setNewSeriesNameState('');
                }
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={newSeriesNameState}
                onChange={(e) => setNewSeriesNameState(e.target.value)}
                placeholder="Ej: Torneo Senior +35, Serie D Juvenil"
                className="flex-1 text-xs bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-hidden focus:border-emerald-500 font-semibold"
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold pb-0.5 px-4 rounded-xl transition cursor-pointer flex items-center gap-1 uppercase"
              >
                <Plus className="w-4 h-4" /> Añadir
              </button>
            </form>
          </div>

          {/* Existing Series Manager List */}
          <div className="space-y-3 bg-white border border-slate-200 p-5 rounded-2xl">
            <h4 className="text-xs font-bold text-slate-700 mb-2">Series Registradas</h4>
            {editSeriesList.map((series, idx) => (
              <div key={series.id} className="flex items-center gap-3 bg-slate-50 border border-slate-150 p-2.5 rounded-xl">
                <span className="text-xs font-mono font-black text-slate-400 w-16 shrink-0">
                  Serie {idx + 1}:
                </span>
                <input
                  type="text"
                  value={series.name}
                  onChange={(e) => handleSeriesNameChange(series.id, e.target.value)}
                  className="flex-grow text-xs bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-slate-800 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  placeholder={`Asigna nombre a la serie ${idx + 1}`}
                />
                
                 {/* Delete series action with custom inline safe confirmation */}
                 {seriesToDeleteId === series.id ? (
                   <div className="flex items-center gap-1.5 shrink-0 bg-rose-50 border border-rose-100 p-1 rounded-xl animate-fadeIn">
                     <span className="text-[10px] font-black uppercase text-rose-700 px-1 hidden sm:inline">¿Borrar?</span>
                     <button
                       type="button"
                       onClick={() => {
                         onDeleteSeries(series.id);
                         setSeriesToDeleteId(null);
                       }}
                       className="px-2.5 py-1 text-[9px] font-extrabold uppercase bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors cursor-pointer"
                     >
                       Sí, borrar
                     </button>
                     <button
                       type="button"
                       onClick={() => setSeriesToDeleteId(null)}
                       className="px-2.5 py-1 text-[9px] font-extrabold uppercase bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg transition-colors cursor-pointer"
                     >
                       No
                     </button>
                   </div>
                 ) : (
                   <button
                     type="button"
                     onClick={() => {
                       setSeriesToDeleteId(series.id);
                     }}
                     disabled={editSeriesList.length <= 1}
                     title={editSeriesList.length <= 1 ? "Debe haber al menos una serie en el sistema." : "Eliminar Serie y sus datos"}
                     className={`p-2 rounded-lg border transition duration-150 cursor-pointer ${
                       editSeriesList.length <= 1
                         ? 'border-slate-200 text-slate-300 cursor-not-allowed opacity-50'
                         : 'border-rose-200 text-rose-500 hover:bg-rose-500 hover:text-white hover:border-rose-500'
                     }`}
                   >
                     <Trash2 className="w-3.5 h-3.5" />
                   </button>
                 )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TEAMS CREATOR & REGISTER TAB --- */}
      {adminSubTab === 'teams' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Creation Form */}
          <div className="lg:col-span-5 bg-white border border-slate-200 p-5 rounded-2xl space-y-4">
            <div className="border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-bold text-slate-800">
                {editingTeam ? '📝 Editar Detalles del Equipo' : '🛡️ Registrar Nuevo Equipo'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Añade escudo personalizado, color temático y nombre.</p>
            </div>

            <form onSubmit={handleSaveTeam} className="space-y-4">
              <div>
                <label className="text-[10px] font-black font-mono uppercase tracking-wider text-slate-400 block mb-1">Inscripción por Plantilla (Clubes Oficiales)</label>
                <select
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) {
                      setTeamName(val);
                      const club = PRESET_CLUBS.find(c => c.name === val);
                      if (club) {
                        setTeamLogo(club.emoji);
                        setLogoMode('emoji');
                        setTeamColor(club.color);
                      }
                    }
                  }}
                  className="w-full text-xs font-semibold bg-slate-100/80 border border-slate-200 text-slate-800 rounded-xl px-3.5 py-2.5 transition cursor-pointer mb-2.5 focus:outline-hidden"
                  value=""
                >
                  <option value="">-- Selecciona un club para autocompletar --</option>
                  {PRESET_CLUBS.map((club) => (
                    <option key={club.name} value={club.name}>
                      {club.emoji} {club.name}
                    </option>
                  ))}
                </select>

                <label className="text-[10px] font-black font-mono uppercase tracking-wider text-slate-400 block mb-1">Nombre Oficial (Personalizado)</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Ej., Leones de Oro F.C."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-350"
                  maxLength={30}
                />
              </div>

              {/* Logo Select Mode */}
              <div>
                <label className="text-[10px] font-black font-mono uppercase tracking-wider text-slate-400 block mb-1">Tipo de Escudo</label>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => { setLogoMode('emoji'); setTeamLogo("⚽"); }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${
                      logoMode === 'emoji' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    Emojis por Defecto
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLogoMode('upload'); setTeamLogo(""); }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${
                      logoMode === 'upload' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    Subir Escudo (Archivo)
                  </button>
                </div>

                {logoMode === 'emoji' ? (
                  <div className="grid grid-cols-5 gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200 max-h-28 overflow-y-auto">
                    {DEFAULT_SHIELDS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setTeamLogo(emoji)}
                        className={`text-xl p-1.5 rounded-lg hover:bg-slate-200 transition ${
                          teamLogo === emoji ? 'bg-slate-350 border border-slate-400' : 'border border-transparent'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-3 hover:bg-slate-100 transition cursor-pointer">
                      <Upload className="w-5 h-5 text-slate-400 mb-1" />
                      <span className="text-[11px] font-bold text-slate-600">Haz click para buscar archivo</span>
                      <span className="text-[9px] text-slate-400 mt-0.5">Formatos recomendados: PNG / SVG</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                    {teamLogo.startsWith('data:image') && (
                      <div className="flex items-center gap-2 bg-white border border-slate-200 p-2 rounded-lg">
                        <img src={teamLogo} alt="Vista previa escudo" className="w-8 h-8 object-contain rounded-md" referrerPolicy="no-referrer" />
                        <span className="text-[10px] text-slate-500 font-mono truncate max-w-[120px]">Escudo Guardado</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Team Primary Color Pick */}
              <div>
                <label className="text-[10px] font-black font-mono uppercase tracking-wider text-slate-400 block mb-1">Color Principal en Tablas</label>
                <div className="flex flex-wrap gap-2">
                  {TEAM_COLORS.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setTeamColor(col)}
                      className="w-6.5 h-6.5 rounded-full border border-slate-300 flex items-center justify-center transition"
                      style={{ backgroundColor: col }}
                    >
                      {teamColor === col && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold py-2.5 px-4 rounded-xl transition cursor-pointer"
                >
                  {editingTeam ? 'Guardar Cambios' : 'Registrar Equipo'}
                </button>
                {editingTeam && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTeam(null);
                      setTeamName('');
                      setTeamLogo('🛡️');
                      setTeamColor('#3b82f6');
                    }}
                    className="bg-slate-200 text-slate-700 hover:bg-slate-300 text-xs font-bold py-2.5 px-3 rounded-xl transition cursor-pointer"
                  >
                    Salir
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Teams list preview */}
          <div className="lg:col-span-7 bg-white border border-slate-200 p-5 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="border-b border-slate-100 pb-2.5 mb-3.5">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-slate-500" />
                  Equipos Registrados ({teams.length})
                </h3>
              </div>
              
              {teams.length === 0 ? (
                <div className="text-center py-12 text-slate-400 italic text-xs">
                  No hay equipos creados todavía en esta serie. Carga tu primer equipo usando el formulario de la izquierda.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-1">
                  {teams.map((team) => (
                    <div key={team.id} className="border border-slate-150 rounded-xl p-3 flex items-center justify-between hover:bg-slate-50 transition">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-full border border-slate-200/50 flex items-center justify-center text-lg shadow-inner"
                          style={{ backgroundColor: `${team.color}15`, borderLeft: `3px solid ${team.color}` }}
                        >
                          {team.logoUrl.startsWith('data:image') || team.logoUrl.startsWith('http') ? (
                            <img src={team.logoUrl} alt={team.name} className="w-6 h-6 object-contain rounded-full" referrerPolicy="no-referrer" />
                          ) : (
                            <span>{team.logoUrl}</span>
                          )}
                        </div>
                        <span className="text-xs font-semibold text-slate-900">{team.name}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <button
                          onClick={() => handleEditTeamInit(team)}
                          title="Editar Equipo"
                          className="p-1 px-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-250 border border-slate-200 rounded-lg transition"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteTeam(activeSeriesId, team.id)}
                          title="Eliminar Equipo"
                          className="p-1 px-1.5 text-xs text-rose-600 hover:text-rose-900 hover:bg-rose-50 border border-rose-200 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Batch Actions Section */}
            <div className="mt-6 border-t border-slate-100 pt-5 space-y-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black font-mono uppercase tracking-wider text-slate-400 bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded-md">Lote</span>
                <h4 className="text-xs font-bold text-slate-700">Inscripción Masiva de Clubes del Limarí</h4>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Inscribe automáticamente la plantilla de 20 clubes deportivos regionales con escudos y colores oficiales. Los clubes existentes no se duplicarán.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleEnrollAllCurrentSeries}
                  className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl px-3.5 py-2.5 transition cursor-pointer"
                >
                  🚀 Inscribir 20 en serie activa
                </button>
                <button
                  type="button"
                  onClick={handleEnrollAllSeriesGlobal}
                  className="flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl px-3.5 py-2.5 transition cursor-pointer shadow-xs"
                >
                  ⭐ Copiar 20 en TODAS las series
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- SCHEDULE MATCH CREATOR TAB --- */}
      {adminSubTab === 'matches' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Scheduling Form */}
          <div className="lg:col-span-5 bg-white border border-slate-200 p-5 rounded-2xl space-y-4">
            <div className="border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-bold text-slate-800">📅 Programar Nuevo Encuentro</h3>
              <p className="text-xs text-slate-400 mt-0.5">Inserta partidos al calendario de juego de la serie activa.</p>
            </div>

            {teams.length < 2 ? (
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs">
                  Se requieren por lo menos <strong>2 equipos registrados</strong> para poder calendarizar encuentros. ¡Registra equipos directamente abajo o ve a la pestaña de equipos!
                </div>
                
                {/* Inline Quick Add for empty states */}
                <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-4 space-y-3">
                  <p className="text-[11px] font-black font-mono uppercase tracking-wider text-emerald-800">⚡ Añadir Equipo Rápido</p>
                  <div className="space-y-2">
                    <div>
                      <label className="text-[9px] font-mono font-bold text-slate-405 block mb-1">Elegir Club de Ovalle</label>
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleQuickPresetChange(e.target.value);
                          }
                        }}
                        className="w-full text-xs font-semibold bg-white border border-slate-200 text-slate-800 rounded-xl px-3 py-2 focus:outline-hidden"
                        value=""
                      >
                        <option value="">Selecciona club preset...</option>
                        {PRESET_CLUBS.map((club) => (
                          <option key={club.name} value={club.name}>
                            {club.emoji} {club.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="relative">
                      <label className="text-[9px] font-mono font-bold text-slate-405 block mb-1">O escribe nombre personalizado</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Nombre del equipo..."
                          value={quickTeamName}
                          onChange={(e) => setQuickTeamName(e.target.value)}
                          className="flex-grow text-xs bg-white text-slate-800 border border-slate-200 rounded-xl px-3 py-2 focus:outline-hidden focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!quickTeamName.trim()) return;
                            const randomColor = TEAM_COLORS[Math.floor(Math.random() * TEAM_COLORS.length)];
                            const randomShield = DEFAULT_SHIELDS[Math.floor(Math.random() * DEFAULT_SHIELDS.length)];
                            onAddTeam(activeSeriesId, {
                              name: quickTeamName.trim(),
                              logoUrl: randomShield,
                              color: randomColor
                            });
                            onTriggerNotification('general', 'status', '🛡️ Equipo Registrado', `Se ha guardado "${quickTeamName.trim()}" en la serie.`);
                            setQuickTeamName('');
                          }}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] uppercase rounded-xl transition cursor-pointer"
                        >
                          Crear
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAddMatchSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black font-mono uppercase tracking-wider text-slate-400 block mb-1">Local (Home)</label>
                    <div className="relative">
                      <select
                        value={homeTeamId}
                        onChange={(e) => setHomeTeamId(e.target.value)}
                        className="w-full text-xs font-semibold appearance-none bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 focus:outline-hidden"
                      >
                        <option value="">Selecciona...</option>
                        {teams.map((t) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black font-mono uppercase tracking-wider text-slate-400 block mb-1">Visitante (Away)</label>
                    <div className="relative">
                      <select
                        value={awayTeamId}
                        onChange={(e) => setAwayTeamId(e.target.value)}
                        className="w-full text-xs font-semibold appearance-none bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 focus:outline-hidden"
                      >
                        <option value="">Selecciona...</option>
                        {teams.map((t) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Inline Quick team adder button and box in standard flow */}
                <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl px-3 py-2.5 my-2.5 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500">¿Falta un equipo en este listado?</span>
                    <button 
                      type="button" 
                      onClick={() => setShowQuickAddTeam(!showQuickAddTeam)} 
                      className="text-[10px] font-black tracking-wider text-emerald-600 hover:text-emerald-700 cursor-pointer flex items-center gap-1 uppercase"
                    >
                      {showQuickAddTeam ? '✖️ Cerrar' : '➕ Crear Rápido'}
                    </button>
                  </div>

                  {showQuickAddTeam && (
                    <div className="bg-white border border-emerald-100 rounded-lg p-3 space-y-2.5 animate-fadeIn">
                      <p className="text-[9px] font-black font-mono uppercase tracking-wider text-emerald-800">⚡ Agregar Equipo Rápido</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[8px] font-mono text-slate-500 block mb-0.5">Elegir Club Preset</label>
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                handleQuickPresetChange(e.target.value);
                                setShowQuickAddTeam(false);
                              }
                            }}
                            className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-2 py-1.5 focus:outline-hidden"
                            value=""
                          >
                            <option value="">Seleccionar...</option>
                            {PRESET_CLUBS.map((club) => (
                              <option key={club.name} value={club.name}>
                                {club.emoji} {club.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[8px] font-mono text-slate-500 block mb-0.5">Escribir Manual</label>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              placeholder="Ej. C.D Ovalle City"
                              value={quickTeamName}
                              onChange={(e) => setQuickTeamName(e.target.value)}
                              className="flex-1 text-xs bg-slate-50 text-slate-800 border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-hidden focus:border-emerald-500"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (quickTeamName.trim()) {
                                  const randomColor = TEAM_COLORS[Math.floor(Math.random() * TEAM_COLORS.length)];
                                  const randomShield = DEFAULT_SHIELDS[Math.floor(Math.random() * DEFAULT_SHIELDS.length)];
                                  onAddTeam(activeSeriesId, {
                                    name: quickTeamName.trim(),
                                    logoUrl: randomShield,
                                    color: randomColor
                                  });
                                  onTriggerNotification('general', 'status', '🛡️ Equipo Registrado', `Se ha guardado "${quickTeamName.trim()}" en la serie.`);
                                  setQuickTeamName('');
                                  setShowQuickAddTeam(false);
                                }
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black px-2 py-1 rounded-md cursor-pointer uppercase shrink-0"
                            >
                              Crear
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black font-mono uppercase tracking-wider text-slate-400 block mb-1">Fecha</label>
                    <input
                      type="date"
                      value={matchDate}
                      onChange={(e) => setMatchDate(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black font-mono uppercase tracking-wider text-slate-400 block mb-1">Hora (hs)</label>
                    <input
                      type="time"
                      value={matchTime}
                      onChange={(e) => setMatchTime(e.target.value)}
                      placeholder="18:00"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Agregar al Calendario
                </button>
              </form>
            )}
          </div>

          {/* Match list with deletion */}
          <div className="lg:col-span-7 bg-white border border-slate-200 p-5 rounded-2xl">
            <div className="border-b border-slate-100 pb-2.5 mb-3.5">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-500" />
                Partidos en Calendario ({matches.filter((m) => m.seriesId === activeSeriesId).length})
              </h3>
            </div>
            
            <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {matches.filter((m) => m.seriesId === activeSeriesId).length === 0 ? (
                <div className="text-center py-12 text-slate-400 italic text-xs">
                  Ningún partido agendado aún. Programa uno con el formulario de la izquierda.
                </div>
              ) : (
                matches
                  .filter((m) => m.seriesId === activeSeriesId)
                  .map((match) => {
                    const home = teams.find((t) => t.id === match.homeTeamId);
                    const away = teams.find((t) => t.id === match.awayTeamId);

                    return (
                      <div key={match.id} className="border border-slate-150 p-3 rounded-xl flex items-center justify-between hover:bg-slate-25 duration-100">
                        <div className="flex-1 min-w-0 pr-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] font-semibold text-slate-400 font-mono tracking-wider block">
                              🔔 {match.date} a las {match.time} hl
                            </span>
                            <span className={`text-[8px] font-bold uppercase rounded-sm px-1 font-mono ${
                              match.status === 'live' ? 'bg-rose-500 text-white animate-pulse' :
                              match.status === 'finished' ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}>
                              {match.status === 'live' ? 'VIVO' : match.status === 'finished' ? 'FINAL' : 'PAGDO'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                            <span className="truncate max-w-[100px]">{home?.name || '?'}</span>
                            <span className="font-mono text-[10px] text-slate-500">{match.homeScore}</span>
                            <span className="text-slate-400 text-[10px]">-</span>
                            <span className="font-mono text-[10px] text-slate-500">{match.awayScore}</span>
                            <span className="truncate max-w-[100px]">{away?.name || '?'}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => onDeleteMatch(match.id)}
                          title="Eliminar Partido"
                          className="p-1 px-1.5 text-xs text-rose-600 hover:text-rose-900 border border-rose-200 rounded-lg hover:bg-rose-50 transition shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- LIVE SCORER, INCIDENCIA REGISTER & MULTIMEDIA TAB --- */}
      {adminSubTab === 'scorer' && (
        <div className="space-y-6">
          
          {/* Active Select Match Under Administration */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Administrador de Encuentro Activo</h3>
              <p className="text-xs text-slate-400">Selecciona el juego para editar marcadores manualmente, subir fotos o emitir incidencias.</p>
            </div>
            
            <div className="w-full md:w-80">
              <select
                value={activeScorecardMatchId}
                onChange={(e) => setActiveScorecardMatchId(e.target.value)}
                className="w-full text-xs font-semibold appearance-none bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 cursor-pointer"
              >
                <option value="">-- Elige un partido --</option>
                {matches
                  .filter((m) => m.seriesId === activeSeriesId)
                  .map((m) => {
                    const home = teams.find((t) => t.id === m.homeTeamId);
                    const away = teams.find((t) => t.id === m.awayTeamId);
                    return (
                      <option key={m.id} value={m.id}>
                        {home?.name || '?'} {m.homeScore}-{m.awayScore} {away?.name || '?'} ({m.status.toUpperCase()})
                      </option>
                    );
                  })}
              </select>
            </div>
          </div>

          {!activeMatch ? (
            <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl italic text-slate-400 text-xs">
              No has seleccionado ningún encuentro para administrar. Elige uno arriba o crea partidos en la pestaña de "Crear Calendario".
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Score manual controllers */}
              <div className="lg:col-span-5 bg-white border border-slate-200 p-5 rounded-2xl space-y-5">
                <div className="border-b border-slate-100 pb-2">
                  <span className="text-[10px] text-slate-400 font-mono font-bold block">PARTIDO EN CONSOLA</span>
                  <h4 className="text-sm font-extrabold text-slate-800">Control de Marcadores</h4>
                </div>

                {/* Score panel */}
                <div className="grid grid-cols-3 items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <div>
                    <span className="text-xs font-bold text-slate-700 block truncate">{mHomeTeam?.name}</span>
                    <div className="flex items-center justify-center gap-1.5 mt-2">
                      <button
                        onClick={() => handleModifyScore('home', 'dec')}
                        className="w-7 h-7 bg-slate-200 text-slate-800 hover:bg-slate-300 font-extrabold text-xs rounded-full flex items-center justify-center cursor-pointer select-none"
                      >
                        -
                      </button>
                      <span className="text-2xl font-black font-mono text-slate-900 w-8">{activeMatch.homeScore}</span>
                      <button
                        onClick={() => handleModifyScore('home', 'inc')}
                        className="w-7 h-7 bg-slate-900 text-white hover:bg-slate-800 font-extrabold text-xs rounded-full flex items-center justify-center cursor-pointer select-none"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-bold text-slate-400 font-mono">ESTADO</span>
                    <div className="flex flex-col gap-1.5 mt-2 w-full px-1">
                      <button
                        onClick={() => handleChangeMatchStatus('scheduled')}
                        className={`text-[9px] py-1 px-1.5 font-bold rounded-md block cursor-pointer transition ${
                          activeMatch.status === 'scheduled' ? 'bg-blue-500 text-white' : 'bg-slate-200 hover:bg-slate-250 text-slate-700'
                        }`}
                      >
                        🗓️ Prog.
                      </button>
                      <button
                        onClick={() => handleChangeMatchStatus('live')}
                        className={`text-[9px] py-1 px-1.5 font-bold rounded-md block cursor-pointer transition ${
                          activeMatch.status === 'live' ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-200 hover:bg-slate-250 text-slate-700'
                        }`}
                      >
                        🟢 VIVO
                      </button>
                      <button
                        onClick={() => handleChangeMatchStatus('finished')}
                        className={`text-[9px] py-1 px-1.5 font-bold rounded-md block cursor-pointer transition ${
                          activeMatch.status === 'finished' ? 'bg-slate-700 text-slate-200' : 'bg-slate-200 hover:bg-slate-250 text-slate-700'
                        }`}
                      >
                        🏁 Final
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-700 block truncate">{mAwayTeam?.name}</span>
                    <div className="flex items-center justify-center gap-1.5 mt-2">
                      <button
                        onClick={() => handleModifyScore('away', 'dec')}
                        className="w-7 h-7 bg-slate-200 text-slate-800 hover:bg-slate-300 font-extrabold text-xs rounded-full flex items-center justify-center cursor-pointer select-none"
                      >
                        -
                      </button>
                      <span className="text-2xl font-black font-mono text-slate-900 w-8">{activeMatch.awayScore}</span>
                      <button
                        onClick={() => handleModifyScore('away', 'inc')}
                        className="w-7 h-7 bg-slate-900 text-white hover:bg-slate-800 font-extrabold text-xs rounded-full flex items-center justify-center cursor-pointer select-none"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Event Incidencia register form */}
                <form onSubmit={handleRegisterEvent} className="border-t border-slate-150 pt-3.5 space-y-3">
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                    <Bell className="w-3.5 h-3.5 text-rose-500" />
                    Registrar Evento & Notificar Push
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Tipo Evento</label>
                      <select
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value as any)}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-hidden text-slate-800"
                      >
                        <option value="goal">⚽ Gol</option>
                        <option value="yellow_card">🟨 Tarjeta Amarilla</option>
                        <option value="red_card">🟥 Tarjeta Roja</option>
                        <option value="substitute">🔄 Cambio / Sustitución</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Equipo Colectivo</label>
                      <select
                        value={eventTeamId}
                        onChange={(e) => setEventTeamId(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-hidden text-slate-800"
                        required
                      >
                        <option value="">Asignar...</option>
                        <option value={activeMatch.homeTeamId}>{mHomeTeam?.name}</option>
                        <option value={activeMatch.awayTeamId}>{mAwayTeam?.name}</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-8">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Nombre Jugador</label>
                      <input
                        type="text"
                        value={eventPlayer}
                        onChange={(e) => setEventPlayer(e.target.value)}
                        placeholder="Ej., Lionel Messi"
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-hidden text-slate-800"
                        required
                      />
                    </div>
                    <div className="col-span-4">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Minuto</label>
                      <input
                        type="number"
                        min={1}
                        max={120}
                        value={eventMinute}
                        onChange={(e) => setEventMinute(Number(e.target.value))}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-1.5 py-1.5 focus:outline-hidden text-slate-800 font-mono text-center"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Comentario Adicional (Opcional)</label>
                    <input
                      type="text"
                      value={eventDesc}
                      onChange={(e) => setEventDesc(e.target.value)}
                      placeholder="Ej., Cabezazo fulminante tras centro de saque de falta."
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-hidden text-slate-800"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Bell className="w-3.5 h-3.5 text-white animate-pulse" />
                    Registrar y Emitir Notificación Push
                  </button>
                </form>
              </div>

              {/* MULTIMEDIA UPLOADER DETAIL COLUMN */}
              <div className="lg:col-span-7 bg-white border border-slate-200 p-5 rounded-2xl space-y-5 flex flex-col justify-between">
                <div>
                  <div className="border-b border-slate-100 pb-2 mb-3.5">
                    <span className="text-[10px] text-slate-400 font-mono font-bold block">CONTENIDO DIGITAL</span>
                    <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-1">
                      <ImageIcon className="w-4 h-4 text-emerald-500" />
                      Galería Multimedia de Encuentro
                    </h4>
                  </div>

                  {/* Multimedia gallery display */}
                  <div className="grid grid-cols-2 gap-3 max-h-[170px] overflow-y-auto pr-1 mb-4" id="admin-media-gallery">
                    {activeMatch.media.length === 0 ? (
                      <div className="col-span-2 text-center py-8 bg-slate-55 border border-dashed border-slate-200 rounded-xl text-xs text-slate-400 italic">
                        No hay archivos multimedia registrados para este partido aún.
                      </div>
                    ) : (
                      activeMatch.media.map((med) => (
                        <div key={med.id} className="relative group border border-slate-150 rounded-xl overflow-hidden bg-slate-950 flex flex-col justify-between">
                          <img src={med.url} alt={med.caption} className="w-full h-24 object-cover opacity-90" referrerPolicy="no-referrer" />
                          <div className="p-1.5 bg-slate-50 border-t border-slate-150 flex items-center justify-between">
                            <p className="text-[9px] text-slate-600 truncate flex-1 font-sans">{med.caption}</p>
                            <button
                              onClick={() => {
                                const filterMedia = activeMatch.media.filter((m) => m.id !== med.id);
                                onUpdateMatch({ ...activeMatch, media: filterMedia });
                              }}
                              className="text-stone-400 hover:text-rose-600 p-0.5 rounded-xs transition cursor-pointer"
                              title="Remover"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Media form */}
                  <form onSubmit={handleAddMedia} className="space-y-3 bg-slate-50 p-4 border border-slate-200 rounded-xl">
                    <h5 className="text-[11px] font-bold text-slate-650 flex items-center gap-1 pb-1 border-b border-slate-200">
                      🚀 Subir Nueva Foto o Enlace
                    </h5>

                    {/* Choose URL vs upload */}
                    <div className="grid grid-cols-2 gap-2 my-2">
                      <button
                        type="button"
                        onClick={() => { setMediaMode('url'); setMediaUrl(''); }}
                        className={`text-[10px] py-1 px-2 font-bold rounded-md border ${
                          mediaMode === 'url' ? 'bg-slate-900 text-white' : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        Enlace de Imagen (URL)
                      </button>
                      <button
                        type="button"
                        onClick={() => { setMediaMode('file'); setMediaUrl(''); }}
                        className={`text-[10px] py-1 px-2 font-bold rounded-md border ${
                          mediaMode === 'file' ? 'bg-slate-900 text-white' : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        Cargar Archivo (Foto)
                      </button>
                    </div>

                    {mediaMode === 'url' ? (
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 block mb-0.5">Enlace URL de la Imagen</label>
                        <input
                          type="url"
                          value={mediaUrl}
                          onChange={(e) => setMediaUrl(e.target.value)}
                          placeholder="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600"
                          className="w-full text-xs bg-white border border-slate-250 rounded-lg px-2.5 py-1.5 focus:outline-hidden text-slate-800"
                        />
                      </div>
                    ) : (
                      <div className="border border-dashed border-slate-300 rounded-lg p-2.5 bg-white text-center">
                        <label className="cursor-pointer block">
                          <Upload className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                          <span className="text-[10px] text-slate-600 block font-bold">Seleccionar imagen del equipo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleMediaUpload}
                            className="hidden"
                          />
                        </label>
                        {mediaUrl.startsWith('data:image') && (
                          <span className="text-[9px] text-emerald-600 mt-1 block font-semibold font-mono">✅ Archivo listo para insertar</span>
                        )}
                      </div>
                    )}

                    <div>
                      <label className="text-[9px] font-bold text-slate-400 block mb-0.5">Epígrafe / Título de la Foto</label>
                      <input
                        type="text"
                        value={mediaCaption}
                        onChange={(e) => setMediaCaption(e.target.value)}
                        placeholder="Ej., Cabezazo que salvó el empate."
                        className="w-full text-xs bg-white border border-slate-250 rounded-lg px-2.5 py-1.5 focus:outline-hidden text-slate-800"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold py-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Añadir Contenido de Juego
                    </button>
                  </form>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* --- USERS MANAGEMENT TAB --- */}
      {adminSubTab === 'users' && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-2">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 font-display">
              👤 Panel de Control de Usuarios
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Administra quién tiene credenciales para acceder y administrar AFAOGOL. Los nuevos usuarios creados podrán ingresar de inmediato.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form list for registration */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
                <h4 className="text-xs font-bold text-slate-700 mb-3.5 flex items-center gap-1.5">
                  🛡️ Registrar / Inscribir Nuevo Usuario
                </h4>

                {userError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-600 text-[11px] p-2.5 rounded-xl mb-3 font-semibold">
                    {userError}
                  </div>
                )}

                {userSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 text-[11px] p-2.5 rounded-xl mb-3 font-semibold">
                    {userSuccess}
                  </div>
                )}

                <form onSubmit={handleCreateUser} className="space-y-3.5">
                  <div>
                    <label className="text-[10px] font-black font-mono uppercase tracking-wider text-slate-400 block mb-1">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      placeholder="Ej., Francisco Rojas"
                      className="w-full text-xs bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-slate-800 focus:outline-hidden focus:border-slate-400"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black font-mono uppercase tracking-wider text-slate-400 block mb-1">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="correo@ejemplo.com"
                      className="w-full text-xs bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-slate-800 focus:outline-hidden focus:border-slate-400"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black font-mono uppercase tracking-wider text-slate-400 block mb-1">
                      Contraseña Asignada
                    </label>
                    <input
                      type="text"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      placeholder="Elige una contraseña"
                      className="w-full text-xs bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-slate-800 focus:outline-hidden focus:border-slate-400 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black font-mono uppercase tracking-wider text-slate-400 block mb-1">
                      Rol de Permisos
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setNewUserRole('admin')}
                        className={`py-2 px-3 text-xs font-bold rounded-xl border transition cursor-pointer flex flex-col items-center justify-center ${
                          newUserRole === 'admin'
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        🛠️ Administrador
                        <span className="text-[8px] font-normal opacity-75 mt-0.5">Control Completo</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewUserRole('guest')}
                        className={`py-2 px-3 text-xs font-bold rounded-xl border transition cursor-pointer flex flex-col items-center justify-center ${
                          newUserRole === 'guest'
                            ? 'bg-sky-50 border-sky-300 text-sky-700'
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        👁️ Lector / Visor
                        <span className="text-[8px] font-normal opacity-75 mt-0.5">Sólo lectura</span>
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl transition cursor-pointer shadow-xs mt-2"
                  >
                    🚀 Guardar e Inscribir Usuario
                  </button>
                </form>
              </div>
            </div>

            {/* List of enrolled users */}
            <div className="lg:col-span-7 space-y-5">
              {/* --- PENDING REQUESTS SUB-TAB/PANEL --- */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50/70 border-2 border-amber-300 p-5 rounded-2xl shadow-xs">
                <h4 className="text-xs font-black text-amber-900 mb-3 flex items-center justify-between font-display">
                  <span className="flex items-center gap-1.5">
                    ⏳ Solicitudes de Registro Pendientes ({usersList.filter(u => u.status === 'pending').length})
                  </span>
                  <span className="text-[10px] bg-amber-500 text-white font-bold px-2 py-0.5 rounded-md font-mono uppercase">Revisión Requerida</span>
                </h4>

                <div className="divide-y divide-amber-200/80 max-h-[280px] overflow-y-auto pr-1">
                  {usersList.filter(u => u.status === 'pending').length === 0 ? (
                    <div className="py-8 text-center text-xs text-amber-800/60 font-semibold italic">
                      ✨ No hay solicitudes de registro pendientes de autorización en este momento.
                    </div>
                  ) : (
                    usersList.filter(u => u.status === 'pending').map((usr) => (
                      <div key={usr.email} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white/50 p-3 rounded-xl mb-2.5 border border-amber-200">
                        <div>
                          <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            👤 {usr.name}
                            <span className="text-[8px] bg-orange-100 text-orange-850 font-black px-1.5 py-0.5 rounded-sm font-mono border border-orange-200/60">
                              PENDIENTE: {usr.role === 'admin' ? 'ADMINISTRADOR' : 'LECTOR'}
                            </span>
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono mt-0.5">📨 {usr.email}</p>
                          <p className="text-[10px] text-slate-600 mt-0.5">⚽ Club: <strong className="text-slate-850">{usr.club || 'Sin Club'}</strong> • 📞 Tel: {usr.phone || 'Sin número'}</p>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto pt-1 sm:pt-0">
                          {/* 1. AUTHORIZE BUTTON */}
                          <button
                            onClick={() => handleAuthorizeUser(usr.email)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-extrabold rounded-lg shadow-xs cursor-pointer transition active:scale-95"
                            title="Autorizar cuenta de usuario"
                          >
                            <Check className="w-3.5 h-3.5" /> AUTORIZAR
                          </button>

                          {/* 2. SEND CREDENTIALS BY EMAIL (FROM ADMINISTRATOR) */}
                          <a
                            href={getAdminMailUrl(usr.name, usr.email, usr.password, usr.role)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-extrabold rounded-lg shadow-xs cursor-pointer transition active:scale-95"
                            title="Enviar credenciales finales al correo por el administrador"
                          >
                            📧 ENVIAR CORREO
                          </a>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* --- ACTIVE USERS PANEL --- */}
              <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
                <h4 className="text-xs font-bold text-slate-700 mb-3.5 flex items-center justify-between">
                  <span>📋 Cuentas Autorizadas ({usersList.filter(u => u.status !== 'pending').length})</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md font-mono">BASE SECURED</span>
                </h4>

                <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto pr-1 font-sans">
                  {usersList.filter(u => u.status !== 'pending').map((usr) => (
                    <div key={usr.email} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-[10px] font-extrabold font-mono shadow-xs shrink-0 ${
                          usr.role === 'admin'
                            ? 'bg-amber-100 border-amber-300/60 text-amber-700'
                            : 'bg-slate-100 border-slate-200 text-slate-600'
                        }`}>
                          {usr.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            {usr.name}
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm font-mono ${
                              usr.role === 'admin' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-650 border border-slate-200'
                            }`}>
                              {usr.role === 'admin' ? 'ADMINISTRADOR' : 'LECTOR'}
                            </span>
                          </p>
                          <p className="text-[11px] text-slate-450 font-mono mt-0.5">{usr.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right hidden sm:block">
                          <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                            Clave: {usr.password}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteUser(usr.email)}
                          disabled={usr.email.toLowerCase().trim() === 'sebafeliz@gmail.com'}
                          className={`p-1.5 rounded-lg border transition ${
                            usr.email.toLowerCase().trim() === 'sebafeliz@gmail.com'
                              ? 'opacity-35 bg-slate-50 text-slate-300 border-slate-150 cursor-not-allowed'
                              : 'bg-white text-rose-500 border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-400 cursor-pointer'
                          }`}
                          title={usr.email.toLowerCase().trim() === 'sebafeliz@gmail.com' ? 'Propietario Principal' : 'Dar de Baja Usuario'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
