import { appConfirm, appNotify } from '@/lib/feedback';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Globe,
  Moon,
  Shield,
  Download,
  Trash2,
  Bell,
  Eye,
  Lock,
  ChevronRight,
  Database
} from 'lucide-react';
import { toast } from 'sonner';
import { usePushNotifications } from '@/hooks/usePushNotifications';

interface SettingOption {
  id: string;
  title: string;
  description?: string;
  icon: React.ComponentType<any>;
  type: 'toggle' | 'select' | 'action';
  value?: string | boolean;
  options?: string[];
}

const Settings = () => {
  const navigate = useNavigate();
  const { permission, isSubscribed, error: pushError, requestPermission } = usePushNotifications();

  const [settings, setSettings] = useState<Record<string, any>>({
    darkMode: false,
    notifications: true,
    dataCollection: false,
    autoDownload: true,
    language: 'Português'
  });

  const settingsSections = [
    {
      title: 'Aparência',
      options: [
        {
          id: 'language',
          title: 'Idioma',
          description: 'Alterar idioma do aplicativo',
          icon: Globe,
          type: 'select' as const,
          value: settings.language,
          options: ['Português', 'English', 'Español']
        },
        {
          id: 'darkMode',
          title: 'Modo Escuro',
          description: 'Ativar tema escuro',
          icon: Moon,
          type: 'toggle' as const,
          value: settings.darkMode
        }
      ]
    },
    {
      title: 'Privacidade e Segurança',
      options: [
        {
          id: 'pushNotifications',
          title: 'Notificações Push',
          description: `Receber alertas com o app fechado (${permission}${isSubscribed ? ', ativo' : ''})`,
          icon: Bell,
          type: 'action' as const
        },
        {
          id: 'debugNotifications',
          title: 'Diagnóstico de Notificações',
          description: 'Testar sistema de push e notificações',
          icon: Database,
          type: 'action' as const
        },
        {
          id: 'notifications',
          title: 'Notificações',
          description: 'Ver notificações do app',
          icon: Bell,
          type: 'action' as const
        },
        {
          id: 'privacy',
          title: 'Privacidade',
          description: 'Configurações de privacidade',
          icon: Eye,
          type: 'action' as const
        },
        {
          id: 'security',
          title: 'Segurança',
          description: 'Configurações de segurança',
          icon: Lock,
          type: 'action' as const
        },
        {
          id: 'dataCollection',
          title: 'Coleta de Dados',
          description: 'Permitir coleta de dados para melhorias',
          icon: Shield,
          type: 'toggle' as const,
          value: settings.dataCollection
        }
      ]
    },
    {
      title: 'Armazenamento',
      options: [
        {
          id: 'autoDownload',
          title: 'Download Automático',
          description: 'Baixar imagens automaticamente',
          icon: Download,
          type: 'toggle' as const,
          value: settings.autoDownload
        },
        {
          id: 'clearCache',
          title: 'Limpar Cache',
          description: 'Liberar espaço removendo arquivos temporários',
          icon: Trash2,
          type: 'action' as const
        }
      ]
    }
  ];

  const handleToggle = (id: string) => {
    setSettings(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSelect = (id: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleAction = async (id: string) => {
    switch (id) {
      case 'pushNotifications':
        if (permission === 'denied') {
          toast.error('Notificações estão bloqueadas no navegador. Libere nas configurações do navegador.');
          return;
        }
        requestPermission();
        if (pushError) {
          toast.error(pushError);
        } else {
          toast.success('Solicitação de notificações enviada');
        }
        break;
      case 'debugNotifications':
        navigate('/debug-notificacoes');
        break;
      case 'notifications':
        navigate('/notificacoes');
        break;
      case 'privacy':
        navigate('/configuracoes/privacidade');
        break;
      case 'security':
        console.log('Abrir configurações de segurança');
        break;
      case 'clearCache':
        if ((await appConfirm('Tem certeza que deseja limpar o cache?'))) {
          console.log('Cache limpo');
          appNotify('Cache limpo com sucesso!');
        }
        break;
      default:
        console.log('Ação não implementada:', id);
    }
  };

  const renderSettingControl = (option: SettingOption) => {
    switch (option.type) {
      case 'toggle':
        return (
          <button
            onClick={() => handleToggle(option.id)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${option.value ? 'bg-orange-600' : 'bg-gray-300'
              }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${option.value ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
          </button>
        );

      case 'select':
        return (
          <div className="flex items-center gap-2">
            <span className="text-gray-600 text-sm">{option.value}</span>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
        );

      case 'action':
        return <ChevronRight className="h-5 w-5 text-gray-400" />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center bg-white p-4 border-b border-gray-200 sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="text-black flex items-center">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h2 className="text-black text-lg font-bold flex-1 text-center pr-6">Configurações</h2>
      </div>

      {/* Content */}
      <div className="p-4">
        {settingsSections.map((section, sectionIndex) => (
          <div key={section.title} className={sectionIndex > 0 ? 'mt-6' : ''}>
            <h3 className="text-black text-lg font-bold mb-4">{section.title}</h3>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {section.options.map((option, optionIndex) => {
                const IconComponent = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => {
                      if (option.type === 'action') {
                        handleAction(option.id);
                      } else if (option.type === 'select') {
                        // Para select, você pode implementar um modal ou dropdown
                        console.log('Abrir seletor para:', option.id);
                      }
                    }}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${optionIndex !== section.options.length - 1 ? 'border-b border-gray-200' : ''
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                        <IconComponent className="h-5 w-5 text-orange-600" />
                      </div>

                      <div className="flex-1">
                        <p className="text-black font-semibold">{option.title}</p>
                        {option.description && (
                          <p className="text-gray-500 text-sm">{option.description}</p>
                        )}
                      </div>

                      {renderSettingControl(option)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* App Info */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-black text-lg font-bold mb-3">Sobre o App</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Versão</span>
              <span className="text-black">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Última atualização</span>
              <span className="text-black">15/01/2024</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;