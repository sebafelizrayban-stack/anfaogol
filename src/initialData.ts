/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Series, Team, Match } from './types';

export const initialSeries: Series[] = [
  { id: 's1', name: 'Serie A Profesional' },
  { id: 's2', name: 'Serie B Promoción' },
  { id: 's3', name: 'Serie C Amateur' },
  { id: 's4', name: 'Liga Femenina PRO' },
  { id: 's5', name: 'Torneo Juvenil Sub-20' },
];

export const initialTeams: Record<string, Team[]> = {
  s1: [
    { id: 't1_1', name: 'Leones F.C.', logoUrl: '🦁', color: '#3b82f6' },
    { id: 't1_2', name: 'Águilas del Sur', logoUrl: '🦅', color: '#ef4444' },
    { id: 't1_3', name: 'Lobos del Norte', logoUrl: '🐺', color: '#10b981' },
    { id: 't1_4', name: 'Rayos F.C.', logoUrl: '⚡', color: '#f59e0b' },
    { id: 't1_5', name: 'Furia Roja', logoUrl: '🔥', color: '#8b5cf6' },
    { id: 't1_6', name: 'Deportivo Imperial', logoUrl: '👑', color: '#ec4899' },
  ],
  s2: [
    { id: 't2_1', name: 'Fénix Club', logoUrl: '🔥', color: '#f97316' },
    { id: 't2_2', name: 'Club Atlético Tiburón', logoUrl: '🦈', color: '#06b6d4' },
    { id: 't2_3', name: '龍 Dragones F.C.', logoUrl: '🐉', color: '#14b8a6' },
    { id: 't2_4', name: 'Guerreros del Este', logoUrl: '⚔️', color: '#6b7280' },
    { id: 't2_5', name: 'Estrella de Plata', logoUrl: '⭐', color: '#3b82f6' },
    { id: 't2_6', name: 'Deportivo Gladiadores', logoUrl: '🛡️', color: '#ef4444' },
  ],
  s3: [
    { id: 't3_1', name: 'Real Vecindario', logoUrl: '⚽', color: '#10b981' },
    { id: 't3_2', name: 'Unión Obrera', logoUrl: '⚒️', color: '#f59e0b' },
    { id: 't3_3', name: 'Praderas F.C.', logoUrl: '🌲', color: '#8b5cf6' },
    { id: 't3_4', name: 'Río Claro', logoUrl: '💧', color: '#ec4899' },
    { id: 't3_5', name: 'Brisas del Mar', logoUrl: '🌊', color: '#06b6d4' },
    { id: 't3_6', name: 'Centauros San Luis', logoUrl: '🐴', color: '#f97316' },
  ],
  s4: [
    { id: 't4_1', name: 'Pink Power F.C.', logoUrl: '🌸', color: '#ec4899' },
    { id: 't4_2', name: 'Amazonas del Plata', logoUrl: '🏹', color: '#14b8a6' },
    { id: 't4_3', name: 'Centellas', logoUrl: '⚡', color: '#f59e0b' },
    { id: 't4_4', name: 'Valkirias F.C.', logoUrl: '🛡️', color: '#3b82f6' },
    { id: 't4_5', name: 'Atenas Club', logoUrl: '🏛️', color: '#8b5cf6' },
    { id: 't4_6', name: 'Deportivo Sirenas', logoUrl: '🧜‍♀️', color: '#06b6d4' },
  ],
  s5: [
    { id: 't5_1', name: 'Academia Futuro', logoUrl: '🎓', color: '#3b82f6' },
    { id: 't5_2', name: 'Semillero F.C.', logoUrl: '🌱', color: '#10b981' },
    { id: 't5_3', name: 'Pájaros Azules', logoUrl: '🐦', color: '#06b6d4' },
    { id: 't5_4', name: 'Cachorros S20', logoUrl: '🐾', color: '#ef4444' },
    { id: 't5_5', name: 'Halcones Dorados', logoUrl: '🦅', color: '#f59e0b' },
    { id: 't5_6', name: 'Nuevos Talentos', logoUrl: '✨', color: '#8b5cf6' },
  ],
};

