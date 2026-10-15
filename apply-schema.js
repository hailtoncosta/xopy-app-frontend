import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = "https://gpbepsinnvatubokfgvr.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwYmVwc2lubnZhdHVib2tmZ3ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyNDUyOTgsImV4cCI6MjA3MjgyMTI5OH0._LzlQjyG23Nrr1-y2ACQBNepzvvvQYXI5gTdNvIJIKM";

const supabase = createClient(supabaseUrl, supabaseKey);

async function createServiceProvidersTable() {
  try {
    console.log('Criando tabela service_providers...');
    
    // SQL para criar a tabela service_providers
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS service_providers (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL,
        address TEXT,
        neighborhood TEXT,
        city TEXT,
        experience TEXT NOT NULL,
        daily_rate DECIMAL(10,2) NOT NULL,
        specialties TEXT,
        description TEXT,
        category TEXT NOT NULL,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        documents JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: createTableSQL
    });
    
    if (error) {
      console.error('Erro ao criar tabela:', error.message);
      console.log('\n📋 SOLUÇÃO MANUAL:');
      console.log('1. Acesse https://supabase.com/dashboard/project/gpbepsinnvatubokfgvr/sql');
      console.log('2. Execute o seguinte SQL:');
      console.log(createTableSQL);
    } else {
      console.log('✅ Tabela service_providers criada com sucesso!');
      
      // Testar se a tabela foi criada
      const { data: testData, error: testError } = await supabase
        .from('service_providers')
        .select('*')
        .limit(1);
        
      if (testError) {
        console.error('Erro ao testar tabela:', testError.message);
      } else {
        console.log('✅ Tabela está funcionando corretamente!');
      }
    }
  } catch (err) {
    console.error('Erro geral:', err.message);
    console.log('\n📋 SOLUÇÃO MANUAL:');
    console.log('1. Acesse https://supabase.com/dashboard/project/gpbepsinnvatubokfgvr/sql');
    console.log('2. Copie e cole o conteúdo do arquivo supabase-schema.sql');
    console.log('3. Execute o script completo');
  }
}

createServiceProvidersTable();