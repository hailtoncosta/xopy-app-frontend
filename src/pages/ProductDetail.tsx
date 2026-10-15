import { appNotify } from '@/lib/feedback';
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Percent, Star, HardHat, ChevronLeft, ChevronRight } from "lucide-react";
import { BottomNavigation } from "@/components/layout";
import { essentialProducts, tilesProducts, paintProducts, decorationProducts, topChoicesProducts, featuredProducts, homeProducts, newFeaturedProducts, newEssentialProducts, topChoices, roofTiles, paintWeek, newDecorationProducts, electroProducts } from "@/data";
import { MoreModal } from "@/components/modals";
import { supabase } from "@/integrations/supabase/client";
import { useContentData } from "@/hooks/useContentData";
import { contentService } from "@/services/contentService";
import type { Product } from "@/types";
const ProductDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string; }>();
  const [cartItemCount] = useState(3);
  const [isMoreModalOpen, setIsMoreModalOpen] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productDetailBanner, setProductDetailBanner] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const contentData = useContentData();

  useEffect(() => {
    const findProduct = async () => {
      try {
        setLoading(true);
        
        // Limpar cache se houver parâmetro de atualização na URL
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('refresh') === 'true') {
          console.log('🔄 Limpando cache devido ao parâmetro refresh...');
          localStorage.removeItem('paint_products_cache');
          localStorage.removeItem('tiles_products_cache');
          localStorage.removeItem('products_cache');
        }
        
        // PRIORIDADE 1: Buscar produtos do usuário PRIMEIRO (tabela products)
        let foundProduct = null;
        
        try {
          // Tentar buscar como UUID primeiro (produtos de usuários)
          console.log('🔍 Tentando buscar produto com UUID:', id);
          const { data: userProduct, error: userError } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .eq('approval_status', 'approved')
            .maybeSingle();
          
          console.log('📦 Resultado da busca:', { userProduct, userError });
          
          if (userProduct) {
            console.log('🔍 Produto bruto do banco:', userProduct);
            console.log('🔍 Tipo de images:', typeof userProduct.images, userProduct.images);
            console.log('🔍 Array de images:', userProduct.images);
            
            // Garantir que images é um array
            let productImages = [];
            
            if (Array.isArray(userProduct.images)) {
              // Já é um array
              productImages = userProduct.images;
            } else if (typeof userProduct.images === 'string') {
              // Se vier como string JSON, fazer parse
              try {
                productImages = JSON.parse(userProduct.images);
              } catch (e) {
                console.error('❌ Erro ao fazer parse de images:', e);
                productImages = [userProduct.images];
              }
            } else if (userProduct.images) {
              // Qualquer outro tipo, transformar em array
              productImages = [userProduct.images];
            }
            
            // Formatar preço corretamente
            const formatPrice = (price: number | string): string => {
              let numericValue: number;
              
              // Se o preço é uma string, pode estar formatado
              if (typeof price === 'string') {
                // Remover R$, pontos e vírgulas, depois converter
                const cleanPrice = price
                  .replace('R$', '')
                  .replace(/\s/g, '')
                  .replace(/\./g, '')
                  .replace(',', '.')
                  .trim();
                
                numericValue = parseFloat(cleanPrice);
              } else {
                numericValue = price;
              }
              
              // Se o valor for inválido, retornar string vazia
              if (isNaN(numericValue)) {
                console.error('Preço inválido:', price);
                return 'R$ 0,00';
              }
              
              return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(numericValue);
            };
            
            // DEBUG: Log do preço antes da formatação
            console.log('🔍 DEBUG PREÇO:', {
              rawPrice: userProduct.price,
              typeOfPrice: typeof userProduct.price,
              numberPrice: Number(userProduct.price),
              productName: userProduct.title
            });
            
            const formattedPrice = formatPrice(Number(userProduct.price));
            console.log('💰 Preço formatado:', formattedPrice);
            
            foundProduct = {
              id: String(userProduct.id),
              name: userProduct.title,
              price: formattedPrice,
              image: productImages[0] || '',
              images: productImages,
              category: userProduct.category,
              rating: 5.0,
              isOffer: false,
              type: userProduct.product_type || 'produto',
              sellerInfo: userProduct.seller_info,
              description: userProduct.description || '',
              user_id: userProduct.user_id // ID do vendedor
            };
            
            console.log('✅ [PRIORIDADE 1] Produto do usuário encontrado:', {
              id: foundProduct.id,
              name: foundProduct.name,
              price: foundProduct.price,
              imagens: foundProduct.images,
              totalImagens: foundProduct.images.length,
              descricao: foundProduct.description,
              descricaoLength: foundProduct.description?.length || 0,
              rawImages: userProduct.images,
              tipoRawImages: typeof userProduct.images
            });
          } else if (userError) {
            console.log('⚠️ Erro ao buscar produto do usuário (pode ser ID numérico):', userError.message);
          }
        } catch (error) {
          console.log('⚠️ Erro ao buscar produto do usuário:', error);
        }
        
        // PRIORIDADE 2: Buscar no banco de dados (dynamic_products) - ANTES DO CACHE
        if (!foundProduct) {
          try {
            console.log('🔍 [PRIORIDADE 2] Buscando no dynamic_products com ID:', id);
            const numericId = parseInt(id);
            
            // Só tentar buscar se o ID for um número válido
            if (!isNaN(numericId)) {
              const { data: systemProduct } = await supabase
                .from('dynamic_products')
                .select('*')
                .eq('id', numericId)
                .eq('is_active', true)
                .maybeSingle();
              
              if (systemProduct) {
                console.log('📦 Produto encontrado em dynamic_products:', systemProduct);
                
                // IMPORTANTE: Se tem source_product_id, buscar o produto real
                const sourceProductId = (systemProduct as any).source_product_id;
                
                if (sourceProductId) {
                  console.log('🔗 Produto tem source_product_id, buscando produto real:', sourceProductId);
                  
                  try {
                    const { data: realProduct, error: realError } = await supabase
                      .from('products')
                      .select('*')
                      .eq('id', sourceProductId)
                      .maybeSingle();
                    
                    if (realProduct && !realError) {
                      console.log('✅ Produto real encontrado via source_product_id!');
                      
                      // Usar o produto real ao invés do dynamic_products
                      let productImages = [];
                      if (Array.isArray(realProduct.images)) {
                        productImages = realProduct.images;
                      } else if (typeof realProduct.images === 'string') {
                        try {
                          productImages = JSON.parse(realProduct.images);
                        } catch (e) {
                          productImages = [realProduct.images];
                        }
                      } else if (realProduct.images) {
                        productImages = [realProduct.images];
                      }
                      
                      // Formatar preço corretamente
                      const formatPrice = (price: number | string): string => {
                        let numericValue: number;
                        
                        // Se o preço é uma string, pode estar formatado
                        if (typeof price === 'string') {
                          // Remover R$, pontos e vírgulas, depois converter
                          const cleanPrice = price
                            .replace('R$', '')
                            .replace(/\s/g, '')
                            .replace(/\./g, '')
                            .replace(',', '.')
                            .trim();
                          
                          numericValue = parseFloat(cleanPrice);
                        } else {
                          numericValue = price;
                        }
                        
                        // Se o valor for inválido, retornar string vazia
                        if (isNaN(numericValue)) {
                          console.error('Preço inválido:', price);
                          return 'R$ 0,00';
                        }
                        
                        return new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(numericValue);
                      };
                      
                      foundProduct = {
                        id: String(realProduct.id), // Usar o UUID real!
                        name: realProduct.title,
                        price: formatPrice(Number(realProduct.price)),
                        image: productImages[0] || '',
                        images: productImages,
                        category: realProduct.category,
                        rating: 5.0,
                        isOffer: false,
                        type: realProduct.product_type || 'produto',
                        sellerInfo: realProduct.seller_info,
                        description: realProduct.description || '',
                        user_id: realProduct.user_id // ID do vendedor
                      };
                      
                      console.log('✅ Usando produto real com UUID:', foundProduct.id);
                    } else {
                      console.log('⚠️ Produto real não encontrado, usando dynamic_products');
                    }
                  } catch (error) {
                    console.error('❌ Erro ao buscar produto real:', error);
                  }
                }
                
                // Se não encontrou o produto real, usar o dynamic_products
                if (!foundProduct) {
                  const images = systemProduct.image_url ? [systemProduct.image_url] : [];
                  
                  // UUID do admin (produtos do sistema)
                  const ADMIN_UUID = '91057d9a-9d8c-4596-9fc6-0b3ba539a5f3';
                  
                  // Garantir que o preço esteja no formato correto
                  let priceValue = systemProduct.price;
                  // Se o preço não começar com R$, assumir que é um número e formatar
                  if (typeof priceValue === 'string' && !priceValue.startsWith('R$')) {
                    const numPrice = parseFloat(priceValue);
                    if (!isNaN(numPrice)) {
                      priceValue = new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(numPrice);
                    }
                  }
                  
                  foundProduct = {
                    id: String(systemProduct.id),
                    name: systemProduct.name,
                    price: priceValue,
                    image: systemProduct.image_url,
                    images: images,
                    category: systemProduct.category,
                    rating: systemProduct.rating || 5.0,
                    isOffer: systemProduct.is_offer || false,
                    type: systemProduct.type || 'produto',
                    sellerInfo: { name: 'Xopy', businessName: 'Xopy Marketplace' },
                    description: systemProduct.description || 'Produto de alta qualidade para sua obra.',
                    user_id: ADMIN_UUID // ID do vendedor (admin/Xopy)
                  };
                  console.log('✅ [PRIORIDADE 2] Produto do sistema encontrado:', {
                    name: foundProduct.name,
                    description: systemProduct.description,
                    images: images.length
                  });
                }
              }
            } else {
              console.log('⚠️ ID não é numérico, pulando busca em dynamic_products');
            }
          } catch (error) {
            console.log('⚠️ Erro ao buscar produto do sistema:', error);
          }
        }
        
        // PRIORIDADE 3: Buscar no cache local de pintura (apenas se não encontrou no banco)
        if (!foundProduct) {
          try {
            const paintCache = localStorage.getItem('paint_products_cache');
            if (paintCache) {
              const cachedPaint = JSON.parse(paintCache);
              const cachedProduct = cachedPaint.find((p: any) => p.id.toString() === id);
              if (cachedProduct) {
                // Garantir que o preço esteja no formato correto
                let priceValue = cachedProduct.price;
                if (typeof priceValue === 'string' && !priceValue.startsWith('R$')) {
                  const numPrice = parseFloat(priceValue);
                  if (!isNaN(numPrice)) {
                    priceValue = new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(numPrice);
                  }
                }
                
                foundProduct = {
                  id: cachedProduct.id,
                  name: cachedProduct.name,
                  price: priceValue,
                  image: cachedProduct.image_url,
                  category: cachedProduct.category || 'Pintura',
                  rating: cachedProduct.rating || 5.0,
                  isOffer: cachedProduct.is_offer || false,
                  type: cachedProduct.type || 'produto',
                  product_group: cachedProduct.product_group || 'paint',
                  sellerInfo: { name: 'Xopy', businessName: 'Xopy Marketplace' },
                  description: cachedProduct.description || 'Produto de alta qualidade para sua obra.'
                };
                console.log('✅ [PRIORIDADE 3] Produto encontrado no cache de pintura:', foundProduct.name);
              }
            }
          } catch (cacheError) {
            console.warn('⚠️ Erro ao buscar no cache de pintura:', cacheError);
          }
        }
        
        // PRIORIDADE 4: Buscar no cache local de telhas
        if (!foundProduct) {
          try {
            const tilesCache = localStorage.getItem('tiles_products_cache');
            if (tilesCache) {
              const cachedTiles = JSON.parse(tilesCache);
              const cachedProduct = cachedTiles.find((p: any) => p.id.toString() === id);
              if (cachedProduct) {
                // Garantir que o preço esteja no formato correto
                let priceValue = cachedProduct.price;
                if (typeof priceValue === 'string' && !priceValue.startsWith('R$')) {
                  const numPrice = parseFloat(priceValue);
                  if (!isNaN(numPrice)) {
                    priceValue = new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(numPrice);
                  }
                }
                
                foundProduct = {
                  id: cachedProduct.id,
                  name: cachedProduct.name,
                  price: priceValue,
                  image: cachedProduct.image_url,
                  category: cachedProduct.category,
                  rating: cachedProduct.rating || 5.0,
                  isOffer: cachedProduct.is_offer || false,
                  type: cachedProduct.type || 'produto',
                  product_group: cachedProduct.product_group,
                  sellerInfo: { name: 'Xopy', businessName: 'Xopy Marketplace' },
                  description: cachedProduct.description || 'Produto de alta qualidade para sua obra.'
                };
                console.log('✅ [PRIORIDADE 3] Produto encontrado no cache de telhas:', foundProduct.name);
              }
            }
          } catch (cacheError) {
            console.warn('⚠️ Erro ao buscar no cache de telhas:', cacheError);
          }
        }
        
        // PRIORIDADE 4: Buscar nos produtos em destaque do hook
        if (!foundProduct) {
          const featuredProduct = contentData.featuredProducts.find(p => p.id.toString() === id);
          if (featuredProduct) {
            foundProduct = featuredProduct;
            console.log('✅ [PRIORIDADE 4] Produto encontrado nos produtos em destaque:', foundProduct.name);
          }
        }
        
        // Busca do dynamic_products já foi feita na PRIORIDADE 2 (movida para cima)
        
        // Se ainda não encontrou, buscar nos arrays estáticos
        if (!foundProduct) {
          const allStaticProducts = [...homeProducts, ...featuredProducts, ...essentialProducts, ...tilesProducts, ...paintProducts, ...decorationProducts, ...topChoicesProducts, ...newFeaturedProducts, ...newEssentialProducts, ...topChoices, ...roofTiles, ...paintWeek, ...newDecorationProducts, ...electroProducts];
          foundProduct = allStaticProducts.find(p => p.id.toString() === id);
        }
        
        // Se encontrou o produto, verificar e corrigir categoria se necessário
        if (foundProduct) {
          // Verificar se é produto da semana da pintura pelos dados estáticos
          const isPaintWeekProduct = paintWeek.some(p => p.id.toString() === foundProduct.id.toString());
          if (isPaintWeekProduct && !foundProduct.category && !foundProduct.product_group) {
            console.log('🔧 Corrigindo categoria do produto da semana da pintura:', foundProduct.name);
            foundProduct.category = 'Pintura';
            foundProduct.product_group = 'paint';
          }
          
          // Verificar se é produto de telhas pelos dados estáticos
          const isTilesProduct = roofTiles.some(p => p.id.toString() === foundProduct.id.toString());
          if (isTilesProduct && !foundProduct.category && !foundProduct.product_group) {
            console.log('🔧 Corrigindo categoria do produto de telhas:', foundProduct.name);
            foundProduct.category = 'Telhas e Coberturas';
            foundProduct.product_group = 'tiles';
          }
          
          // Para produtos dinâmicos, tentar inferir categoria pelo cache de origem
          if (!foundProduct.category && !foundProduct.product_group) {
            // Se foi encontrado no cache de pintura, deve ser produto de pintura
            try {
              const paintCache = localStorage.getItem('paint_products_cache');
              if (paintCache) {
                const cachedPaint = JSON.parse(paintCache);
                const isInPaintCache = cachedPaint.some((p: any) => p.id.toString() === foundProduct.id.toString());
                if (isInPaintCache) {
                  console.log('🔧 Produto encontrado no cache de pintura, definindo categoria:', foundProduct.name);
                  foundProduct.category = 'Pintura';
                  foundProduct.product_group = 'paint';
                }
              }
            } catch (error) {
              console.warn('Erro ao verificar cache de pintura:', error);
            }
            
            // Se foi encontrado no cache de telhas, deve ser produto de telhas
            if (!foundProduct.category && !foundProduct.product_group) {
              try {
                const tilesCache = localStorage.getItem('tiles_products_cache');
                if (tilesCache) {
                  const cachedTiles = JSON.parse(tilesCache);
                  const isInTilesCache = cachedTiles.some((p: any) => p.id.toString() === foundProduct.id.toString());
                  if (isInTilesCache) {
                    console.log('🔧 Produto encontrado no cache de telhas, definindo categoria:', foundProduct.name);
                    foundProduct.category = 'Telhas e Coberturas';
                    foundProduct.product_group = 'tiles';
                  }
                }
              } catch (error) {
                console.warn('Erro ao verificar cache de telhas:', error);
              }
            }
          }
          
          console.log('🎯 Produto final:', {
            id: foundProduct.id,
            name: foundProduct.name,
            category: foundProduct.category,
            product_group: foundProduct.product_group
          });
        }
        
        // Validar ID antes de salvar no state
        if (foundProduct) {
          const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(foundProduct.id));
          console.log('💾 Salvando produto no state:', {
            id: foundProduct.id,
            name: foundProduct.name,
            isUUID: isUUID,
            idType: typeof foundProduct.id
          });
          
          if (!isUUID) {
            console.error('⚠️ ATENÇÃO: Produto sendo salvo com ID numérico!', foundProduct.id);
          }
        }
        
        setProduct(foundProduct);
        
        // Buscar produtos relacionados da mesma empresa
        if (foundProduct) {
          await findRelatedProducts(foundProduct);
        }
        
        // Carregar banner de detalhes do produto
        try {
          const bannerData = await contentService.getProductDetailBanner();
          setProductDetailBanner(bannerData);
        } catch (error) {
          console.log('Banner de detalhes não encontrado, usando padrão');
        }
        
        // Listener para atualização do banner de detalhes do produto
        const handleProductDetailBannerUpdate = () => {
          console.log('Product detail banner atualizado, recarregando...');
          contentService.getProductDetailBanner().then(setProductDetailBanner);
        };

        // Listener para atualização de produtos de telhas
        const handleTilesProductUpdate = (event: CustomEvent) => {
          console.log('🏠 Produto de telha atualizado, recarregando página de detalhes...');
          if (id && event.detail.product && event.detail.product.id.toString() === id) {
            console.log('🔄 Produto atual foi atualizado, recarregando...');
            findProduct();
          } else if (foundProduct && (foundProduct.category === 'Telhas e Coberturas' || foundProduct.product_group === 'tiles')) {
            console.log('🔄 Atualizando produtos relacionados de telhas...');
            findRelatedProducts(foundProduct);
          }
        };

        window.addEventListener('productDetailBannerUpdated', handleProductDetailBannerUpdate as EventListener);
        window.addEventListener('adminContentUpdated', handleProductDetailBannerUpdate as EventListener);
        window.addEventListener('tilesProductUpdated', handleTilesProductUpdate as EventListener);
        
        return () => {
          window.removeEventListener('productDetailBannerUpdated', handleProductDetailBannerUpdate as EventListener);
          window.removeEventListener('adminContentUpdated', handleProductDetailBannerUpdate as EventListener);
          window.removeEventListener('tilesProductUpdated', handleTilesProductUpdate as EventListener);
        };
        
      } catch (error) {
        console.error('Erro ao buscar produto:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      findProduct();
    }
  }, [id, contentData]);

  const findRelatedProducts = async (currentProduct: any) => {
    try {
      let related: Product[] = [];
      const companyName = currentProduct.sellerInfo?.businessName || currentProduct.sellerInfo?.name || 'Xopy Marketplace';
      
      // Buscar produtos da mesma empresa no banco de dados
      try {
        const { data: userProducts } = await supabase
          .from('products')
          .select('*')
          .eq('approval_status', 'approved')
          .eq('status', 'active')
          .neq('id', currentProduct.id)
          .limit(6);
        
        if (userProducts) {
          const sameCompanyProducts = userProducts.filter(p => {
            const sellerInfo = p.seller_info as any;
            return sellerInfo?.businessName === companyName || 
                   sellerInfo?.name === companyName;
          }).map(product => {
            // Formatar preço corretamente
            const rawPrice = product.price as any;
            let priceValue: string;
            
            if (typeof rawPrice === 'number') {
              priceValue = new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(rawPrice);
            } else if (typeof rawPrice === 'string') {
              if (rawPrice.startsWith('R$')) {
                priceValue = rawPrice;
              } else {
                const numPrice = parseFloat(rawPrice);
                if (!isNaN(numPrice)) {
                  priceValue = new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(numPrice);
                } else {
                  priceValue = 'R$ 0,00';
                }
              }
            } else {
              priceValue = 'R$ 0,00';
            }
            
            return {
              id: product.id as string,
              name: product.title,
              price: priceValue,
              image: product.images?.[0] || '',
              type: 'produto' as const,
              category: product.category,
              rating: 5.0
            };
          });
          
          related = [...related, ...sameCompanyProducts];
        }
      } catch (error) {
        console.log('Erro ao buscar produtos relacionados do usuário:', error);
      }
      
      console.log('🔍 Buscando produtos relacionados para:', {
        id: currentProduct.id,
        name: currentProduct.name,
        category: currentProduct.category,
        product_group: currentProduct.product_group
      });
      
      // Verificar se é produto da semana da pintura pelos dados estáticos
      const isPaintWeekProduct = paintWeek.some(p => p.id.toString() === currentProduct.id.toString());
      console.log('🎨 É produto da semana da pintura?', isPaintWeekProduct);
      
      // Verificar se é produto de telhas pelos dados estáticos
      const isTilesProduct = roofTiles.some(p => p.id.toString() === currentProduct.id.toString());
      console.log('🏠 É produto de telhas?', isTilesProduct);

      // Se não encontrou produtos da mesma empresa, buscar produtos da mesma categoria
      if (related.length === 0) {
        // PRIMEIRO: Buscar no cache de telhas se for produto de telha
        if (currentProduct.category === 'Telhas e Coberturas' || currentProduct.product_group === 'tiles' || isTilesProduct) {
          try {
            const tilesCache = localStorage.getItem('tiles_products_cache');
            if (tilesCache) {
              const cachedTiles = JSON.parse(tilesCache);
              const relatedTiles = cachedTiles
                .filter((p: any) => p.id !== currentProduct.id && (p.category === 'Telhas e Coberturas' || p.product_group === 'tiles'))
                .slice(0, 4)
                .map((product: any) => ({
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image: product.image_url,
                  type: 'produto' as const,
                  category: product.category,
                  rating: product.rating || 5.0
                }));
              
              if (relatedTiles.length > 0) {
                related = [...related, ...relatedTiles];
                console.log('✅ Produtos relacionados encontrados no cache de telhas:', relatedTiles.length);
              }
            }
          } catch (cacheError) {
            console.warn('⚠️ Erro ao buscar produtos relacionados no cache de telhas:', cacheError);
          }
        }
        
        // PRIMEIRO: Buscar no cache de pintura se for produto de pintura
        if (currentProduct.category === 'Pintura' || currentProduct.product_group === 'paint' || isPaintWeekProduct) {
          console.log('🎨 IDENTIFICADO COMO PRODUTO DE PINTURA - Buscando no cache...');
          console.log('  - Por categoria:', currentProduct.category === 'Pintura');
          console.log('  - Por product_group:', currentProduct.product_group === 'paint');
          console.log('  - Por paintWeek:', isPaintWeekProduct);
          
          try {
            const paintCache = localStorage.getItem('paint_products_cache');
            console.log('📦 Cache de pintura existe?', !!paintCache);
            
            if (paintCache) {
              const cachedPaint = JSON.parse(paintCache);
              console.log('📋 Total de produtos no cache de pintura:', cachedPaint.length);
              
              const relatedPaint = cachedPaint
                .filter((p: any) => {
                  const isDifferentProduct = p.id !== currentProduct.id;
                  const isPaintCategory = p.category === 'Pintura' || p.product_group === 'paint';
                  console.log(`  - Produto ${p.name}: diferente=${isDifferentProduct}, pintura=${isPaintCategory}`);
                  return isDifferentProduct && isPaintCategory;
                })
                .slice(0, 4)
                .map((product: any) => ({
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image: product.image_url,
                  type: 'produto' as const,
                  category: product.category,
                  rating: product.rating || 5.0
                }));
              
              if (relatedPaint.length > 0) {
                related = [...related, ...relatedPaint];
                console.log('✅ Produtos relacionados encontrados no cache de pintura:', relatedPaint.length);
                relatedPaint.forEach(p => console.log(`  - ${p.name} (${p.category})`));
              } else {
                console.log('⚠️ Nenhum produto relacionado encontrado no cache de pintura');
              }
            } else {
              console.log('⚠️ Cache de pintura não encontrado');
            }
          } catch (cacheError) {
            console.warn('⚠️ Erro ao buscar produtos relacionados no cache de pintura:', cacheError);
          }
        } else {
          console.log('❌ NÃO identificado como produto de pintura');
          console.log('  - Categoria atual:', currentProduct.category);
          console.log('  - Product group atual:', currentProduct.product_group);
          console.log('  - É da paintWeek?', isPaintWeekProduct);
        }
        
        // SEGUNDO: Se ainda não encontrou, buscar no banco
        if (related.length === 0) {
          try {
            const numericId = parseInt(currentProduct.id);
            
            // Só buscar se o ID atual for numérico (produto do sistema)
            if (!isNaN(numericId)) {
              const { data: categoryProducts } = await supabase
                .from('dynamic_products')
                .select('*')
                .eq('is_active', true)
                .eq('category', currentProduct.category)
                .neq('id', numericId)
                .limit(4);
              
              if (categoryProducts) {
                const categoryRelated = categoryProducts.map(product => ({
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image: product.image_url,
                  type: 'produto' as const,
                  category: product.category,
                  rating: product.rating || 5.0
                }));
                
                related = [...related, ...categoryRelated];
                console.log('✅ Produtos relacionados encontrados no banco:', categoryRelated.length);
              }
            } else {
              console.log('⚠️ ID não é numérico, pulando busca de produtos relacionados em dynamic_products');
            }
          } catch (error) {
            console.log('Erro ao buscar produtos da categoria:', error);
          }
        }
      }
      
      // Se ainda não encontrou, usar produtos estáticos da mesma categoria como fallback
      if (related.length === 0) {
        let fallbackProducts: Product[] = [];
        
        // Se for produto de pintura, usar especificamente produtos da semana da pintura
        if (currentProduct.category === 'Pintura' || currentProduct.product_group === 'paint' || isPaintWeekProduct) {
          console.log('🎨 USANDO FALLBACK DE PINTURA');
          fallbackProducts = paintWeek.filter(p => p.id !== currentProduct.id).slice(0, 4);
          console.log('✅ Usando produtos da semana da pintura como fallback:', fallbackProducts.length);
          fallbackProducts.forEach(p => console.log(`  - ${p.name}`));
        }
        // Se for produto de telhas, usar especificamente produtos de telhas
        else if (currentProduct.category === 'Telhas e Coberturas' || currentProduct.product_group === 'tiles' || isTilesProduct) {
          fallbackProducts = roofTiles.filter(p => p.id !== currentProduct.id).slice(0, 4);
          console.log('✅ Usando produtos de telhas como fallback:', fallbackProducts.length);
        }
        // Para outras categorias, usar produtos gerais
        else {
          const allStaticProducts = [...newFeaturedProducts, ...newEssentialProducts, ...topChoices];
          fallbackProducts = allStaticProducts
            .filter(p => p.category === currentProduct.category && p.id !== currentProduct.id)
            .slice(0, 4);
          console.log('✅ Usando produtos estáticos gerais como fallback:', fallbackProducts.length);
        }
        
        related = fallbackProducts;
      }
      
      setRelatedProducts(related.slice(0, 4));
      
    } catch (error) {
      console.error('Erro ao buscar produtos relacionados:', error);
      // Fallback para produtos estáticos
      const fallbackProducts: Product[] = [
        {
          id: 999,
          name: "Areia Fina (m³)",
          price: "R$ 45,00",
          image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop",
          type: "produto" as const
        },
        {
          id: 998,
          name: "Cimento Portland",
          price: "R$ 28,90",
          image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop",
          type: "produto" as const
        }
      ];
      setRelatedProducts(fallbackProducts);
    }
  };
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Carregando...</h1>
        </div>
      </div>;
  }

  if (!product) {
    return <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Produto não encontrado</h1>
          <button onClick={() => navigate('/')} className="text-white px-6 py-2 rounded-lg bg-orange-600 hover:bg-orange-500">
            Voltar ao início
          </button>
        </div>
      </div>;
  }
  const handleAddToCart = (product: Product) => {
    try {
      // Carregar carrinho atual do localStorage
      const savedCart = localStorage.getItem('xopy_cart');
      const currentCart = savedCart ? JSON.parse(savedCart) : [];
      
      // Verificar se o produto já está no carrinho
      const existingItemIndex = currentCart.findIndex((item: any) => item.id === product.id);
      
      if (existingItemIndex !== -1) {
        // Se já existe, incrementar quantidade
        currentCart[existingItemIndex].quantity += 1;
        console.log('✅ Quantidade incrementada no carrinho:', product.name);
      } else {
        // Se não existe, adicionar novo item com quantidade 1
        currentCart.push({
          ...product,
          quantity: 1
        });
        console.log('✅ Produto adicionado ao carrinho:', product.name);
      }
      
      // Salvar carrinho atualizado no localStorage
      localStorage.setItem('xopy_cart', JSON.stringify(currentCart));
      
      // Navegar para o carrinho
      navigate('/carrinho');
    } catch (error) {
      console.error('❌ Erro ao adicionar produto ao carrinho:', error);
    }
  };
  
  const handleBuyNow = (product: Product) => {
    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(product.id));
      
      console.log('🛒 handleBuyNow chamado com produto:', {
        id: product.id,
        name: product.name,
        idType: typeof product.id,
        isUUID: isUUID
      });
      
      // Validar se o produto tem UUID válido
      if (!isUUID) {
        console.error('❌ Produto com ID inválido:', product.id);
        appNotify(`ERRO: Produto com ID inválido (${product.id}). Este produto não está cadastrado corretamente no banco de dados.`);
        return;
      }
      
      // Para "Comprar Agora", salvar apenas este produto em um local separado
      const checkoutItem = {
        ...product,
        quantity: 1
      };
      
      // Salvar no localStorage separado para compra direta
      localStorage.setItem('xopy_checkout_item', JSON.stringify([checkoutItem]));
      
      console.log('✅ Produto salvo no localStorage:', {
        id: checkoutItem.id,
        name: checkoutItem.name
      });
      
      // Navegar para o checkout
      navigate('/checkout?direct=1');
    } catch (error) {
      console.error('❌ Erro ao processar compra:', error);
      appNotify('Erro ao processar compra. Tente novamente.');
    }
  };

  const handleRelatedProductClick = (relatedProduct: Product) => {
    navigate(`/product/${relatedProduct.id}`);
  };
  return <div className="min-h-screen bg-white">
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

      {/* Header com botão voltar */}
      <div className="flex gap-3 items-center justify-between border-b border-gray-200 bg-white px-4 fixed top-0 left-0 right-0 z-50 py-[11px]">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-black">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div className="flex-1">
          <h1 className="text-black text-lg font-bold text-center">Detalhes do Produto</h1>
        </div>
        <div className="w-8"></div>
      </div>

      <div className="pb-20 overflow-auto">
        {/* Carrossel de Imagens do produto */}
        <div className="mt-16">
          <div className="relative aspect-[3/2] bg-gray-100 overflow-hidden">
            {/* Imagem principal */}
            <img 
              src={(() => {
                const imageUrl = product.images && product.images.length > 0 
                  ? product.images[currentImageIndex] 
                  : product.image;
                
                console.log('🖼️ Renderizando imagem:', {
                  hasImages: !!product.images,
                  imagesLength: product.images?.length || 0,
                  images: product.images,
                  currentIndex: currentImageIndex,
                  currentImage: product.images?.[currentImageIndex],
                  fallbackImage: product.image,
                  imageUrl
                });
                
                return imageUrl;
              })()} 
              alt={`${product.name} - Imagem ${currentImageIndex + 1}`} 
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('❌ Erro ao carregar imagem:', product.images?.[currentImageIndex]);
                e.currentTarget.src = 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&h=300&fit=crop';
              }}
            />
            
            {/* Botões de navegação e indicadores - aparecem se houver imagens */}
            {product.images && Array.isArray(product.images) && product.images.length > 0 && (
              <>
                {/* Contador de imagens - sempre visível para debug */}
                <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                  {currentImageIndex + 1} / {product.images.length}
                </div>
                
                {/* Botões e indicadores - só aparecem se houver mais de 1 imagem */}
                {product.images.length > 1 && (
                  <>
                    {/* Botão anterior */}
                    <button
                      onClick={() => setCurrentImageIndex(prev => prev === 0 ? product.images.length - 1 : prev - 1)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all z-10"
                      aria-label="Imagem anterior"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    
                    {/* Botão próximo */}
                    <button
                      onClick={() => setCurrentImageIndex(prev => prev === product.images.length - 1 ? 0 : prev + 1)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all z-10"
                      aria-label="Próxima imagem"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    
                    {/* Indicadores de posição */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                      {product.images.map((_: any, index: number) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === currentImageIndex 
                              ? 'bg-white w-6' 
                              : 'bg-white/50 hover:bg-white/75'
                          }`}
                          aria-label={`Ir para imagem ${index + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
          
          {/* Miniaturas das imagens - aparecem se houver mais de 1 imagem */}
          {product.images && Array.isArray(product.images) && product.images.length > 1 && (
            <div className="flex gap-2 px-4 mt-3 overflow-x-auto scrollbar-hide">
              {product.images.map((img: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentImageIndex 
                      ? 'border-orange-600 scale-105' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img 
                    src={img} 
                    alt={`Miniatura ${index + 1}`} 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      console.error('❌ Erro ao carregar miniatura:', img);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Informações do Produto */}
        <h1 className="text-black text-[22px] font-bold leading-tight px-4 text-left pb-3 pt-5">
          {product.name}
        </h1>
        
        {/* Descrição do Produto - SEMPRE VISÍVEL */}
        <div className="px-4 pb-3 pt-1">
          <p className="text-black text-base font-normal leading-normal">
            {product.description && product.description.trim().length > 0 
              ? product.description 
              : (product.category === 'Ferramentas' 
                  ? 'Ferramenta de alta qualidade, ideal para uso profissional e doméstico. Oferece excelente desempenho e durabilidade.'
                  : 'Produto de alta qualidade, adequado para diversas aplicações de construção. Oferece excelente durabilidade e facilidade de uso.')
            }
          </p>
        </div>

        {/* Preço com card de desconto */}
        <div className="px-4 pb-4">
          {/* Card de Desconto */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-3 mb-3">
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-white" />
              <p className="text-white text-sm font-bold">
                {productDetailBanner?.title || "40% OFF"}
              </p>
            </div>
            <p className="text-white text-xs leading-normal mt-1">
              {productDetailBanner?.description || "nas compras acima de R$800,00"}
            </p>
          </div>

          <p className="text-orange-600 text-2xl font-bold">{product.price}</p>
        </div>

        {/* Especificações */}
        <h3 className="text-black text-lg font-bold leading-tight px-4 pb-3 pt-4">Especificações</h3>
        <div className="px-4 pb-4">
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-gray-600 text-xs font-medium">Categoria</p>
              <p className="text-black text-xs font-semibold">{product.type}</p>
            </div>
            <div className="flex justify-between items-center border-t border-gray-200 pt-2">
              <p className="text-gray-600 text-xs font-medium">Disponibilidade</p>
              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">Em estoque</span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-200 pt-2">
              <p className="text-gray-600 text-xs font-medium">Entrega</p>
              <p className="text-black text-xs font-semibold">2-5 dias úteis</p>
            </div>
          </div>
        </div>

        {/* Avaliações simplificadas */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <p className="text-black text-2xl font-bold">4.5</p>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4].map(star => <Star key={star} className="h-5 w-5 text-orange-600 fill-current" />)}
              <Star className="h-5 w-5 text-gray-300" />
            </div>
          </div>
        </div>

        {/* Características do Produto */}
        <div className="px-4 pb-3">
          <div className="flex gap-4">
            <div className="flex-1">
              <p className="text-gray-600 text-xs font-medium mb-1">Marca</p>
              <p className="text-black text-sm font-semibold">
                {product.sellerInfo?.businessName || product.sellerInfo?.name || 'Xopy Marketplace'}
              </p>
            </div>
            <div className="flex-1">
              <p className="text-gray-600 text-xs font-medium mb-1">Tipo</p>
              <p className="text-black text-sm font-semibold">{product.type || 'Produto'}</p>
            </div>
          </div>
        </div>

        {/* Mais dessa mesma empresa */}
        <div className="px-4 py-4">
          <h3 className="text-black text-lg font-bold mb-3">Mais dessa mesma empresa</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {relatedProducts.map(relatedProduct => <div 
              key={relatedProduct.id} 
              className="bg-white border border-gray-200 rounded-lg overflow-hidden flex-none w-36 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleRelatedProductClick(relatedProduct)}
            >
                <div className="h-28 bg-gray-100">
                  <img src={relatedProduct.image} alt={relatedProduct.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-2">
                  <h4 className="text-black text-xs font-medium leading-tight mb-1">
                    {relatedProduct.name}
                  </h4>
                  <p className="text-orange-600 text-sm font-bold">{relatedProduct.price}</p>
                </div>
              </div>)}
          </div>
        </div>

        {/* Perfil da Empresa */}
        <div className="mx-4 mb-4 bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <HardHat className="h-6 w-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-black text-sm font-bold">
                {product.sellerInfo?.businessName || product.sellerInfo?.name || 'Xopy'}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(star => <Star key={star} className="h-3 w-3 text-orange-600 fill-current" />)}
                </div>
                <p className="text-gray-600 text-xs">4.8 • 238 vendas</p>
              </div>
            </div>
            <button 
              onClick={() => navigate(`/seller/${product.user_id || 'default'}`)}
              className="bg-orange-600 text-white text-xs px-3 py-1.5 rounded-full font-medium hover:bg-orange-700 transition-colors"
            >
              Ver loja
            </button>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="px-4 py-3">
          <div className="flex gap-3">
            <button onClick={() => handleAddToCart(product)} className="flex-1 flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-gray-100 text-black text-sm font-bold leading-normal hover:bg-gray-200 transition-colors">
              <span className="truncate">Adicionar ao Carrinho</span>
            </button>
            <button onClick={() => {
              console.log('🔍 Produto no state antes de comprar:', {
                id: product.id,
                name: product.name,
                idType: typeof product.id,
                isUUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(product.id))
              });
              handleBuyNow(product);
            }} className="flex-1 flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-orange-600 text-white text-sm font-bold leading-normal hover:bg-orange-700 transition-colors">
              <span className="truncate">Comprar Agora</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation cartItemCount={cartItemCount} onHomeClick={() => navigate('/')} onFavoritesClick={() => console.log("Favorites clicked")} onCartClick={() => navigate('/carrinho')} onClipsClick={() => navigate('/clips')} onMoreClick={() => setIsMoreModalOpen(true)} />

      {/* More Modal */}
      <MoreModal isOpen={isMoreModalOpen} onClose={() => setIsMoreModalOpen(false)} />
    </div>;
};
export default ProductDetail;