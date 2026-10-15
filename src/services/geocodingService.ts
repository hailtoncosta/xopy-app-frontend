export interface CityData {
  name: string;
  state: string;
  stateCode: string;
  latitude: number;
  longitude: number;
  region: string;
}

export interface GeocodeResult {
  city: string;
  state: string;
  stateCode: string;
  country: string;
  region: string;
  formattedAddress: string;
  confidence: number;
}

// Base de dados simplificada de principais cidades brasileiras
const BRAZILIAN_CITIES: CityData[] = [
  // Maranhão
  { name: 'São Luís', state: 'Maranhão', stateCode: 'MA', latitude: -2.5307, longitude: -44.3068, region: 'Nordeste' },
  { name: 'Imperatriz', state: 'Maranhão', stateCode: 'MA', latitude: -5.5242, longitude: -47.4919, region: 'Nordeste' },
  { name: 'Timon', state: 'Maranhão', stateCode: 'MA', latitude: -5.0948, longitude: -42.8364, region: 'Nordeste' },
  { name: 'Caxias', state: 'Maranhão', stateCode: 'MA', latitude: -4.8586, longitude: -43.3564, region: 'Nordeste' },
  
  // Principais capitais para referência
  { name: 'São Paulo', state: 'São Paulo', stateCode: 'SP', latitude: -23.5505, longitude: -46.6333, region: 'Sudeste' },
  { name: 'Rio de Janeiro', state: 'Rio de Janeiro', stateCode: 'RJ', latitude: -22.9068, longitude: -43.1729, region: 'Sudeste' },
  { name: 'Brasília', state: 'Distrito Federal', stateCode: 'DF', latitude: -15.7942, longitude: -47.8822, region: 'Centro-Oeste' },
  { name: 'Salvador', state: 'Bahia', stateCode: 'BA', latitude: -12.9714, longitude: -38.5014, region: 'Nordeste' },
  { name: 'Fortaleza', state: 'Ceará', stateCode: 'CE', latitude: -3.7319, longitude: -38.5267, region: 'Nordeste' },
  { name: 'Belo Horizonte', state: 'Minas Gerais', stateCode: 'MG', latitude: -19.9167, longitude: -43.9345, region: 'Sudeste' },
  { name: 'Manaus', state: 'Amazonas', stateCode: 'AM', latitude: -3.1190, longitude: -60.0217, region: 'Norte' },
  { name: 'Curitiba', state: 'Paraná', stateCode: 'PR', latitude: -25.4244, longitude: -49.2654, region: 'Sul' },
  { name: 'Recife', state: 'Pernambuco', stateCode: 'PE', latitude: -8.0476, longitude: -34.8770, region: 'Nordeste' },
  { name: 'Porto Alegre', state: 'Rio Grande do Sul', stateCode: 'RS', latitude: -30.0346, longitude: -51.2177, region: 'Sul' },
  { name: 'Goiânia', state: 'Goiás', stateCode: 'GO', latitude: -16.6869, longitude: -49.2648, region: 'Centro-Oeste' },
  { name: 'Belém', state: 'Pará', stateCode: 'PA', latitude: -1.4558, longitude: -48.5044, region: 'Norte' },
  { name: 'Guarulhos', state: 'São Paulo', stateCode: 'SP', latitude: -23.4538, longitude: -46.5333, region: 'Sudeste' },
  { name: 'Campinas', state: 'São Paulo', stateCode: 'SP', latitude: -22.9099, longitude: -47.0626, region: 'Sudeste' },
  { name: 'São Gonçalo', state: 'Rio de Janeiro', stateCode: 'RJ', latitude: -22.8267, longitude: -43.0537, region: 'Sudeste' },
  { name: 'Maceió', state: 'Alagoas', stateCode: 'AL', latitude: -9.6658, longitude: -35.7353, region: 'Nordeste' },
  { name: 'Duque de Caxias', state: 'Rio de Janeiro', stateCode: 'RJ', latitude: -22.7856, longitude: -43.3117, region: 'Sudeste' },
  { name: 'Teresina', state: 'Piauí', stateCode: 'PI', latitude: -5.0892, longitude: -42.8019, region: 'Nordeste' }
];

// Estados disponíveis no serviço
export const AVAILABLE_STATES = ['MA']; // Apenas Maranhão por enquanto

// Função para calcular distância entre duas coordenadas (fórmula de Haversine)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Função principal de geocoding reverso
export async function reverseGeocode(latitude:number,longitude:number):Promise<GeocodeResult> {
 if(!Number.isFinite(latitude)||!Number.isFinite(longitude)||Math.abs(latitude)>90||Math.abs(longitude)>180)throw new Error('Coordenadas inválidas');
 const query=new URLSearchParams({latitude:String(latitude),longitude:String(longitude),localityLanguage:'pt'});
 const response=await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client?'+query,{signal:AbortSignal.timeout(12000)});
 if(!response.ok)throw new Error('Não foi possível identificar a cidade');
 const data=await response.json();const city=data.city || data.locality || data.localityName;
 const stateCode=String(data.principalSubdivisionCode || '').replace(/^BR-/, '') || data.principalSubdivision;
 if(!city || !stateCode)throw new Error('Cidade ou estado não identificado');
 return {city,state:data.principalSubdivision || stateCode,stateCode,country:data.countryName || '',region:'',formattedAddress:city+', '+stateCode,confidence:1};
}

// Verificar se um estado está disponível no serviço
export function isStateAvailable(stateCode: string): boolean {
  return AVAILABLE_STATES.includes(stateCode.toUpperCase());
}

// Obter informações sobre disponibilidade de um estado
export function getStateAvailability(stateCode: string): {
  available: boolean;
  message: string;
  alternativeMessage?: string;
} {
  const available = isStateAvailable(stateCode);
  
  if (available) {
    return {
      available: true,
      message: 'Serviço disponível na sua região!'
    };
  }
  
  return {
    available: false,
    message: `Ainda não estamos disponíveis em ${stateCode}`,
    alternativeMessage: 'Mas você pode continuar navegando como visitante e ver nossos produtos!'
  };
}

// Obter lista de cidades por estado
export function getCitiesByState(stateCode: string): CityData[] {
  return BRAZILIAN_CITIES.filter(city => city.stateCode === stateCode.toUpperCase());
}

// Buscar cidade por nome
export function findCityByName(cityName: string, stateCode?: string): CityData | null {
  const cities = stateCode 
    ? BRAZILIAN_CITIES.filter(city => city.stateCode === stateCode.toUpperCase())
    : BRAZILIAN_CITIES;
    
  return cities.find(city => 
    city.name.toLowerCase().includes(cityName.toLowerCase())
  ) || null;
}