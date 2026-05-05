'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { LogIn, UserPlus, Loader2, KeyRound } from 'lucide-react';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const router = useRouter();

  
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = isRegistering 
      ? await supabase.auth.signUp({ 
          email, 
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
        })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert(error.message);
    } else {
      if (isRegistering) {
        alert('Verifique seu e-mail para confirmar o cadastro!');
      } else {
        router.push('/dashboard');
        router.refresh(); 
      }
    }
    setLoading(false);
  };

 
  const handleResetPassword = async () => {
    if (!email) {
      alert("Por favor, digite seu e-mail no campo acima primeiro.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/redefinir-senha`,
    });

    if (error) alert(error.message);
    else alert("E-mail de recuperação enviado! Verifique sua caixa de entrada.");
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            {isRegistering ? 'Criar Conta' : 'Pausa Café & Saúde'}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {isRegistering ? 'Comece sua jornada hoje' : 'Acompanhe suas calorias e jejum'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleAuth}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase ml-1">E-mail</label>
              <input
                type="email"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none transition-all"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Senha</label>
              <input
                type="password"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {!isRegistering && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleResetPassword}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
              >
                <KeyRound size={12} />
                Esqueci minha senha
              </button>
            </div>
          )}

          <button
            disabled={loading}
            className="group relative flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-white font-medium hover:bg-blue-700 focus:outline-none disabled:bg-blue-300 transition-colors"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : isRegistering ? (
              <><UserPlus className="mr-2" size={20} /> Cadastrar</>
            ) : (
              <><LogIn className="mr-2" size={20} /> Entrar</>
            )}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-slate-100">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
          >
            {isRegistering ? 'Já tem uma conta? Faça login' : 'Não tem conta? Cadastre-se'}
          </button>
        </div>
      </div>
    </div>
  );
}