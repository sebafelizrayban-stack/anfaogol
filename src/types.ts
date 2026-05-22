/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Team {
  id: string;
  name: string;
  logoUrl: string; // Base64 or URL
  color: string;   // Accent color for UI charts/indicators
}

export interface MatchEvent {
  id: string;
  type: 'goal' | 'yellow_card' | 'red_card' | 'substitute' | 'other';
  minute: number;
  teamId: string;
  playerName: string;
  description?: string;
}

export interface MatchMedia {
  id: string;
  type: 'image' | 'video';
  url: string; // Base64 or URL
  caption: string;
}

export interface MatchComment {
  id: string;
  user: string;
  text: string;
  timestamp: string;
}

export interface Match {
  id: string;
  seriesId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  date: string;
  time: string;
  status: 'scheduled' | 'live' | 'finished';
  events: MatchEvent[];
  media: MatchMedia[];
  comments: MatchComment[];
}

export interface Series {
  id: string;
  name: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'guest';
}

export interface PushNotification {
  id: string;
  matchId: string;
  title: string;
  body: string;
  timestamp: string;
  type: 'goal' | 'card' | 'info' | 'status';
}

export interface TeamStats {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  history: ('W' | 'D' | 'L')[]; // Last 5 matches
}

// Default team icons (SVG Paths or Emojis encoded beautifully)
export const DEFAULT_SHIELDS = [
  "⚽", "🏆", "🛡️", "🔥", "⚡", "🦁", "🦅", "🐺", "🐻", "🐯", "🐆", "🦈", "🐉", "⚔️", "👑"
];

export const TEAM_COLORS = [
  "#3b82f6", // Blue
  "#ef4444", // Red
  "#10b981", // Emerald Green
  "#f59e0b", // Amber Yellow
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#14b8a6", // Teal
  "#f97316", // Orange
  "#6b7280"  // Gray
];
