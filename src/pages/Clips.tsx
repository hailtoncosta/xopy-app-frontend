import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Heart, 
  Send, 
  ShoppingCart, 
  MessageCircle, 
  Volume2, 
  VolumeX, 
  Play
} from 'lucide-react';
import { contentService } from '@/services/contentService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Video {
  id: string;
  title: string;
  author: string;
  authorAvatar: string;
  videoUrl: string;
  thumbnailUrl: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked?: boolean;
  linkedProduct?: {
    id: number;
    name: string;
    price: string;
    image_url: string;
    category: string;
    section: string;
  };
}

const ClipsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  
  const videoRefs = useRef<HTMLVideoElement[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Verificar usuário logado
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    checkUser();
  }, []);

  // Carregar clips do banco de dados
  useEffect(() => {
    const loadClips = async () => {
      try {
        console.log('🎬 Carregando clips do banco para a página...');
        const dynamicClips = await contentService.getClips();
        
        if (dynamicClips.length > 0) {
          // Verificar likes do usuário
          let userLikes: string[] = [];
          if (currentUserId) {
            const { data: likes } = await supabase
              .from('clip_likes')
              .select('clip_id')
              .eq('user_id', currentUserId);
            userLikes = likes?.map(l => l.clip_id) || [];
          }

          const mappedClips: Video[] = dynamicClips.map(clip => ({
            id: clip.id,
            title: clip.title,
            author: clip.author_name || "Anônimo",
            authorAvatar: clip.author_avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
            videoUrl: clip.video_url || "",
            thumbnailUrl: clip.thumbnail_url || "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=250&h=400&fit=crop",
            likes: clip.likes || 0,
            comments: clip.comments || 0,
            shares: 0,
            isLiked: userLikes.includes(clip.id),
            linkedProduct: clip.linked_product,
          }));
          
          console.log('✅ Clips carregados para página:', mappedClips.length);
          setVideos(mappedClips);
        }
      } catch (error) {
        console.error('❌ Erro ao carregar clips:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadClips();

    // Listener para atualizações do admin
    const handleContentUpdate = (event: CustomEvent) => {
      console.log('🔄 Evento de atualização recebido na página Clips:', event.detail);
      if (event.detail.section === 'clips' || event.detail.type === 'clips') {
        console.log('🎬 Recarregando clips na página devido a atualização do admin...');
        loadClips();
      }
    };

    const handleClipsUpdate = () => {
      console.log('🎬 Evento específico de clips recebido na página, recarregando...');
      loadClips();
    };

    const handleForceReload = (event: CustomEvent) => {
      if (event.detail.section === 'clips') {
        console.log('🔄 Força reload dos clips na página...');
        loadClips();
      }
    };

    window.addEventListener('contentUpdated', handleContentUpdate as EventListener);
    window.addEventListener('clipsSectionUpdated', handleClipsUpdate);
    window.addEventListener('forceContentReload', handleForceReload as EventListener);
    window.addEventListener('adminContentUpdated', handleContentUpdate as EventListener);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'admin_content_updated') {
        console.log('📱 Mudança detectada no localStorage na página Clips, recarregando...');
        setTimeout(loadClips, 500);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('contentUpdated', handleContentUpdate as EventListener);
      window.removeEventListener('clipsSectionUpdated', handleClipsUpdate);
      window.removeEventListener('forceContentReload', handleForceReload as EventListener);
      window.removeEventListener('adminContentUpdated', handleContentUpdate as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentUserId]);

  // Definir o índice inicial do vídeo baseado no state da navegação
  useEffect(() => {
    const startVideoIndex = location.state?.startVideoIndex;
    if (typeof startVideoIndex === 'number' && startVideoIndex >= 0 && videos.length > 0) {
      setCurrentVideoIndex(Math.min(startVideoIndex, videos.length - 1));
    }
  }, [location.state, videos.length]);

  const currentVideo = videos[currentVideoIndex];

  const togglePlayPause = () => {
    const video = videoRefs.current[currentVideoIndex];
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    const video = videoRefs.current[currentVideoIndex];
    if (video) {
      video.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleScroll = (direction: 'up' | 'down') => {
    const newIndex = direction === 'down' 
      ? Math.min(currentVideoIndex + 1, videos.length - 1)
      : Math.max(currentVideoIndex - 1, 0);
    
    setCurrentVideoIndex(newIndex);
    
    // Scroll suave para o vídeo
    if (containerRef.current) {
      const videoElement = containerRef.current.children[newIndex] as HTMLElement;
      videoElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const likeVideo = async () => {
    if (!currentUserId) {
      toast.error('Faça login para curtir vídeos');
      return;
    }

    const video = videos[currentVideoIndex];
    const isLiked = video.isLiked;

    try {
      if (isLiked) {
        await supabase
          .from('clip_likes')
          .delete()
          .eq('clip_id', video.id)
          .eq('user_id', currentUserId);
        
        setVideos(prev => prev.map((v, i) => 
          i === currentVideoIndex 
            ? { ...v, likes: v.likes - 1, isLiked: false }
            : v
        ));
        toast.success('Curtida removida');
      } else {
        await supabase
          .from('clip_likes')
          .insert({ clip_id: video.id, user_id: currentUserId });
        
        setVideos(prev => prev.map((v, i) => 
          i === currentVideoIndex 
            ? { ...v, likes: v.likes + 1, isLiked: true }
            : v
        ));
        toast.success('Vídeo curtido!');
      }
    } catch (error) {
      console.error('Erro ao curtir vídeo:', error);
      toast.error('Erro ao curtir vídeo');
    }
  };

  const shareVideo = async () => {
    const video = videos[currentVideoIndex];
    
    const shareUrl = `${window.location.origin}/clips`;
    const shareData = {
      title: video.title,
      text: `Confira: ${video.title}`,
      url: shareUrl,
    };

    try {
      // Tentar usar API nativa de compartilhamento
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast.success('Compartilhado com sucesso!');
      } else {
        // Fallback: copiar para clipboard
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copiado para a área de transferência!');
      }
    } catch (error: any) {
      // Se o usuário cancelar, não mostrar erro
      if (error.name === 'AbortError') {
        return;
      }
      
      // Fallback final: copiar texto
      try {
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast.success('Link copiado!');
      } catch (fallbackError) {
        console.error('Erro ao compartilhar:', fallbackError);
        toast.error('Não foi possível compartilhar');
      }
    }
  };

  const handleComment = async () => {
    if (!currentUserId) {
      toast.error('Faça login para comentar');
      return;
    }

    if (!commentText.trim()) return;

    const video = videos[currentVideoIndex];

    try {
      await supabase
        .from('clip_comments')
        .insert({
          clip_id: video.id,
          user_id: currentUserId,
          comment: commentText,
        });

      setVideos(prev => prev.map((v, i) => 
        i === currentVideoIndex 
          ? { ...v, comments: v.comments + 1 }
          : v
      ));

      setCommentText('');
      toast.success('Comentário enviado!');
    } catch (error) {
      console.error('Erro ao comentar:', error);
      toast.error('Erro ao enviar comentário');
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Scroll com roda do mouse ou touch
  useEffect(() => {
    let touchStartY = 0;
    let isScrolling = false;

    const handleWheel = (e: WheelEvent) => {
      if (isScrolling) return;
      
      e.preventDefault();
      isScrolling = true;
      
      if (e.deltaY > 30) {
        handleScroll('down');
      } else if (e.deltaY < -30) {
        handleScroll('up');
      }
      
      setTimeout(() => {
        isScrolling = false;
      }, 800);
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isScrolling) return;
      
      const touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartY - touchEndY;
      
      if (Math.abs(diff) > 50) {
        isScrolling = true;
        if (diff > 0) {
          handleScroll('down');
        } else {
          handleScroll('up');
        }
        setTimeout(() => {
          isScrolling = false;
        }, 800);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isScrolling) return;
      
      if (e.key === 'ArrowDown') {
        isScrolling = true;
        handleScroll('down');
        setTimeout(() => { isScrolling = false; }, 800);
      } else if (e.key === 'ArrowUp') {
        isScrolling = true;
        handleScroll('up');
        setTimeout(() => { isScrolling = false; }, 800);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      container.addEventListener('touchstart', handleTouchStart, { passive: true });
      container.addEventListener('touchend', handleTouchEnd, { passive: true });
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        container.removeEventListener('wheel', handleWheel);
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchend', handleTouchEnd);
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [currentVideoIndex, videos.length]);

  // Controlar reprodução do vídeo atual
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === currentVideoIndex) {
          video.play();
          setIsPlaying(true);
        } else {
          video.pause();
          video.currentTime = 0;
        }
      }
    });
  }, [currentVideoIndex]);

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-lg">Carregando...</div>
      </div>
    );
  }

  // No videos state
  if (videos.length === 0) {
    return (
      <div className="h-screen bg-background flex flex-col items-center justify-center">
        <div className="text-foreground text-lg mb-4">Nenhum clip disponível</div>
        <button 
          onClick={handleBack}
          className="text-primary hover:underline"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-background z-50 overflow-y-scroll snap-y snap-mandatory"
      style={{ 
        scrollbarWidth: 'none', 
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      <style>{`
        div::-webkit-scrollbar { display: none; }
        .snap-container { scroll-snap-type: y mandatory; }
        .snap-item { scroll-snap-align: start; scroll-snap-stop: always; }
      `}</style>

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/70 to-transparent p-4">
        <div className="flex items-center justify-between">
          <button onClick={handleBack}>
            <ArrowLeft className="h-6 w-6 text-white" />
          </button>
          <h2 className="text-white text-lg font-bold">Clips</h2>
          <div className="w-6" />
        </div>
      </div>

      {/* Vídeos com scroll */}
      {videos.map((video, index) => (
        <div 
          key={video.id}
          className="relative w-full h-screen snap-item flex-shrink-0"
          style={{ minHeight: '100vh', maxHeight: '100vh' }}
        >
          <video
            ref={(el) => {
              if (el) videoRefs.current[index] = el;
            }}
            src={video.videoUrl}
            poster={video.thumbnailUrl}
            className="w-full h-full object-cover"
            loop
            muted={isMuted}
            playsInline
            onError={() => console.error('Erro ao carregar vídeo:', video.title)}
          />

          {/* Overlay de play/pause */}
          {index === currentVideoIndex && !isPlaying && (
            <div 
              className="absolute inset-0 flex items-center justify-center"
              onClick={togglePlayPause}
            >
              <div className="bg-black/50 rounded-full p-6">
                <Play className="h-16 w-16 text-white" fill="white" />
              </div>
            </div>
          )}

          {/* Tap to pause/play */}
          <div 
            className="absolute inset-0" 
            onClick={index === currentVideoIndex ? togglePlayPause : undefined}
          />

          {/* Info do autor - Esquerda */}
          <div className="absolute bottom-32 sm:bottom-44 left-4 right-24 z-10">
            <div className="flex items-center gap-2 mb-2 bg-white/95 backdrop-blur-sm rounded-full px-3 py-2 shadow-lg inline-flex">
              <div className="w-8 h-8 bg-[hsl(16,90%,48%)] rounded-full overflow-hidden border-2 border-[hsl(16,90%,48%)] shadow-md">
                <img 
                  src={video.authorAvatar}
                  alt={video.author}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-gray-900 font-bold text-sm">{video.author}</span>
            </div>
            <div className="bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg inline-block mt-1.5">
              <p className="text-gray-900 font-semibold text-sm">{video.title}</p>
            </div>
          </div>

          {/* Banner do Produto */}
          {video.linkedProduct && index === currentVideoIndex && (
            <button 
              onClick={() => {
                console.log('🛒 Comprando produto direto do vídeo:', video.linkedProduct);
                
                const productForCheckout = {
                  id: video.linkedProduct!.id,
                  name: video.linkedProduct!.name,
                  price: video.linkedProduct!.price,
                  image: video.linkedProduct!.image_url,
                  category: video.linkedProduct!.category,
                  section: video.linkedProduct!.section,
                  quantity: 1
                };
                
                localStorage.setItem('xopy_checkout_item', JSON.stringify([productForCheckout]));
                console.log('✅ Produto salvo para checkout:', productForCheckout);
                navigate('/checkout');
              }}
              className="absolute bottom-6 sm:bottom-20 left-4 right-24 bg-gradient-to-r from-[hsl(16,90%,48%)] to-[hsl(16,90%,42%)] backdrop-blur-sm rounded-2xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3 text-left hover:from-[hsl(16,90%,52%)] hover:to-[hsl(16,90%,46%)] transition-all shadow-2xl border-2 border-white/20"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-xl overflow-hidden flex-shrink-0 shadow-lg">
                <img 
                  src={video.linkedProduct.image_url}
                  alt={video.linkedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs sm:text-sm font-semibold line-clamp-1 mb-1">
                  {video.linkedProduct.name}
                </p>
                <p className="text-white text-lg sm:text-xl font-bold drop-shadow-md">
                  {video.linkedProduct.price}
                </p>
              </div>
              <div className="bg-white text-[hsl(16,90%,48%)] px-3 py-2 sm:px-5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-1 sm:gap-2">
                <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Comprar</span>
                <span className="sm:hidden">Comprar</span>
              </div>
            </button>
          )}

          {/* Botões de ação - Direita */}
          {index === currentVideoIndex && (
            <div className="absolute right-4 bottom-32 flex flex-col gap-6 z-10">
              <div className="flex flex-col items-center">
                <button 
                  onClick={likeVideo}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    video.isLiked 
                      ? 'bg-[hsl(16,90%,46%)]' 
                      : 'bg-black/30 hover:bg-black/50'
                  }`}
                >
                  <Heart 
                    className={`h-6 w-6 transition-all ${
                      video.isLiked 
                        ? 'text-white fill-white' 
                        : 'text-white'
                    }`}
                  />
                </button>
                <p className="text-white text-xs mt-1">{video.likes}</p>
              </div>

              <div className="flex flex-col items-center">
                <button 
                  onClick={() => setShowComments(!showComments)}
                  className="w-12 h-12 bg-black/30 rounded-full flex items-center justify-center hover:bg-black/50 transition-colors"
                >
                  <MessageCircle className="h-6 w-6 text-white" />
                </button>
                <p className="text-white text-xs mt-1">{video.comments}</p>
              </div>

              <div className="flex flex-col items-center">
                <button 
                  onClick={shareVideo}
                  className="w-12 h-12 bg-black/30 rounded-full flex items-center justify-center hover:bg-black/50 transition-colors"
                >
                  <Send className="h-6 w-6 text-white" />
                </button>
                <p className="text-white text-xs mt-1">Compartilhar</p>
              </div>

              <div className="flex flex-col items-center">
                <button 
                  onClick={toggleMute}
                  className="w-12 h-12 bg-black/30 rounded-full flex items-center justify-center hover:bg-black/50 transition-colors"
                >
                  {isMuted ? (
                    <VolumeX className="h-6 w-6 text-white" />
                  ) : (
                    <Volume2 className="h-6 w-6 text-white" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Indicador de posição */}
          {index === currentVideoIndex && (
            <div className="absolute top-20 right-4 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
              {currentVideoIndex + 1} / {videos.length}
            </div>
          )}
        </div>
      ))}

      {/* Modal de Comentários */}
      {showComments && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-end">
          <div className="bg-background w-full rounded-t-3xl p-6 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Comentários</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowComments(false)}
              >
                ✕
              </Button>
            </div>
            
            <div className="flex gap-2 mb-4">
              <Input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Adicione um comentário..."
                onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                className="border-2 border-[hsl(16,90%,46%)] focus-visible:ring-[hsl(16,90%,46%)] bg-background text-foreground"
              />
              <Button 
                onClick={handleComment} 
                disabled={!commentText.trim()}
                className="bg-[hsl(16,90%,46%)] hover:bg-[hsl(16,90%,40%)] text-white"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-muted-foreground text-center py-8">
              Comentários em desenvolvimento
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClipsPage;
