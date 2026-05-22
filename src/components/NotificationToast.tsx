/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bell, Trophy, AlertCircle, X, Volume2, VolumeX } from 'lucide-react';
import { PushNotification } from '../types';

interface NotificationToastProps {
  notifications: PushNotification[];
  onDismiss: (id: string) => void;
  onSelectMatch?: (matchId: string) => void;
}

// Simple synth sound generator to avoid external asset dependency
export function playWhistleSound() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create referee whistle sound
    const oscillator1 = audioCtx.createOscillator();
    const oscillator2 = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator1.type = 'sine';
    oscillator1.frequency.setValueAtTime(1000, audioCtx.currentTime);
    oscillator1.frequency.linearRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
    oscillator1.frequency.linearRampToValueAtTime(1000, audioCtx.currentTime + 0.2);

    oscillator2.type = 'triangle';
    oscillator2.frequency.setValueAtTime(1020, audioCtx.currentTime);
    oscillator2.frequency.linearRampToValueAtTime(1220, audioCtx.currentTime + 0.1);
    oscillator2.frequency.linearRampToValueAtTime(1020, audioCtx.currentTime + 0.2);

    gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);

    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator1.start();
    oscillator2.start();
    
    oscillator1.stop(audioCtx.currentTime + 0.35);
    oscillator2.stop(audioCtx.currentTime + 0.35);

    // Play a double blast for that real referee whistle vibe
    setTimeout(() => {
      const audioCtx2 = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc1 = audioCtx2.createOscillator();
      const osc2 = audioCtx2.createOscillator();
      const gn = audioCtx2.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1000, audioCtx2.currentTime);
      osc1.frequency.linearRampToValueAtTime(1200, audioCtx2.currentTime + 0.08);
      osc1.frequency.linearRampToValueAtTime(1000, audioCtx2.currentTime + 0.15);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1015, audioCtx2.currentTime);
      osc2.frequency.linearRampToValueAtTime(1215, audioCtx2.currentTime + 0.08);
      osc2.frequency.linearRampToValueAtTime(1015, audioCtx2.currentTime + 0.15);

      gn.gain.setValueAtTime(0.15, audioCtx2.currentTime);
      gn.gain.exponentialRampToValueAtTime(0.01, audioCtx2.currentTime + 0.3);

      osc1.connect(gn);
      osc2.connect(gn);
      gn.connect(audioCtx2.destination);

      osc1.start();
      osc2.start();
      osc1.stop(audioCtx2.currentTime + 0.3);
      osc2.stop(audioCtx2.currentTime + 0.3);
    }, 200);

  } catch (e) {
    console.warn('Audio play restricted or unsupported:', e);
  }
}

export default function NotificationToast({
  notifications,
  onDismiss,
  onSelectMatch,
}: NotificationToastProps) {
  const [muted, setMuted] = useState(() => {
    return localStorage.getItem('football_notifications_muted') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('football_notifications_muted', String(muted));
  }, [muted]);

  // Keep track of previously seen notification ids to play sound only for newly added ones
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotif = notifications[notifications.length - 1];
      if (!seenIds.has(latestNotif.id)) {
        setSeenIds(prev => new Set([...prev, latestNotif.id]));
        if (!muted) {
          playWhistleSound();
        }
      }
    }
  }, [notifications, muted, seenIds]);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, x: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="pointer-events-auto relative overflow-hidden bg-slate-900 border border-slate-800 text-white rounded-xl shadow-2xl p-4 flex items-start gap-3 w-full backdrop-blur-md cursor-pointer hover:bg-slate-800 transition"
            onClick={() => onSelectMatch?.(notif.matchId)}
          >
            {/* Visual glow indicator based on type */}
            <div className={`absolute top-0 left-0 w-1.5 h-full ${
              notif.type === 'goal' ? 'bg-emerald-500' :
              notif.type === 'card' ? 'bg-amber-500' :
              notif.type === 'status' ? 'bg-blue-500' : 'bg-slate-500'
            }`} />

            <div className="flex-1 min-w-0 pl-1.5">
              <div className="flex items-center gap-1.5 mb-1">
                {notif.type === 'goal' && <Trophy className="w-4 h-4 text-emerald-400" />}
                {notif.type === 'card' && <AlertCircle className="w-4 h-4 text-amber-400" />}
                {notif.type === 'status' && <Bell className="w-4 h-4 text-blue-400" />}
                
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {notif.type === 'goal' ? '¡GOOOOOL!' :
                   notif.type === 'card' ? 'INCIDENCIA' :
                   notif.type === 'status' ? 'CAMBIO DE ESTADO' : 'NOTIFICACIÓN'}
                </span>
                
                <span className="text-[10px] text-slate-500 ml-auto">
                  {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-slate-100 mb-0.5 truncate">
                {notif.title}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {notif.body}
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDismiss(notif.id);
              }}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
