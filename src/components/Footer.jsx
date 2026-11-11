import React from 'react';
import { Heart, Sparkles, Shield, CheckCircle } from 'lucide-react';

export default function Footer({ onSelectCategory }) {
  return (
    <footer className="mt-20 border-t border-cyber-border bg-cyber-bg/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyber-bg border-2 border-cyber-cyan flex items-center justify-center shadow-neon-cyan">
                <span className="font-display font-black text-cyber-cyan text-base">A</span>
              </div>
              <span className="font-display font-extrabold text-xl tracking-wider text-white">
                AETHER<span className="neon-text-pink text-xs uppercase px-1.5 py-0.5 rounded bg-pink-500/10 border border-cyber-pink/50 ml-1">OTAKU</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed">
              O ecossistema definitivo para amantes de animes, dublados, lançamentos de 2026 e cultura pop japonesa. 
              Experiência 100% livre, sem paywall, sem restrições e inspirada na estética Synthwave Cyberpunk.
            </p>

            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Servidores 100% Operacionais
              </span>
              <span>•</span>
              <span className="text-cyber-cyan font-mono">Full HD 1080p Liberado</span>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="font-display font-bold text-xs uppercase tracking-wider text-white mb-3">
              Categorias Populares
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              {['Ação', 'Shounen', 'Fantasia', 'Romance', 'Sci-Fi', 'Dublados'].map(cat => (
                <li key={cat}>
                  <button 
                    onClick={() => onSelectCategory(cat.toLowerCase())} 
                    className="hover:text-cyber-cyan transition cursor-pointer"
                  >
                    Animes de {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform Info */}
          <div>
            <h4 className="font-display font-bold text-xs uppercase tracking-wider text-white mb-3">
              Aether Universe
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle className="w-3.5 h-3.5" /> Acesso Livre & Sem Anúncios
              </li>
              <li>
                <span className="hover:text-white transition cursor-pointer">Termos de Uso</span>
              </li>
              <li>
                <span className="hover:text-white transition cursor-pointer">Privacidade & Cookies</span>
              </li>
              <li>
                <span className="hover:text-white transition cursor-pointer">Status dos Servidores</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-6 border-t border-cyber-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>© 2026 Aether-App / Otakulogia. Todos os direitos reservados aos respectivos estúdios.</p>
          <p className="flex items-center gap-1">
            Feito para fãs de anime com design Cyberpunk Neon <Sparkles className="w-3 h-3 text-cyber-cyan" />
          </p>
        </div>
      </div>
    </footer>
  );
}
