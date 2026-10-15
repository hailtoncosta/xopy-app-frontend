import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://gpbepsinnvatubokfgvr.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwYmVwc2lubnZhdHVib2tmZ3ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyNDUyOTgsImV4cCI6MjA3MjgyMTI5OH0._LzlQjyG23Nrr1-y2ACQBNepzvvvQYXI5gTdNvIJIKM";

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugChatIssue() {
  try {
    console.log('🔍 Investigando problema do chat...');
    
    // 1. Verificar prestadores de serviços
    console.log('\n1. Verificando prestadores de serviços:');
    const { data: providers, error: providersError } = await supabase
      .from('service_providers')
      .select('*');
    
    if (providersError) {
      console.error('❌ Erro ao buscar prestadores:', providersError.message);
    } else {
      console.log(`✅ Encontrados ${providers.length} prestadores`);
      providers.forEach(provider => {
        console.log(`   - ${provider.name} (${provider.status}) - User ID: ${provider.user_id}`);
      });
    }
    
    // 2. Verificar se as tabelas de chat existem
    console.log('\n2. Verificando tabelas de chat:');
    
    // Verificar conversations
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .limit(1);
    
    if (convError) {
      console.error('❌ Tabela conversations:', convError.message);
    } else {
      console.log('✅ Tabela conversations existe');
    }
    
    // Verificar messages
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('*')
      .limit(1);
    
    if (msgError) {
      console.error('❌ Tabela messages:', msgError.message);
    } else {
      console.log('✅ Tabela messages existe');
    }
    
    // Verificar notifications
    const { data: notifications, error: notifError } = await supabase
      .from('notifications')
      .select('*')
      .limit(1);
    
    if (notifError) {
      console.error('❌ Tabela notifications:', notifError.message);
    } else {
      console.log('✅ Tabela notifications existe');
    }
    
    // 3. Verificar conversas existentes
    console.log('\n3. Verificando conversas existentes:');
    const { data: allConversations, error: allConvError } = await supabase
      .from('conversations')
      .select('*');
    
    if (allConvError) {
      console.error('❌ Erro ao buscar conversas:', allConvError.message);
    } else {
      console.log(`✅ Encontradas ${allConversations.length} conversas`);
      allConversations.forEach(conv => {
        console.log(`   - Conversa ${conv.id}: User ${conv.user_id} <-> Provider ${conv.service_provider_id}`);
      });
    }
    
    // 4. Verificar mensagens existentes
    console.log('\n4. Verificando mensagens existentes:');
    const { data: allMessages, error: allMsgError } = await supabase
      .from('messages')
      .select('*');
    
    if (allMsgError) {
      console.error('❌ Erro ao buscar mensagens:', allMsgError.message);
    } else {
      console.log(`✅ Encontradas ${allMessages.length} mensagens`);
      allMessages.forEach(msg => {
        console.log(`   - Mensagem ${msg.id}: ${msg.sender_type} -> "${msg.content.substring(0, 50)}..."`);
      });
    }
    
    // 5. Verificar user_profiles
    console.log('\n5. Verificando user_profiles:');
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*');
    
    if (profilesError) {
      console.error('❌ Erro ao buscar profiles:', profilesError.message);
    } else {
      console.log(`✅ Encontrados ${profiles.length} profiles`);
      profiles.forEach(profile => {
        console.log(`   - ${profile.full_name} (${profile.id})`);
      });
    }
    
  } catch (err) {
    console.error('❌ Erro geral:', err.message);
  }
}

debugChatIssue();