import { Play, Heart, MessageCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { contentService } from "@/services/contentService";
import { supabase } from "@/integrations/supabase/client";

interface ClipData {
  id: string;
  title: string;
  author: string;
  authorAvatar: string;
  thumbnail: string;
  likes: number;
  comments: number;
  duration: string;
}

interface ClipsSectionProps {
  className?: string;
}

const ClipsSection = ({ className = "" }: ClipsSectionProps) => {
  const navigate = useNavigate();
  const [clips, setClips] = useState<ClipData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClips = async () => {
      try {
        console.log('🎬 Carregando clips do banco...');
        const dynamicClips = await contentService.getClips();
        
        if (dynamicClips.length > 0) {
          const mappedClips: ClipData[] = dynamicClips.map(clip => ({
            id: clip.id,
            title: clip.title,
            author: clip.author_name || "Anônimo",
            authorAvatar: clip.author_avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
            thumbnail: clip.thumbnail_url || "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=300&h=400&fit=crop",
            likes: clip.likes || 0,
            comments: clip.comments || 0,
            duration: clip.duration || "0:00"
          }));
          
          console.log('✅ Clips carregados do banco:', mappedClips.length);
          setClips(mappedClips);
        } else {
          setClips([]);
        }
      } catch (error) {
        console.error('Erro ao carregar clips:', error);
        setClips([]);
      } finally {
        setLoading(false);
      }
    };

    loadClips();

    // Realtime updates para clips
    console.log('🎯 [ClipsSection] Configurando realtime para clips...');
    
    const channel = supabase
      .channel('clips-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dynamic_clips'
        },
        (payload) => {
          console.log('⚡ [ClipsSection] REALTIME UPDATE:', payload);
          loadClips();
        }
      )
      .subscribe();

    // Listeners para atualizações do admin (manter compatibilidade)
    const handleContentUpdate = (event: CustomEvent) => {
      console.log('🔄 Evento de atualização recebido na ClipsSection:', event.detail);
      if (event.detail.section === 'clips' || event.detail.type === 'clips') {
        console.log('🎬 Recarregando clips devido a atualização do admin...');
        loadClips();
      }
    };

    const handleClipsUpdate = () => {
      console.log('🎬 Evento específico de clips recebido, recarregando...');
      loadClips();
    };

    window.addEventListener('contentUpdated', handleContentUpdate as EventListener);
    window.addEventListener('clipsSectionUpdated', handleClipsUpdate);
    window.addEventListener('adminContentUpdated', handleContentUpdate as EventListener);

    return () => {
      console.log('🔌 [ClipsSection] Desconectando realtime');
      supabase.removeChannel(channel);
      window.removeEventListener('contentUpdated', handleContentUpdate as EventListener);
      window.removeEventListener('clipsSectionUpdated', handleClipsUpdate);
      window.removeEventListener('adminContentUpdated', handleContentUpdate as EventListener);
    };
  }, []);

  const handleClipClick = (clipId: string) => {
    // Navega para a página de clips começando no vídeo clicado
    const clipIndex = clips.findIndex(c => c.id === clipId);
    navigate('/clips', { state: { startVideoIndex: clipIndex >= 0 ? clipIndex : 0 } });
  };

  const handleViewMore = () => {
    navigate('/clips');
  };

  if (loading) {
    return (
      <div className={`mb-6 bg-gray-50 rounded-lg p-4 ${className}`}>
        <h2 className="text-xl font-bold text-black mb-4">Clips</h2>
        <p className="text-gray-600">Carregando clips...</p>
      </div>
    );
  }

  if (clips.length === 0) {
    return null;
  }

  return (
    <div className={`mb-3 bg-gray-50 rounded-lg ${className}`}>
      {/* CSS para esconder scrollbar */}
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div className="mb-2 px-2 pt-2">
        <div className="flex items-baseline gap-3 mb-1">
          <h2 className="text-xl font-bold text-black">Clips</h2>
          <p className="text-sm text-gray-600">Veja vídeos de produtos e serviços</p>
        </div>
      </div>
      
      <div className="overflow-x-auto scrollbar-hide px-2">
        <div className="flex gap-3 min-w-max pb-2">
          {clips.map((clip) => (
            <div 
              key={clip.id} 
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow w-48 flex-shrink-0 cursor-pointer"
              onClick={() => handleClipClick(clip.id)}
            >
              {/* Thumbnail com overlay de play */}
              <div className="h-64 bg-gray-100 relative">
                <img 
                  src={clip.thumbnail} 
                  alt={clip.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.warn('Erro ao carregar thumbnail do clip:', clip.title);
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=300&h=400&fit=crop';
                  }}
                />
                
                {/* Play button overlay */}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="w-12 h-12 bg-black/60 rounded-full flex items-center justify-center">
                    <Play className="h-6 w-6 text-white ml-0.5" fill="white" />
                  </div>
                </div>
                
                {/* Duration badge */}
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                  {clip.duration}
                </div>
              </div>
              
              {/* Content */}
              <div className="p-3">
                {/* Author info */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-orange-500 rounded-full overflow-hidden flex-shrink-0">
                    <img 
                      src={clip.authorAvatar}
                      alt={clip.author}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.warn('Erro ao carregar avatar do autor:', clip.author);
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face';
                      }}
                    />
                  </div>
                  <p className="text-gray-600 text-xs font-medium truncate">{clip.author}</p>
                </div>
                
                {/* Title */}
                <h3 className="font-medium text-sm text-black leading-tight mb-3 line-clamp-2">
                  {clip.title}
                </h3>
                
                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    <span>{clip.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    <span>{clip.comments}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Botão Ver todos na parte inferior */}
      <div className="flex justify-between items-center mt-2 px-2 pb-2">
        <button 
          onClick={handleViewMore}
          className="text-orange-600 hover:text-orange-700 font-medium text-sm transition-colors"
        >
          Ver todos
        </button>
        <ArrowRight className="h-4 w-4 text-orange-600" />
      </div>
    </div>
  );
};

export default ClipsSection;