import React, { useState } from 'react';
import { HelpCircle, Award, Sparkles, RotateCcw, Check, X, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';

const QUESTIONS = [
  {
    id: 1,
    question: "Em Solo Leveling, qual é o rank inicial de Sung Jin-Woo antes de despertar o Sistema?",
    options: ["Rank S", "Rank E", "Rank B", "Rank D"],
    correct: 1,
    explanation: "Sung Jin-Woo era conhecido como 'a arma mais fraca da humanidade' e possuía o Rank E."
  },
  {
    id: 2,
    question: "Qual é o nome do demônio de cauda selado dentro de Naruto Uzumaki?",
    options: ["Shukaku", "Gyuki", "Kurama", "Matatabi"],
    correct: 2,
    explanation: "A Raposa de Nove Caudas é Kurama."
  },
  {
    id: 3,
    question: "Em One Piece, qual fruta do diabo Monkey D. Luffy consumiu?",
    options: ["Gomu Gomu no Mi (Hito Hito no Mi: Nika)", "Mera Mera no Mi", "Ope Ope no Mi", "Gura Gura no Mi"],
    correct: 0,
    explanation: "Luffy consumiu a Hito Hito no Mi, Modelo: Nika (conhecida como Gomu Gomu no Mi)."
  },
  {
    id: 4,
    question: "Quem é o feiticeiro de Jujutsu Kaisen que possui os 'Seis Olhos' e o Ilimitado?",
    options: ["Megumi Fushiguro", "Yuji Itadori", "Satoru Gojo", "Suguru Geto"],
    correct: 2,
    explanation: "Satoru Gojo é o portador dos Seis Olhos e o feiticeiro mais poderoso da era moderna."
  },
  {
    id: 5,
    question: "Em Bleach, qual é o nome da Zanpakutou de Ichigo Kurosaki?",
    options: ["Senbonzakura", "Zangetsu", "Hyourinmaru", "Kyoka Suigetsu"],
    correct: 1,
    explanation: "A espada espiritual de Ichigo Kurosaki se chama Zangetsu."
  },
  {
    id: 6,
    question: "Qual titã Eren Yeager herda de seu pai no início de Attack on Titan?",
    options: ["Titã Blindado", "Titã de Ataque e Titã Fundador", "Titã Bestial", "Titã Colossal"],
    correct: 1,
    explanation: "Grisha Yeager passa tanto o Titã de Ataque quanto o Titã Fundador para Eren."
  }
];

export default function QuizView() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completed, setCompleted] = useState(false);

  const q = QUESTIONS[currentIdx];

  const handleSelectOption = (index) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    if (index === q.correct) {
      setScore(prev => prev + 100 + (streak * 20));
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < QUESTIONS.length) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setCompleted(true);
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#00f0ff', '#ff007f', '#a855f7']
        });
      } catch {}
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setStreak(0);
    setCompleted(false);
  };

  const getRank = () => {
    const maxScore = QUESTIONS.length * 100;
    const ratio = score / (maxScore || 1);
    if (ratio >= 0.9) return { title: 'HOKAGE LENDÁRIO', color: 'text-amber-400', desc: 'Seu conhecimento otaku é divino! Nível mestre absoluto.' };
    if (ratio >= 0.7) return { title: 'JONIN DE ELITE', color: 'text-cyber-cyan', desc: 'Você manja muito do universo anime!' };
    if (ratio >= 0.4) return { title: 'CHUNIN DEDICADO', color: 'text-cyber-pink', desc: 'Bom desempenho! Mais algumas temporadas e você chega ao topo.' };
    return { title: 'GENIN INICIANTE', color: 'text-slate-400', desc: 'Começando a jornada! Continue assistindo mais episódios no Aether.' };
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      
      {/* Title Card */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full neon-badge text-xs font-mono font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          ARENA OTAKU LOGIA
        </div>
        <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-wider">
          QUIZ DOS ANIMES
        </h1>
        <p className="text-sm text-slate-300 mt-2">
          Teste seus conhecimentos sobre o multiverso dos animes e conquiste seu título ninja!
        </p>
      </div>

      {!completed ? (
        <div className="neon-border-box p-6 sm:p-8 space-y-6">
          
          {/* Header Stats */}
          <div className="flex items-center justify-between pb-4 border-b border-cyber-border text-xs sm:text-sm">
            <span className="font-mono text-slate-300">
              Pergunta <strong className="text-cyber-cyan">{currentIdx + 1}</strong> de {QUESTIONS.length}
            </span>

            <div className="flex items-center gap-4">
              {streak > 1 && (
                <span className="flex items-center gap-1 font-bold text-amber-400 animate-pulse">
                  <Flame className="w-4 h-4 fill-current" /> Combo {streak}x!
                </span>
              )}
              <span className="font-display font-bold text-cyber-pink text-sm sm:text-base">
                {score} PTS
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyber-cyan to-cyber-pink transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / QUESTIONS.length) * 100}%` }}
            />
          </div>

          {/* Question Text */}
          <h2 className="font-display font-bold text-lg sm:text-xl text-white leading-relaxed">
            {q.question}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {q.options.map((opt, idx) => {
              let btnStyle = 'bg-cyber-bg/80 border-cyber-border text-slate-200 hover:border-cyber-cyan hover:bg-cyber-card';
              
              if (isAnswered) {
                if (idx === q.correct) {
                  btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]';
                } else if (idx === selectedOption) {
                  btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]';
                } else {
                  btnStyle = 'bg-cyber-bg/40 border-slate-800 text-slate-500 opacity-60';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswered}
                  className={`w-full p-4 rounded-2xl border text-left font-semibold text-sm transition-all duration-200 flex items-center justify-between cursor-pointer ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {isAnswered && idx === q.correct && (
                    <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                  )}
                  {isAnswered && idx === selectedOption && idx !== q.correct && (
                    <X className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation when answered */}
          {isAnswered && (
            <div className="p-4 rounded-2xl bg-cyber-card border border-cyber-border space-y-2 animate-fadeIn">
              <p className="text-xs font-mono text-cyber-cyan font-bold">CURIOSIDADE:</p>
              <p className="text-xs text-slate-300">{q.explanation}</p>
              <div className="pt-2 text-right">
                <button
                  onClick={handleNext}
                  className="btn-neon-gradient px-6 py-2 rounded-xl text-xs font-bold"
                >
                  {currentIdx + 1 === QUESTIONS.length ? 'Ver Resultado' : 'Próxima Pergunta →'}
                </button>
              </div>
            </div>
          )}

        </div>
      ) : (
        /* Quiz Finished Result Screen */
        <div className="neon-border-box p-8 sm:p-12 text-center space-y-6">
          <div className="w-20 h-20 rounded-full mx-auto bg-gradient-to-tr from-cyber-cyan to-cyber-pink flex items-center justify-center shadow-neon-dual animate-bounce">
            <Award className="w-10 h-10 text-white" />
          </div>

          <div>
            <span className="text-xs uppercase tracking-widest font-mono text-slate-400">
              CLASSIFICAÇÃO FINAL
            </span>
            <h2 className={`font-display font-black text-3xl sm:text-4xl mt-1 tracking-wider ${getRank().color}`}>
              {getRank().title}
            </h2>
            <p className="text-sm text-slate-300 mt-2 max-w-md mx-auto">
              {getRank().desc}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-cyber-bg border border-cyber-border inline-block px-8">
            <span className="text-xs text-slate-400 uppercase font-mono">Pontuação Final</span>
            <div className="font-display font-black text-4xl text-white neon-text-cyan mt-1">
              {score} <span className="text-base text-slate-400">pontos</span>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-center gap-4">
            <button
              onClick={handleRestart}
              className="btn-neon-gradient px-8 py-3.5 rounded-xl font-bold text-sm flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Jogar Novamente
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
