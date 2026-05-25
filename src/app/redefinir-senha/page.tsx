'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase'; 
import { useRouter } from 'next/navigation';
import { Input } from '../../components/ui/Input'; 
import { Button } from '../../components/ui/Button'; 

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const router = useRouter();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setSucesso(null);

    if (newPassword.length < 6) {
      setErro("A senha deve conter no mínimo 6 caracteres.");
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        setErro(error.message);
      } else {
        setSucesso("Senha atualizada com sucesso! Redirecionando...");
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    } catch (err) {
      setErro("Erro operacional ao atualizar os dados de acesso.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf7] text-[#6b6053] flex flex-col justify-center items-center p-4">
      
      {/* Card de Redefinição idêntico ao de Login */}
      <div className="w-full max-w-md bg-white border border-[#edf0ec] p-8 rounded-2xl shadow-sm">
        
        {/* Cabeçalho com a Identidade Visual do PausaSaúde */}
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
            Defina seus novos parâmetros de segurança para reestabelecer o acesso ao ambiente restrito.
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          
          {/* Mensagens de feedback na tela (Adeus alerts nativos!) */}
          {erro && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl font-medium">
              ⚠️ {erro}
            </div>
          )}
          {sucesso && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl font-medium">
              ✅ {sucesso}
            </div>
          )}

          {/* Campo de Input claro e legível, idêntico ao Login */}
          <div className="space-y-1.5">
            <label htmlFor="pass" className="block text-[11px] font-medium text-[#968a7c]">Nova senha de acesso</label>
            <Input
              id="pass"
              type="password"
              placeholder="Digite no mínimo 6 caracteres"
              value={newPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full text-xs bg-[#fafaf9] !bg-[#fafaf9] border border-[#e2e0d5] text-[#5a5045] !text-[#5a5045] rounded-xl px-3 py-2.5 focus:border-[#bae6fd] focus:ring-[#bae6fd]"
            />
          </div>

          {/* Botão com o mesmo padrão visual do dashboard e login */}
          <div className="pt-3">
            <Button 
              type="submit" 
              isLoading={loading}
              className="w-full text-xs bg-[#e2f1f6] hover:bg-[#d0e7f0] text-[#2d5664] font-bold rounded-xl py-2.5 shadow-sm transition-all border border-[#bae6fd]"
            >
              Atualizar Credenciais
            </Button>
          </div>
        </form>
      </div>

      {/* Rodapé institucional */}
      <p className="text-[10px] text-[#a1988e] text-center mt-6 max-w-xs leading-relaxed">
        Acesso restrito. Os dados coletados são protegidos e vinculados exclusivamente ao ID do usuário autenticado.
      </p>
    </div>
  );
}