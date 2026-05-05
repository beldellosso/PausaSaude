'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) alert(error.message);
    else {
      alert("Senha atualizada com sucesso!");
      router.push('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <form onSubmit={handleUpdatePassword} className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl space-y-6">
        <h2 className="text-2xl font-bold text-center">Nova Senha</h2>
        <input
          type="password"
          placeholder="Digite sua nova senha"
          className="w-full border p-2 rounded-lg"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <button 
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          {loading ? "Salvando..." : "Atualizar Senha"}
        </button>
      </form>
    </div>
  );
}