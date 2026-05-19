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

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErro(null);

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

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            PausaSaúde
          </h1>
          <p className="text-sm text-gray-400 mt-2">Faça login para gerenciar suas refeições</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {erro && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-sm rounded-md font-medium">
              {erro}
            </div>
          )}

          <Input
            label="E-mail"
            type="email"
            placeholder="exemplo@email.com"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
            disabled={loading}
          />

          <Input
            label="Senha"
            type="password"
            placeholder="••••••••"
            value={senha}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSenha(e.target.value)}
            required
            disabled={loading}
          />

          <div className="pt-2">
            <Button type="submit" isLoading={loading}>
              Entrar no Painel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}