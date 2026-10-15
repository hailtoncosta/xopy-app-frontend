import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://gpbepsinnvatubokfgvr.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwYmVwc2lubnZhdHVib2tmZ3ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyNDUyOTgsImV4cCI6MjA3MjgyMTI5OH0._LzlQjyG23Nrr1-y2ACQBNepzvvvQYXI5gTdNvIJIKM";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testServiceProviders() {
  try {
    console.log('Testando conexão com a tabela service_providers...');
    
    // Tentar fazer uma consulta simples na tabela
    const { data, error } = await supabase
      .from('service_providers')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Erro ao acessar tabela service_providers:', error.message);
      
      if (error.message.includes('relation "public.service_providers" does not exist')) {
        console.log('\n❌ A tabela service_providers não existe no banco de dados.');
        console.log('\n📋 SOLUÇÃO: Execute o schema SQL no Supabase:');
        console.log('1. Acesse https://supabase.com/dashboard/project/gpbepsinnvatubokfgvr');
        console.log('2. Vá em SQL Editor');
        console.log('3. Copie e cole o conteúdo do arquivo supabase-schema.sql');
        console.log('4. Execute o script');
      }
    } else {
      console.log('✅ Tabela service_providers existe e está acessível!');
      console.log('Dados encontrados:', data?.length || 0, 'registros');
    }
  } catch (err) {
    console.error('Erro geral:', err.message);
  }
}

testServiceProviders();