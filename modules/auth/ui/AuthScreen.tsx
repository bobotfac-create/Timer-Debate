import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { ShieldCheck, User, Sparkles, Lock } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { signInAsGuest } = useAuth();
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="min-h-full w-full flex flex-col items-center justify-center p-4 bg-slate-900 relative overflow-hidden overflow-y-auto">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none fixed">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-sky-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in flex flex-col gap-6 my-10">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Debate Timer</h1>
          <p className="text-slate-400">Plataforma profesional para debate competitivo</p>
        </div>

        {/* Clerk Components Container */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden min-h-[400px] flex flex-col">
            
            {/* Toggle Header inside the card for seamless look */}
            <div className="flex border-b border-slate-700/50">
                <button 
                    onClick={() => setShowLogin(true)}
                    className={`flex-1 py-4 text-sm font-medium transition-colors ${showLogin ? 'bg-slate-800 text-sky-400 border-b-2 border-sky-400' : 'text-slate-400 hover:text-slate-200 bg-slate-900/30'}`}
                >
                    Iniciar Sesión
                </button>
                <button 
                    onClick={() => setShowLogin(false)}
                    className={`flex-1 py-4 text-sm font-medium transition-colors ${!showLogin ? 'bg-slate-800 text-sky-400 border-b-2 border-sky-400' : 'text-slate-400 hover:text-slate-200 bg-slate-900/30'}`}
                >
                    Crear Cuenta
                </button>
            </div>

            <div className="p-6 flex justify-center bg-slate-900/20">
                {showLogin ? (
                    <SignIn 
                        routing="virtual"
                        appearance={{
                            elements: {
                                card: "bg-transparent shadow-none w-full",
                                headerTitle: "hidden",
                                headerSubtitle: "hidden",
                                formButtonPrimary: "bg-sky-600 hover:bg-sky-500 text-white",
                                socialButtonsBlockButton: "bg-slate-700 border-slate-600 text-white hover:bg-slate-600",
                                formFieldInput: "bg-slate-900/50 border-slate-700 text-white",
                                formFieldLabel: "text-slate-300",
                                footerAction: "hidden",
                                identityPreviewText: "text-slate-300",
                                identityPreviewEditButton: "text-sky-400"
                            }
                        }}
                    />
                ) : (
                    <SignUp 
                        routing="virtual"
                        appearance={{
                            elements: {
                                card: "bg-transparent shadow-none w-full",
                                headerTitle: "hidden",
                                headerSubtitle: "hidden",
                                formButtonPrimary: "bg-sky-600 hover:bg-sky-500 text-white",
                                socialButtonsBlockButton: "bg-slate-700 border-slate-600 text-white hover:bg-slate-600",
                                formFieldInput: "bg-slate-900/50 border-slate-700 text-white",
                                formFieldLabel: "text-slate-300",
                                footerAction: "hidden"
                            }
                        }}
                    />
                )}
            </div>
        </div>

        {/* Guest Access Separator */}
        <div className="flex items-center gap-4 px-4">
          <div className="h-px bg-slate-700 flex-1"></div>
          <span className="text-slate-500 text-xs uppercase tracking-wider">O alternativamente</span>
          <div className="h-px bg-slate-700 flex-1"></div>
        </div>

        <button
          onClick={signInAsGuest}
          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-4 rounded-xl transition-all border border-slate-700 hover:border-slate-500 flex items-center justify-center gap-3 shadow-lg"
        >
          <User className="w-5 h-5" />
          Acceder como Invitado (Modo Limitado)
        </button>

        {/* Feature Comparison */}
        <div className="mt-4 pt-6 border-t border-slate-800">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 text-center">Beneficios de Cuenta Pro</h3>
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-800/30 p-4 rounded-xl border border-slate-800">
                <div className="space-y-2 opacity-60 grayscale">
                    <p className="font-bold text-slate-300">Invitado</p>
                    <ul className="space-y-1 text-slate-400">
                        <li className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> WSDC & BP</li>
                        <li className="flex items-center gap-1"><Lock className="w-3 h-3" /> Sin Guardado</li>
                        <li className="flex items-center gap-1"><Lock className="w-3 h-3" /> Sin Banco IA</li>
                    </ul>
                </div>
                <div className="space-y-2">
                    <p className="font-bold text-sky-400">Usuario Registrado</p>
                    <ul className="space-y-1 text-slate-300">
                        <li className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-sky-400" /> Tiempos Custom</li>
                        <li className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-sky-400" /> Generador Mociones</li>
                        <li className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-sky-400" /> Publicar Torneos</li>
                    </ul>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};