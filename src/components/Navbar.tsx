'use client';

import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';

export const Navbar = () => {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <nav className="w-full h-16 bg-gray-900 border-b border-gray-800 px-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          PausaSaúde
        </span>
      </div>
      <button
        onClick={handleLogout}
        className="text-sm font-medium text-gray-400 hover:text-white px-3 py-1.5 rounded-md hover:bg-gray-800 transition-colors"
      >
        Sair
      </button>
    </nav>
  );
};