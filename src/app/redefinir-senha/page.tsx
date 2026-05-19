
'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      alert("A senha deve conter no mínimo 6 caracteres.");
      return;
    }
    
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      alert(error.message);
    } else {
      alert("Senha atualizada com sucesso!");
      router.push('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <form onSubmit={handleUpdatePassword} className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900">Nova Senha</h2>
          <p className="text-sm text-slate-500 mt-1">Insira os novos dados de acesso para sua conta</p>
        </div>
        <div className="space-y-1">
          <label htmlFor="pass" className="text-xs font-semibold text-slate-500 uppercase">Nova senha de acesso</label>
          <input
            id="pass"
            type="password"
            placeholder="Digite no mínimo 6 caracteres"
            className="w-full border rounded-lg p-2 outline-none focus:border-blue-500"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <button 
          disabled={loading}
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-bold transition-colors disabled:bg-blue-300 flex justify-center items-center"
        >
          {loading ? <Loader2 className="animate-spin" /> : "Atualizar Senha"}
        </button>
      </form>
    </div>
  );
}