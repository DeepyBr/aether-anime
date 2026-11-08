import React, { useState } from 'react';
import { X, Sparkles, Check, QrCode, Copy, ShieldCheck, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { createPixPayment, verifyPixPayment } from '../services/api';

export default function VipModal({ isOpen, onClose, user, onUpdateVip }) {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [pixData, setPixData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const plans = [
    {
      id: 'monthly',
      name: 'Mensal',
      price: '14,90',
      period: 'por mês',
      tag: 'BÁSICO VIP',
    },
    {
      id: 'quarterly',
      name: 'Trimestral',
      price: '39,90',
      period: 'por trimestre',
      tag: 'POPULAR',
      popular: true,
    },
    {
      id: 'annual',
      name: 'Anual',
      price: '119,90',
      period: 'por ano',
      tag: 'ECONOMIZE 33%',
    },
  ];

  const handleGeneratePix = async () => {
    setLoading(true);
    const data = await createPixPayment(selectedPlan, user?.email);
    setPixData(data);
    setLoading(false);
  };

  const handleCopy = () => {
    if (!pixData?.pixCode) return;
    navigator.clipboard.writeText(pixData.pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulatePayment = async () => {
    if (!pixData) return;
    setLoading(true);
    const res = await verifyPixPayment(pixData.txId);
    if (res && res.isVip) {
      onUpdateVip(true);
      try {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.5 },
          colors: ['#00f0ff', '#ff007f', '#ffd700']
        });
      } catch {}
      setTimeout(() => {
        onClose();
        setPixData(null);
      }, 1800);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose}></div>

      <div className="relative w-full max-w-2xl bg-cyber-card border border-cyber-border rounded-3xl shadow-neon-dual p-6 sm:p-8 z-10 space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-cyber-bg border border-cyber-border text-slate-300 hover:text-white hover:border-cyber-pink hover:shadow-neon-pink transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full neon-badge text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            AETHER VIP CLUB
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-wide">
            Eleve sua experiência ao Nível Máximo
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
            Assista sem limites, sem anúncios e com qualidade de cinema 1080p Full HD.
          </p>
        </div>

        {/* VIP Perks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-4 rounded-2xl bg-cyber-bg/70 border border-cyber-border text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-cyber-cyan shrink-0" />
            <span>100% Sem anúncios ou pop-ups</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-cyber-cyan shrink-0" />
            <span>Full HD 1080p & 60 FPS garantidos</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-cyber-pink shrink-0" />
            <span>Downloads liberados para offline</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-cyber-pink shrink-0" />
            <span>Emblema VIP dourado no chat e perfil</span>
          </div>
        </div>

        {!pixData ? (
          /* Plan Selection */
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {plans.map(p => {
                const active = selectedPlan === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPlan(p.id)}
                    className={`relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      active
                        ? 'bg-cyber-cyan/10 border-cyber-cyan shadow-neon-cyan'
                        : 'bg-cyber-bg/60 border-cyber-border hover:border-slate-600'
                    }`}
                  >
                    {p.popular && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-bold px-2 py-0.5 rounded-full bg-cyber-pink text-white shadow-neon-pink">
                        {p.tag}
                      </span>
                    )}

                    <div className="space-y-1 text-center">
                      <h4 className="text-sm font-bold text-white">{p.name}</h4>
                      <div className="font-display font-black text-2xl text-cyber-cyan">
                        R$ {p.price}
                      </div>
                      <span className="text-[10px] text-slate-400 block">{p.period}</span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-cyber-border/40 text-center">
                      <div className={`w-4 h-4 rounded-full mx-auto border flex items-center justify-center ${
                        active ? 'border-cyber-cyan bg-cyber-cyan' : 'border-slate-600'
                      }`}>
                        {active && <Check className="w-3 h-3 text-cyber-bg stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleGeneratePix}
              disabled={loading}
              className="w-full btn-neon-gradient py-3.5 rounded-2xl font-display font-bold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  Pagar com Pix Instantâneo
                </>
              )}
            </button>
          </div>
        ) : (
          /* Pix Checkout QR Code */
          <div className="p-4 sm:p-6 rounded-2xl bg-cyber-bg border border-cyber-border text-center space-y-4 animate-fadeIn">
            <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider block">
              PIX GERADO COM SUCESSO
            </span>

            <div className="relative inline-block p-2 rounded-2xl bg-slate-900 border-2 border-cyber-cyan shadow-neon-cyan">
              <img 
                src={pixData.qrCodeImage} 
                alt="QR Code Pix"
                className="w-48 h-48 rounded-xl object-contain"
              />
            </div>

            <div className="text-xs text-slate-300">
              Valor: <strong className="text-cyber-cyan font-bold text-sm">R$ {pixData.amount}</strong>
            </div>

            {/* Copy Button */}
            <div className="flex gap-2 max-w-md mx-auto">
              <input
                type="text"
                readOnly
                value={pixData.pixCode}
                className="flex-1 px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-slate-400 truncate"
              />
              <button
                onClick={handleCopy}
                className="px-4 py-2 rounded-xl bg-cyber-card border border-cyber-border hover:border-cyber-cyan text-xs font-bold text-white flex items-center gap-1.5 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>

            {/* Simulation button */}
            <div className="pt-2">
              <button
                onClick={handleSimulatePayment}
                disabled={loading}
                className="btn-neon-gradient px-8 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 mx-auto cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                {loading ? 'Confirmando...' : 'Confirmar Pagamento (Teste Instantâneo)'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
