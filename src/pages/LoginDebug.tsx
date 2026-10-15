import React, { useState } from 'react';
import { AuthService } from '@/services/authService';
import { supabase } from '@/integrations/supabase/client';

const LoginDebug = () => {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const testSupabaseConnection = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Testando conexão com Supabase...');
      const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
      
      if (error) {
        setError(`Erro na conexão: ${error.message}`);
        console.error('Erro Supabase:', error);
      } else {
        setResult({ type: 'connection', success: true, data });
        console.log('Conexão OK:', data);
      }
    } catch (err: any) {
      setError(`Erro inesperado: ${err.message}`);
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Testando login...');
      console.log('Email:', email);
      console.log('Password:', password);
      
      const result = await AuthService.login(email, password);
      
      console.log('Resultado do login:', result);
      setResult({ type: 'login', ...result });
      
      if (!result.success) {
        setError(result.error || 'Erro desconhecido');
      }
    } catch (err: any) {
      setError(`Erro inesperado: ${err.message}`);
      console.error('Erro no login:', err);
    } finally {
      setLoading(false);
    }
  };

  const testSupabaseAuth = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Testando Supabase Auth diretamente...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      console.log('Resultado Supabase Auth:', { data, error });
      
      if (error) {
        setError(`Erro Supabase Auth: ${error.message}`);
        setResult({ type: 'supabase_auth', success: false, error: error.message });
      } else {
        setResult({ type: 'supabase_auth', success: true, data });
      }
    } catch (err: any) {
      setError(`Erro inesperado: ${err.message}`);
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug de Login</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Configurações de Teste</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Senha:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Testes</h2>
          
          <div className="space-y-4">
            <button
              onClick={testSupabaseConnection}
              disabled={loading}
              className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Testando...' : 'Testar Conexão Supabase'}
            </button>
            
            <button
              onClick={testSupabaseAuth}
              disabled={loading}
              className="w-full bg-green-500 text-white p-3 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Testando...' : 'Testar Supabase Auth Direto'}
            </button>
            
            <button
              onClick={testLogin}
              disabled={loading}
              className="w-full bg-orange-500 text-white p-3 rounded hover:bg-orange-600 disabled:opacity-50"
            >
              {loading ? 'Testando...' : 'Testar AuthService.login()'}
            </button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <strong>Erro:</strong> {error}
          </div>
        )}
        
        {result && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Resultado do Teste</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Informações do Ambiente</h2>
          <div className="bg-white p-6 rounded-lg shadow">
            <pre className="text-sm">
              {JSON.stringify({
                supabaseUrl: '/api',
                hasSupabaseKey: !!false,
                currentUrl: window.location.href,
                userAgent: navigator.userAgent
              }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginDebug;