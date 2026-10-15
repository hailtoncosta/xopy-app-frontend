import React, { useState } from 'react';
import { useAuth } from '@/hooks';
import { supabase } from '@/integrations/supabase/client';

const LoginDebugTest = () => {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('123456');
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[LoginDebug] ${message}`);
  };

  const testSupabaseConnection = async () => {
    addLog('Testando conexão com Supabase...');
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        addLog(`Erro na conexão: ${error.message}`);
      } else {
        addLog('Conexão com Supabase OK');
        addLog(`Sessão atual: ${data.session ? 'Ativa' : 'Nenhuma'}`);
      }
    } catch (error) {
      addLog(`Erro inesperado: ${error}`);
    }
  };

  const testDirectSupabaseLogin = async () => {
    addLog('🔐 Testando login direto no Supabase...');
    setIsLoading(true);
    
    try {
      // Verificar configuração do Supabase
      addLog(`🔧 URL do Supabase: /api`);
      addLog(`🔧 Chave anon: eyJhbGciOiJIUzI1NiI...`);
      
      addLog(`Tentando login com email: ${email}`);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        addLog(`❌ Erro do Supabase: ${error.message}`);
        addLog(`❌ Código do erro: ${error.status || 'N/A'}`);
        addLog(`❌ Detalhes: ${JSON.stringify(error, null, 2)}`);
      } else if (data.user) {
        addLog('✅ Login direto no Supabase bem-sucedido!');
        addLog(`User ID: ${data.user.id}`);
        addLog(`Email: ${data.user.email}`);
        addLog(`Email confirmado: ${data.user.email_confirmed_at ? 'Sim' : 'Não'}`);
        
        // Testar busca do perfil
        addLog('Buscando perfil do usuário...');
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (profileError) {
          addLog(`Erro ao buscar perfil: ${profileError.message}`);
        } else {
          addLog('Perfil encontrado com sucesso!');
          addLog(`Nome: ${profile.full_name}`);
          addLog(`Tipo: ${profile.user_type}`);
        }
        
        // Fazer logout
        await supabase.auth.signOut();
        addLog('✅ Logout realizado');
      } else {
        addLog('Login retornou sem usuário');
      }
    } catch (error: any) {
      addLog(`❌ Erro inesperado no login direto: ${error.message}`);
      addLog(`❌ Stack: ${error.stack}`);
      if (error.cause) {
        addLog(`❌ Causa: ${JSON.stringify(error.cause, null, 2)}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const testAuthContextLogin = async () => {
    addLog('Testando login através do AuthContext...');
    setIsLoading(true);
    
    try {
      addLog('Chamando função login do contexto...');
      const result = await login(email, password, 'customer');
      
      if (result.success) {
        addLog('Login do contexto bem-sucedido!');
      } else {
        addLog(`Login do contexto falhou: ${result.error}`);
      }
    } catch (error) {
      addLog(`Erro inesperado no login do contexto: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Debug de Login</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário de teste */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Dados de Teste</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Senha:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={testSupabaseConnection}
                  disabled={isLoading}
                  className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                >
                  Testar Conexão
                </button>
                
                <button
                  onClick={testDirectSupabaseLogin}
                  disabled={isLoading}
                  className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:bg-gray-400"
                >
                  Testar Login Direto
                </button>
                
                <button
                  onClick={testAuthContextLogin}
                  disabled={isLoading}
                  className="w-full bg-orange-500 text-white p-2 rounded hover:bg-orange-600 disabled:bg-gray-400"
                >
                  Testar Login do Contexto
                </button>
                
                <button
                  onClick={clearLogs}
                  className="w-full bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
                >
                  Limpar Logs
                </button>
              </div>
            </div>
          </div>
          
          {/* Logs */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Logs de Debug</h2>
            
            <div className="bg-black text-green-400 p-4 rounded h-96 overflow-y-auto font-mono text-sm">
              {logs.length === 0 ? (
                <div className="text-gray-500">Nenhum log ainda...</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginDebugTest;