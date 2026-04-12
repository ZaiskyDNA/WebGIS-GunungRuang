"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase'; 
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // PERBAIKAN: Kita tampilkan pesan error ASLI langsung dari Supabase
      setErrorMsg(`Gagal: ${error.message}`);
      console.error("Detail Error Supabase:", error);
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };


  return (
    <main className="min-h-screen bg-volcano-sand flex flex-col justify-center items-center p-4">
      
      {/* Tombol Kembali ke Beranda */}
      <div className="absolute top-6 left-6">
        <Link href="/" className="text-volcano-dark hover:text-volcano-main font-semibold flex items-center gap-2 transition">
          <span>←</span> Kembali ke Portal Publik
        </Link>
      </div>

      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-2xl border-t-8 border-volcano-dark w-full max-w-md">
        
        {/* Header Form */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-volcano-main rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl">🌋</span>
          </div>
          <h1 className="text-2xl font-bold text-volcano-dark">Login Petugas</h1>
          <p className="text-sm text-gray-500 mt-2">
            Sistem Informasi Bencana Gunung Ruang
          </p>
        </div>

        {/* Pesan Error */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 text-sm rounded-lg text-center">
            {errorMsg}
          </div>
        )}

        {/* Form Login */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Petugas</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-volcano-main focus:border-volcano-main transition outline-none"
              placeholder="admin@ruang.go.id"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Kata Sandi</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-volcano-main focus:border-volcano-main transition outline-none"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-3 rounded-lg font-bold text-white transition shadow-md ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-volcano-dark hover:bg-volcano-main'
            }`}
          >
            {loading ? 'Memverifikasi...' : 'Masuk ke Dasbor'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-400">
          <p>Akses ini hanya diperuntukkan bagi Admin Pemda, BPBD, dan Relawan Terdaftar.</p>
        </div>

      </div>
    </main>
  );
}