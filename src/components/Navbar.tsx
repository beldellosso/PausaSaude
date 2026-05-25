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
    <nav className="w-full absolute top-0 left-0 z-50 bg-transparent">
      <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-end">
        
        <div className="flex items-center gap-6 text-sm font-semibold text-[#427b8f]">
          <span className="text-[#3a6d7f] border-b-2 border-[#427b8f] pb-0.5 cursor-default">
            Início
          </span>
          
          <button 
            onClick={handleLogout}
            className="hover:text-[#2d5664] transition-colors flex items-center gap-1.5 bg-white/60 hover:bg-white/90 px-3 py-1.5 rounded-xl border border-[#cbe3ec] shadow-sm text-xs font-bold"
          >
            Sair
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>

      </div>
    </nav>
  );
};