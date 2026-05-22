/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, Lock, Mail, CheckCircle, ArrowRight, Clipboard, ChevronLeft, User as UserIcon, Phone, Users, Sparkles, Award } from 'lucide-react';
import { User } from '../types';

export const DEFAULT_USERS = [
  { name: 'Seba Feliz', email: 'sebafeliz@gmail.com', password: 'afaogol2026', role: 'admin' as const, status: 'authorized' as const },
  { name: 'Administrador General', email: 'admin@afaogol.cl', password: 'admin123', role: 'admin' as const, status: 'authorized' as const },
  { name: 'Delegado Oficial', email: 'delegado@afaogol.cl', password: 'delegado123', role: 'admin' as const, status: 'authorized' as const },
  { name: 'Juan Pérez (Visor)', email: 'juan@afaogol.cl', password: 'juan123', role: 'guest' as const, status: 'authorized' as const }
];

interface LoginModalProps {
  onLoginSuccess: (user: User) => void;
}

export default function LoginModal({ onLoginSuccess }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);

  // Registration state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole] = useState<'admin' | 'guest'>('guest');
  const [regClub, setRegClub] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // Get users database (or initialize with defaults)
  const getUsersDb = () => {
    const saved = localStorage.getItem('afaogol_users_db');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure defaults are present with status authorized if initialized previously
        DEFAULT_USERS.forEach(def => {
          if (!parsed.some((u: any) => u.email.toLowerCase().trim() === def.email.toLowerCase().trim())) {
            parsed.push(def);
          }
        });
        return parsed;
      } catch (e) {
        return DEFAULT_USERS;
      }
    }
    localStorage.setItem('afaogol_users_db', JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor completa todos los campos.');
      return;
    }

    const db = getUsersDb();
    const user = db.find(
      (u: any) => u.email.toLowerCase().trim() === email.toLowerCase().trim() && u.password === password
    );

    if (user) {
      // Check if candidate is still pending admin review
      if (user.status === 'pending') {
        setError('Tu solicitud está en revisión. El administrador debe autorizar el inicio de sesión.');
        return;
      }
      
      const loggedUser: User = {
        id: user.id || `u_${Date.now()}`,
        name: user.name,
        email: user.email,
        role: user.role
      };
      onLoginSuccess(loggedUser);
    } else {
      setError('Credenciales inválidas. Comprueba el correo o la contraseña.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim() || !regClub.trim() || !regPhone.trim()) {
      setError('Por favor completa todos los campos de inscripción.');
      return;
    }

    const db = getUsersDb();
    const exists = db.some((u: any) => u.email.toLowerCase().trim() === regEmail.toLowerCase().trim());

    if (exists) {
      setError('Esta dirección de correo ya tiene una cuenta asociada.');
      return;
    }

    const newUser = {
      name: regName.trim(),
      email: regEmail.toLowerCase().trim(),
      password: regPassword.trim(),
      role: regRole,
      club: regClub.trim(),
      phone: regPhone.trim(),
      status: 'pending', // Pending administrator authorization
      id: `u_${Date.now()}`
    };

    const updatedDb = [...db, newUser];
    localStorage.setItem('afaogol_users_db', JSON.stringify(updatedDb));
    
    // Switch to success view (which informs that Admin authorizes and sends email)
    setIsSubmitSuccess(true);
  };

  const getCopyText = () => {
    return `AFAOGOL - Solicitud de Inscripción de Usuario:
Nombre Completo: ${regName}
Correo Electrónico: ${regEmail}
Contraseña Propuesta: ${regPassword}
Club / Equipo: ${regClub}
Teléfono: ${regPhone}
Rol Deseado: ${regRole === 'admin' ? 'Administrador' : 'Visor'}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCopyText());
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-stone-100 flex items-center justify-center p-4 z-50 overflow-y-auto">
      {/* Visual background decorations in light theme (Vivid Green, Orange and Sunny Yellow) */}
      <div className="absolute inset-0 bg-gradient-to-tr from-amber-50 via-white to-orange-50 pointer-events-none" />
      <div className="absolute top-20 left-10 w-96 h-96 bg-emerald-200/20 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-200/20 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 w-80 h-80 bg-yellow-200/15 rounded-full filter blur-2xl pointer-events-none" />

      {/* Simulated Smartphone Wrapper / Frame */}
      <div className="w-full max-w-sm bg-white border-4 border-emerald-600 rounded-[36px] shadow-2xl relative z-10 overflow-hidden flex flex-col my-6" style={{ height: '700px', maxHeight: '92vh' }}>
        
        {/* Smartphone top status bar placeholder */}
        <div className="bg-emerald-600 px-5 pt-2.5 pb-1 flex justify-between items-center text-[10px] text-white/90 font-mono select-none antialiased shrink-0 border-b border-emerald-500/30">
          <span className="font-extrabold tracking-tight">AFAOGOL LTE</span>
          <div className="w-14 h-4 bg-emerald-700/80 rounded-full absolute left-1/2 transform -translate-x-1/2 top-1.5 border border-emerald-500/20" />
          <div className="flex items-center gap-1.5 font-bold">
            <span>📶</span>
            <span>🔋 98%</span>
          </div>
        </div>

        {/* Dynamic Frame Inner Content Area */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-white">
          
          {/* --- 1. SUCCESS VIEW (ADMINISTRATOR MUST APPROVE AND EMAIL) --- */}
          {isSubmitSuccess ? (
            <div className="p-6 text-center space-y-5 flex-1 flex flex-col justify-center select-none">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 border-2 border-emerald-400 text-emerald-600 rounded-2xl mb-2 mx-auto animate-bounce">
                <CheckCircle className="w-8 h-8" />
              </div>
              
              <h3 className="text-xl font-extrabold text-emerald-800 font-display">Inscripción Enviada</h3>
              <p className="text-xs text-stone-605 font-medium leading-relaxed">
                Tus datos han sido pre-inscritos y guardados en el sistema central de <strong className="text-emerald-700">AFAOGOL</strong>.
              </p>
              
              <div className="text-left bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-4.5 space-y-2 text-xs">
                <p className="text-[10px] uppercase font-black tracking-wider text-orange-600 font-mono flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Estado de Solicitud:
                </p>
                <div className="h-0.5 bg-amber-200 my-1" />
                <p className="text-stone-800 font-bold flex items-center gap-1">👤 {regName}</p>
                <p className="text-stone-600 font-mono">📨 Correo: <span className="text-stone-850 font-bold">{regEmail}</span></p>
                <p className="text-stone-600 font-mono">⚽ Club: <span className="text-stone-850 font-bold">{regClub}</span></p>
                <div className="pt-1">
                  <span className="inline-block text-[9px] font-black font-mono px-2 py-0.5 rounded-md bg-amber-550 text-white shadow-xs">
                    ⚠️ EN REVISIÓN Y AUTORIZACIÓN
                  </span>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-3.5 text-left">
                <p className="text-[11px] text-yellow-800 leading-relaxed font-medium">
                  <strong>Revisión Pendiente:</strong> El administrador general del torneo revisará tus antecedentes para autorizar tu inicio de sesión formal.
                </p>
                <p className="text-[11px] text-yellow-800 leading-relaxed font-bold mt-1">
                  💡 Tras la aprobación, el administrador será quien te enviará la credencial formal a tu correo registrado.
                </p>
              </div>

              <div className="space-y-2 pt-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs py-2.5 rounded-xl transition cursor-pointer shadow-md"
                >
                  <Clipboard className="w-3.5 h-3.5" /> {isCopied ? '¡Copiado con Éxito!' : 'Copiar Ficha de Registro'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(false);
                    setIsSubmitSuccess(false);
                    setEmail(regEmail);
                    setPassword(regPassword);
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl transition cursor-pointer shadow-xs block"
                >
                  Regresar a la Pantalla de Acceso
                </button>
              </div>
            </div>
          ) : isRegistering ? (
            /* --- 2. REGISTER/INSCRIPTION INPUT SCENE --- */
            <div className="flex-1 flex flex-col justify-between">
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-4 border-b border-emerald-500 flex items-center gap-2 text-white shrink-0">
                <button
                  onClick={() => setIsRegistering(false)}
                  className="p-1 px-2 hover:bg-white/10 rounded-lg cursor-pointer transition flex items-center justify-center"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div>
                  <h3 className="text-xs font-bold font-display uppercase tracking-wider">Inscripción / Registro</h3>
                  <p className="text-[9px] text-yellow-300 font-mono font-bold tracking-tight">SOLICITUD DE DELEGADO O VISOR</p>
                </div>
              </div>

              {error && (
                <div className="mx-4 mt-3 bg-red-50 border border-red-250 text-red-700 text-[10px] p-2.5 rounded-xl font-bold">
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="p-4.5 space-y-3.5 flex-1 select-none overflow-y-auto">
                <div>
                  <label className="text-[9px] font-black font-mono uppercase tracking-wider text-emerald-800 block mb-1">Nombre Completo</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-2.5 w-3.5 h-3.5 text-emerald-600" />
                    <input
                      type="text"
                      required
                      placeholder="Ej., Roberto Tapia"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full bg-white text-stone-800 placeholder-stone-400 border border-stone-300 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-hidden focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black font-mono uppercase tracking-wider text-emerald-800 block mb-1">Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-3.5 h-3.5 text-emerald-600" />
                    <input
                      type="email"
                      required
                      placeholder="ejemplo@correo.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full bg-white text-stone-800 placeholder-stone-400 border border-stone-300 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-hidden focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[9px] font-black font-mono uppercase tracking-wider text-emerald-800 block mb-1">Club / Equipo</label>
                    <div className="relative">
                      <Users className="absolute left-2.5 top-2.5 w-3 h-3 text-emerald-600" />
                      <input
                        type="text"
                        required
                        placeholder="Ej., Santa Elena"
                        value={regClub}
                        onChange={(e) => setRegClub(e.target.value)}
                        className="w-full bg-white text-stone-800 placeholder-stone-400 border border-stone-300 rounded-xl pl-8 pr-2.5 py-2 text-xs focus:outline-hidden focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-black font-mono uppercase tracking-wider text-emerald-800 block mb-1">WhatsApp</label>
                    <div className="relative">
                      <Phone className="absolute left-2.5 top-2.5 w-3 h-3 text-emerald-600" />
                      <input
                        type="text"
                        required
                        placeholder="+569..."
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full bg-white text-stone-800 placeholder-stone-400 border border-stone-300 rounded-xl pl-8 pr-2.5 py-2 text-xs focus:outline-hidden focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 font-semibold"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black font-mono uppercase tracking-wider text-emerald-800 block mb-1">Contraseña Propuesta</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-emerald-600" />
                    <input
                      type="text"
                      required
                      placeholder="Escribe una contraseña segura"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full bg-white text-stone-800 placeholder-stone-400 border border-stone-300 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-hidden focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 font-mono font-bold text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black font-mono uppercase tracking-wider text-emerald-800 block mb-1.5">Rol de Acceso Solicitado</label>
                  <div className="bg-orange-50 border border-orange-300 text-orange-900 p-3 rounded-xl flex items-center gap-3">
                    <div className="text-xl">👁️</div>
                    <div className="text-left">
                      <p className="text-xs font-bold leading-none">Visor Lector (Acceso General)</p>
                      <p className="text-[9px] text-orange-700 font-semibold mt-1 leading-snug">
                        Permite visualizar resultados, fixture, delegados y tablas sin permisos de edición.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 shrink-0">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-extrabold text-xs py-2.5 rounded-xl transition cursor-pointer active:scale-98 shadow-md"
                  >
                    Registrar Solicitud en Sistema <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* --- 3. STANDARD LOGIN SCENE --- */
            <>
              {/* Card Header styling */}
              <div className="bg-gradient-to-b from-emerald-50 via-white to-white p-5 pt-7 border-b border-stone-150 text-center relative select-none shrink-0">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-yellow-405 to-orange-500 text-white rounded-2xl mb-2.5 shadow-md">
                  <Shield className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-black text-emerald-800 tracking-tight font-display uppercase">AFAOGOL</h2>
                <p className="text-[10px] font-mono font-bold tracking-wider text-orange-600 mt-1 uppercase">
                  Sistema de Fútbol Amateur
                </p>
                <div className="flex justify-center items-center gap-1.5 mt-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[8.5px] font-semibold text-stone-400 tracking-wide uppercase">Canchas Conectadas Chiles</span>
                </div>
              </div>

              {/* Direct login info alert */}
              <div className="bg-yellow-50 px-5 py-3 border-b border-stone-150 flex items-center gap-2.5 select-none shrink-0">
                <Award className="w-4 h-4 text-orange-555 shrink-0" />
                <p className="text-[9.5px] text-yellow-900 font-bold leading-tight">
                  Ingresa tus credenciales autorizadas por el Administrador General o solicita tu ficha.
                </p>
              </div>

              {/* Content Body */}
              <div className="p-5 flex-1 flex flex-col justify-between overflow-y-auto">
                <div className="space-y-4">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl font-bold flex items-center gap-1.5 leading-snug">
                      <Lock className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <form onSubmit={handleLogin} className="space-y-3.5">
                    <div>
                      <label className="text-[9px] font-black font-mono uppercase tracking-wider text-emerald-800 block mb-1">Correo Electrónico</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 w-3.5 h-3.5 text-emerald-600" />
                        <input
                          type="email"
                          required
                          placeholder="correo@afaogol.cl"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-white text-stone-800 placeholder-stone-400 border border-stone-300 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/20 font-semibold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] font-black font-mono uppercase tracking-wider text-emerald-800 block mb-1">Contraseña</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-emerald-600" />
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-white text-stone-800 placeholder-stone-405 border border-stone-300 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/20 font-semibold"
                        />
                      </div>
                    </div>

                    <div className="pt-1 select-none">
                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 rounded-xl transition cursor-pointer active:scale-98 shadow-md"
                      >
                        Ingresar de Forma Segura <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </div>

                {/* Secure Registration trigger button for non-registered users */}
                <div className="mt-6 pt-4 border-t border-stone-150 text-center shrink-0 select-none">
                  <p className="text-[10px] text-stone-400 font-medium">¿Delegado o Visor Nuevo sin cuenta aún?</p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegistering(true);
                      setIsSubmitSuccess(false);
                      setError('');
                    }}
                    className="mt-2 text-xs font-black text-orange-500 hover:text-orange-600 tracking-wider flex items-center justify-center gap-1 mx-auto transition cursor-pointer border border-orange-200/50 bg-orange-50/50 hover:bg-orange-50 px-4 py-1.5 rounded-xl"
                  >
                    📝 REGISTRATE / SOLICITAR CLAVE
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Device bottom home control pill */}
        <div className="bg-white border-t border-stone-150 py-2.5 flex justify-center items-center shrink-0">
          <div className="w-28 h-1 bg-stone-300 rounded-full" />
        </div>

      </div>
    </div>
  );
}