export const initialMatches: Match[] = [
  // --- Serie A (s1) ---
  {
    id: 'm1',
    seriesId: 's1',
    homeTeamId: 't1_1',
    awayTeamId: 't1_2',
    homeScore: 3,
    awayScore: 2,
    date: '2026-05-18',
    time: '18:00',
    status: 'finished',
    events: [
      { id: 'e1_1', type: 'goal', minute: 15, teamId: 't1_1', playerName: 'Carlos Tévez', description: 'Remate colocado del delantero estrella.' },
      { id: 'e1_2', type: 'goal', minute: 34, teamId: 't1_2', playerName: 'Julio Águila', description: 'Cabezazo potente tras tiro de esquina.' },
      { id: 'e1_3', type: 'yellow_card', minute: 42, teamId: 't1_1', playerName: 'Andrés Guardado' },
      { id: 'e1_4', type: 'goal', minute: 58, teamId: 't1_1', playerName: 'Carlos Tévez', description: 'Golazo de tiro libre directo al ángulo.' },
      { id: 'e1_5', type: 'goal', minute: 73, teamId: 't1_2', playerName: 'Mauricio Isla', description: 'Jugada colectiva y definición rasante.' },
      { id: 'e1_6', type: 'goal', minute: 89, teamId: 't1_1', playerName: 'Lucho Díaz', description: 'Contraataque letal sobre la hora para definir la victoria.' },
    ],
    media: [
      { id: 'med1_1', type: 'image', url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=60', caption: 'Estadio repleto celebrando el tiro libre de Carlos Tévez.' },
      { id: 'med1_2', type: 'image', url: 'https://images.unsplash.com/photo-1540747737956-378724044432?w=600&auto=format&fit=crop&q=60', caption: 'Abrazo tras el gol agónico de la victoria.' }
    ],
    comments: [
      { id: 'c1_1', user: 'Seba_Hincha', text: '¡Qué partido extraordinario! De los mejores del año sin duda alguna.', timestamp: '2026-05-18T19:55:00Z' },
      { id: 'c1_2', user: 'Laura_Fut', text: 'Dos goles de Tévez y un tiro libre supremo. Se merecen la punta.', timestamp: '2026-05-18T20:02:00Z' },
    ],
  },
  {
    id: 'm2',
    seriesId: 's1',
    homeTeamId: 't1_3',
    awayTeamId: 't1_4',
    homeScore: 1,
    awayScore: 1,
    date: '2026-05-19',
    time: '20:30',
    status: 'finished',
    events: [
      { id: 'e2_1', type: 'goal', minute: 22, teamId: 't1_3', playerName: 'Guillermo Ochoa (P)', description: 'Tiro de penal colocado de forma exquisita.' },
      { id: 'e2_2', type: 'yellow_card', minute: 45, teamId: 't1_4', playerName: 'Luis Romo' },
      { id: 'e2_3', type: 'goal', minute: 71, teamId: 't1_4', playerName: 'Rogelio Funes', description: 'Zurdazo cruzado inalcanzable para el portero.' },
    ],
    media: [
      { id: 'med2_1', type: 'image', url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&auto=format&fit=crop&q=60', caption: 'Ejecución del penal que abrió el marcador.' }
    ],
    comments: [
      { id: 'c2_1', user: 'Pedro_R', text: 'Justo empate. Lobos dominó el primer tiempo, pero Rayos reaccionó muy bien.', timestamp: '2026-05-19T22:30:00Z' }
    ],
  },
  {
    id: 'm3',
    seriesId: 's1',
    homeTeamId: 't1_5',
    awayTeamId: 't1_6',
    homeScore: 0,
    awayScore: 2,
    date: '2026-05-20',
    time: '19:00',
    status: 'finished',
    events: [
      { id: 'e3_1', type: 'goal', minute: 9, teamId: 't1_6', playerName: 'Rey Arturo', description: 'Cabezazo fulminante en el área chica.' },
      { id: 'e3_2', type: 'yellow_card', minute: 60, teamId: 't1_5', playerName: 'Gary Medel' },
      { id: 'e3_3', type: 'red_card', minute: 78, teamId: 't1_5', playerName: 'Gary Medel', description: 'Expulsión directa por conducta antideportiva.' },
      { id: 'e3_4', type: 'goal', minute: 82, teamId: 't1_6', playerName: 'Alexis Sánchez', description: 'Definición sutil por encima del arquero.' }
    ],
    media: [],
    comments: [
      { id: 'c3_1', user: 'Alexis_Fans', text: '¡Qué golazo de vaselina de Alexis! Un deleite técnico total.', timestamp: '2026-05-20T21:05:00Z' }
    ],
  },
  {
    id: 'm4',
    seriesId: 's1',
    homeTeamId: 't1_1',
    awayTeamId: 't1_3',
    homeScore: 2,
    awayScore: 1,
    date: '2026-05-21',
    time: '21:00',
    status: 'finished',
    events: [
      { id: 'e4_1', type: 'goal', minute: 40, teamId: 't1_1', playerName: 'Lucho Díaz' },
      { id: 'e4_2', type: 'goal', minute: 61, teamId: 't1_3', playerName: 'Guillermo Ochoa' },
      { id: 'e4_3', type: 'goal', minute: 88, teamId: 't1_1', playerName: 'Carlos Tévez' }
    ],
    media: [],
    comments: []
  },
  // --- Partido en Vivo de Serie A para que jueguen con él ---
  {
    id: 'm_live_1',
    seriesId: 's1',
    homeTeamId: 't1_5',
    awayTeamId: 't1_2',
    homeScore: 1,
    awayScore: 1,
    date: '2026-05-22',
    time: '15:30',
    status: 'live',
    events: [
      { id: 'el_1', type: 'goal', minute: 12, teamId: 't1_2', playerName: 'Julio Águila', description: 'Aprovechó un error en la salida de Furia Roja.' },
      { id: 'el_2', type: 'goal', minute: 44, teamId: 't1_5', playerName: 'Ever Banega', description: 'Bombazo de zurda que se desvió en la defensa.' },
    ],
    media: [],
    comments: [
      { id: 'cl_1', user: 'LiveStream_Lover', text: '¡Se viene un segundo tiempo electrizante! El marcador está abierto para cualquiera.', timestamp: '2026-05-22T01:10:00Z' }
    ],
  },
  // --- Futuros partidos programados ---
  {
    id: 'm_sch_1',
    seriesId: 's1',
    homeTeamId: 't1_4',
    awayTeamId: 't1_6',
    homeScore: 0,
    awayScore: 0,
    date: '2026-05-25',
    time: '20:00',
    status: 'scheduled',
    events: [],
    media: [],
    comments: [],
  },
  {
    id: 'm_sch_2',
    seriesId: 's1',
    homeTeamId: 't1_2',
    awayTeamId: 't1_4',
    homeScore: 0,
    awayScore: 0,
    date: '2026-05-28',
    time: '18:30',
    status: 'scheduled',
    events: [],
    media: [],
    comments: [],
  },

  // --- Serie B (s2) ---
  {
    id: 'm2_1',
    seriesId: 's2',
    homeTeamId: 't2_1',
    awayTeamId: 't2_2',
    homeScore: 2,
    awayScore: 0,
    date: '2026-05-17',
    time: '12:00',
    status: 'finished',
    events: [
      { id: 'e21_1', type: 'goal', minute: 49, teamId: 't2_1', playerName: 'Enzo Francescoli' },
      { id: 'e21_2', type: 'goal', minute: 86, teamId: 't2_1', playerName: 'Enzo Francescoli' },
    ],
    media: [],
    comments: [
      { id: 'c21_1', user: 'B_Prom', text: 'Impresionante Enzo, dos destellos de crack y liquidó a los Tiburones.', timestamp: '2026-05-17T14:00:00Z' }
    ]
  },
  {
    id: 'm2_2',
    seriesId: 's2',
    homeTeamId: 't2_3',
    awayTeamId: 't2_4',
    homeScore: 1,
    awayScore: 2,
    date: '2026-05-18',
    time: '16:00',
    status: 'finished',
    events: [
      { id: 'e22_1', type: 'goal', minute: 10, teamId: 't2_3', playerName: 'Bruce Lee' },
      { id: 'e22_2', type: 'goal', minute: 42, teamId: 't2_4', playerName: 'Héctor Herrera' },
      { id: 'e22_3', type: 'goal', minute: 88, teamId: 't2_4', playerName: 'Alan Pulido' },
    ],
    media: [],
    comments: []
  },
  {
    id: 'm2_3',
    seriesId: 's2',
    homeTeamId: 't2_5',
    awayTeamId: 't2_6',
    homeScore: 0,
    awayScore: 0,
    date: '2026-05-24',
    time: '16:00',
    status: 'scheduled',
    events: [],
    media: [],
    comments: [],
  },

  // --- Liga Femenina (s4) ---
  {
    id: 'm4_1',
    seriesId: 's4',
    homeTeamId: 't4_1',
    awayTeamId: 't4_2',
    homeScore: 4,
    awayScore: 2,
    date: '2026-05-18',
    time: '15:00',
    status: 'finished',
    events: [
      { id: 'e41_1', type: 'goal', minute: 2, teamId: 't4_1', playerName: 'Alex Morgan', description: 'Gol de camerino.' },
      { id: 'e41_2', type: 'goal', minute: 24, teamId: 't4_1', playerName: 'Marta Vieira' },
      { id: 'e41_3', type: 'goal', minute: 38, teamId: 't4_2', playerName: 'Estefanía Banini' },
      { id: 'e41_4', type: 'goal', minute: 55, teamId: 't4_1', playerName: 'Alex Morgan' },
      { id: 'e41_5', type: 'goal', minute: 70, teamId: 't4_2', playerName: 'Deyna Castellanos' },
      { id: 'e41_6', type: 'goal', minute: 90, teamId: 't4_1', playerName: 'Marta Vieira' },
    ],
    media: [
      { id: 'med4_1', type: 'image', url: 'https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=600&auto=format&fit=crop&q=60', caption: 'Festejo del hat-trick simbólico.' }
    ],
    comments: [
      { id: 'c41_1', user: 'GirlPower_Fan', text: '¡Partidazo! El nivel de la Liga Femenil está por las nubes.', timestamp: '2026-05-18T17:00:00Z' }
    ]
  },
];
