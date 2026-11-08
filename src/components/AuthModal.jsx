import React, { useState } from 'react';
import { X, User, Mail, ShieldCheck } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, user, onUpdateUser }) {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    const updated = {
      ...user,
      name,
      email: email || `${name.toLowerCase().replace(/\s+/g, '')}@aether.app`,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`
    };

    onUpdateUser(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose}></div>

      <div className="relative w-full max-w-md bg-cyber-card border border-cyber-border rounded-3xl shadow-neon-dual p-6 sm:p-8 z-10 space-y-6">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-cyber-bg border border-cyber-border text-slate-300 hover:text-white hover:border-cyber-pink hover:shadow-neon-pink transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="relative w-16 h-16 mx-auto rounded-full p-1 border-2 border-cyber-cyan shadow-neon-cyan bg-cyber-bg">
            <img 
              src={user?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=AetherOtaku'} 
              alt="Avatar" 
              className="w-full h-full rounded-full object-cover"
            />
          </div>

          <h2 className="font-display font-extrabold text-xl text-white">
            {user?.name || 'Perfil de Otaku'}
          </h2>
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs text-slate-400 font-mono">{user?.email}</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/40">
              ACESSO ILIMITADO
            </span>
          </div>
        </div>

        {/* Form to update Name */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-slate-300 font-semibold block mb-1">
              Nome / Nickname Otaku
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-cyan" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome ou apelido"
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-cyber-bg border border-cyber-border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyber-cyan focus:shadow-neon-cyan transition"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-300 font-semibold block mb-1">
              E-mail de Notificações
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-cyan" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-cyber-bg border border-cyber-border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyber-cyan focus:shadow-neon-cyan transition"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full btn-neon-gradient py-3 rounded-xl font-bold text-xs sm:text-sm cursor-pointer"
          >
            Salvar Perfil
          </button>
        </form>

      </div>
    </div>
  );
}
