'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase'; 
import { Input } from '../../components/ui/Input'; 
import { Button } from '../../components/ui/Button'; 

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false); 
  const [erro, setErro] = useState<string | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErro(null);
    setMensagemSucesso(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (error) {
        setErro(error.message);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setErro('Ocorreu um erro inesperado ao tentar fazer login.');
    } finally {
      setLoading(false);
    }
  };

  const handleEsqueciSenha = async () => {
    if (!email) {
      setErro('Por favor, insira seu e-mail no campo correspondente para poder recuperar sua senha.');
      return;
    }
    
    setLoading(true);
    setErro(null);
    setMensagemSucesso(null);

    try {
      const redirectUrl = `${window.location.origin}/redefinir-senha`;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        setErro(`Erro na requisição: ${error.message}`);
        return;
      }

      setMensagemSucesso('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
    } catch (err: any) {
      setErro('Erro operacional ao solicitar a redefinição de acesso.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf7] text-[#6b6053] flex flex-col justify-center items-center p-4">
      
      {/* Container Principal do Card */}
      <div className="w-full max-w-md bg-white border border-[#edf0ec] p-8 rounded-2xl shadow-sm">
        
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2.5 mb-3">
            <span className="text-[#3a6d7f]">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="28" 
                height="28" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </span>
            <h1 className="text-2xl font-bold text-[#3a6d7f] tracking-tight">
              Pausa<span className="text-[#5ba1b8]">Saúde</span>
            </h1>
          </div>
          <p className="text-xs text-[#6b8b96] max-w-xs mx-auto leading-relaxed">
            Acesse seu Ambiente de Controle Integrado para monitoramento de variáveis energéticas e jejum.
          </p>
        </div>

        {/* Notificações internas ao formulário */}
        <form onSubmit={handleLogin} className="space-y-4">
          {erro && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl font-medium">
              ⚠️ {erro}
            </div>
          )}
          {mensagemSucesso && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl font-medium">
              ✅ {mensagemSucesso}
            </div>
          )}

          {/* Campo de E-mail */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium text-[#968a7c]">E-mail</label>
            <Input
              type="email"
              placeholder="exemplo@email.com"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full text-xs bg-[#fafaf9] !bg-[#fafaf9] border border-[#e2e0d5] text-[#5a5045] !text-[#5a5045] rounded-xl px-3 py-2.5 focus:border-[#bae6fd] focus:ring-[#bae6fd]"
            />
          </div>

          {/* Campo de Senha com Link de Redefinição integrado */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-[11px] font-medium text-[#968a7c]">Senha</label>
              <button
                type="button"
                onClick={handleEsqueciSenha}
                disabled={loading}
                className="text-[11px] text-[#427b8f] hover:underline font-medium transition-all"
              >
                Esqueci minha senha
              </button>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSenha(e.target.value)}
              required
              disabled={loading}
              className="w-full text-xs bg-[#fafaf9] !bg-[#fafaf9] border border-[#e2e0d5] text-[#5a5045] !text-[#5a5045] rounded-xl px-3 py-2.5 focus:border-[#bae6fd] focus:ring-[#bae6fd]"
            />
          </div>

          <div className="pt-3">
            <Button 
              type="submit" 
              isLoading={loading}
              className="w-full text-xs bg-[#e2f1f6] hover:bg-[#d0e7f0] text-[#2d5664] font-bold rounded-xl py-2.5 shadow-sm transition-all border border-[#bae6fd]"
            >
              Entrar no Painel
            </Button>
          </div>
        </form>
      </div>

      {/* Rodapé Acadêmico */}
      <p className="text-[10px] text-[#a1988e] text-center mt-6 max-w-xs leading-relaxed">
        Acesso restrito. Os dados coletados são protegidos e vinculados exclusivamente ao ID do usuário autenticado.
      </p>
    </div>
  );
}