export interface RentalItem {
  id: number;
  name: string;
  category: string;
  price: string;
  period: string;
  image: string;
  available: boolean;
  popular?: boolean;
  rating: number;
  location: string;
  description: string;
}

export const rentalItems: RentalItem[] = [
  {
    id: 1,
    name: "Escavadeira Hidráulica CAT 320",
    category: "Máquinas Pesadas",
    price: "R$ 450",
    period: "/dia",
    image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop",
    available: true,
    popular: true,
    rating: 4.8,
    location: "São Paulo - SP",
    description: "Escavadeira hidráulica para trabalhos pesados de terraplanagem"
  },
  {
    id: 2,
    name: "Plataforma Elevatória 15m",
    category: "Plataformas",
    price: "R$ 280",
    period: "/dia",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop",
    available: true,
    rating: 4.6,
    location: "São Paulo - SP",
    description: "Plataforma elevatória para trabalhos em altura até 15 metros"
  },
  {
    id: 3,
    name: "Betoneira 400L Profissional",
    category: "Ferramentas",
    price: "R$ 85",
    period: "/dia",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop",
    available: true,
    rating: 4.5,
    location: "São Paulo - SP",
    description: "Betoneira de alta capacidade para grandes volumes de concreto"
  },
  {
    id: 4,
    name: "Compressor de Ar 10HP",
    category: "Ferramentas",
    price: "R$ 120",
    period: "/dia",
    image: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&h=300&fit=crop",
    available: false,
    rating: 4.7,
    location: "São Paulo - SP",
    description: "Compressor de ar de alta pressão para ferramentas pneumáticas"
  },
  {
    id: 5,
    name: "Retroescavadeira JCB",
    category: "Máquinas Pesadas",
    price: "R$ 520",
    period: "/dia",
    image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop",
    available: true,
    rating: 4.9,
    location: "São Paulo - SP",
    description: "Retroescavadeira versátil para escavação e carregamento"
  },
  {
    id: 6,
    name: "Andaime Tubular Completo",
    category: "Plataformas",
    price: "R$ 45",
    period: "/dia",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop",
    available: true,
    rating: 4.4,
    location: "São Paulo - SP",
    description: "Sistema completo de andaimes tubulares para construção"
  },
  {
    id: 7,
    name: "Martelo Demolidor Elétrico",
    category: "Ferramentas",
    price: "R$ 65",
    period: "/dia",
    image: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&h=300&fit=crop",
    available: true,
    rating: 4.3,
    location: "São Paulo - SP",
    description: "Martelo demolidor profissional para quebra de concreto e alvenaria"
  },
  {
    id: 8,
    name: "Gerador de Energia 15KVA",
    category: "Equipamentos Elétricos",
    price: "R$ 180",
    period: "/dia",
    image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop",
    available: true,
    rating: 4.7,
    location: "São Paulo - SP",
    description: "Gerador de energia silencioso para obras e eventos"
  }
];

// Função para buscar item por ID
export const getRentalItemById = (id: number): RentalItem | undefined => {
  return rentalItems.find(item => item.id === id);
};

// Função para buscar itens por categoria
export const getRentalItemsByCategory = (category: string): RentalItem[] => {
  if (category === 'all') return rentalItems;
  return rentalItems.filter(item => item.category === category);
};

// Função para obter categorias únicas
export const getRentalCategories = (): string[] => {
  const categories = rentalItems.map(item => item.category);
  return ['all', ...Array.from(new Set(categories))];
};

// Função para obter itens populares
export const getPopularRentalItems = (): RentalItem[] => {
  return rentalItems.filter(item => item.popular);
};

// Função para obter itens disponíveis
export const getAvailableRentalItems = (): RentalItem[] => {
  return rentalItems.filter(item => item.available);
};