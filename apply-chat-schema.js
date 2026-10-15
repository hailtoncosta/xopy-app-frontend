import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = "https://gpbepsinnvatubokfgvr.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwYmVwc2lubnZhdHVib2tmZ3ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyNDUyOTgsImV4cCI6MjA3MjgyMTI5OH0._LzlQjyG23Nrr1-y2ACQBNepzvvvQYXI5gTdNvIJIKM";

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyChatSchema() {
  try {
    console.log('Aplicando schema do chat...');
    
    // Ler o arquivo chat-schema.sql
    const chatSchemaSQL = fs.readFileSync('chat-schema.sql', 'utf8');
    
    console.log('\n📋 SOLUÇÃO MANUAL:');
    console.log('1. Acesse https://supabase.com/dashboard/project/gpbepsinnvatubokfgvr/sql');
    console.log('2. Execute o seguinte SQL:');
    console.log('\n' + chatSchemaSQL);
    console.log('\n✅ Copie e cole o SQL acima no editor SQL do Supabase para criar as tabelas do chat.');
    
  } catch (error) {
    console.error('Erro ao ler arquivo chat-schema.sql:', error.message);
  }
}

applyChatSchema();