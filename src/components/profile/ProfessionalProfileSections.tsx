import { formatMask } from '@/lib/inputMasks';
import { useEffect, useState, type ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { request } from '@/integrations/api/client';
import { emptyProfileDetails, ProfileDetails } from '@/lib/profileDetails';

type Review = {id: string; rating: number; comment: string; reviewer_name?: string; created_at: string};
const experienceLabels: Record<string,string> = {iniciante:'Iniciante (até 2 anos)',intermediario:'Intermediário (2–5 anos)',experiente:'Experiente (5–10 anos)',especialista:'Especialista (mais de 10 anos)'};
export default function ProfessionalProfileSections() {
 const {user}=useAuth();
 const [details,setDetails]=useState<ProfileDetails>(emptyProfileDetails);
 const [reviews,setReviews]=useState<Review[]>([]);
 const [loading,setLoading]=useState(true);const [error,setError]=useState('');
 useEffect(()=>{let active=true;setLoading(true);setError('');request('/profile-details').then(result=>{if(active){setDetails({...emptyProfileDetails,...result.details});setReviews(result.reviews || []);}}).catch(()=>{if(active)setError('Não foi possível carregar as informações. Tente abrir o perfil novamente.');}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[user?.id,user?.profileDetails]);
 const item=(label:string,value?:string)=><div className="min-w-0"><dt className="text-xs font-semibold text-gray-500 mb-1">{label}</dt><dd className="text-sm text-gray-800 whitespace-pre-wrap break-words">{value?.trim() || 'Não informado'}</dd></div>;
 const section=(title:string,content:ReactNode)=><section className="rounded-xl border border-gray-200 bg-white p-4"><h4 className="font-semibold text-gray-900 mb-4">{title}</h4>{content}</section>;
 const photos=(details.portfolioPhotos || '').split('\n').map(v=>v.trim()).filter(v=>/^https?:\/\//.test(v)||v.startsWith('/api/files/public/portfolio-images/'));
 if(loading)return <p role="status" className="text-sm py-4">Carregando informações profissionais...</p>;
 if(error)return <p role="alert" className="text-sm text-red-700 py-4">{error}</p>;
 return <div className="space-y-4">
 {section('Identificação',<dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">{item('Nome',details.name || user?.name)}{item('Apelido',details.nickname)}{item('Profissão',details.profession || details.category)}{item('Especialidades',details.specialties)}{item('Endereço',[details.address,details.neighborhood,details.city].filter(Boolean).join(', '))}</dl>)}
 {section('Qualificação e Segurança',<dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">{item('CPF/CNPJ',formatMask('cpf-cnpj',details.taxId || ''))}{item('Certificação',details.certification)}{item('Cursos',details.courses)}{item('Empresas que trabalhou',details.previousCompanies)}{item('Tempo de experiência',details.experienceTime || experienceLabels[details.experience || ''] || details.experience)}</dl>)}
 {section('Portfólio de trabalhos',<><p className="text-xs font-semibold text-gray-500 mb-2">Galeria de fotos</p>{photos.length?<div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">{photos.map((url,index)=><a key={url+index} href={url} target="_blank" rel="noopener noreferrer"><img src={url} alt={'Trabalho realizado '+(index+1)} loading="lazy" className="w-full aspect-square rounded-lg object-cover"/></a>)}</div>:<p className="text-sm text-gray-600 mb-4">Nenhuma foto cadastrada.</p>}<dl className="space-y-4">{item('Descrição dos serviços já realizados',details.completedServices)}{item('Descrição',details.description)}</dl></>)}
 {section('Avaliação e reputação',<><p className="text-xs font-semibold text-gray-500 mb-2">Notas e comentários</p>{reviews.length?<div className="space-y-3 mb-4"><p className="font-semibold text-gray-800">{(reviews.reduce((sum,r)=>sum+Number(r.rating),0)/reviews.length).toFixed(1)} / 5 · {reviews.length} avaliações</p>{reviews.map(review=><div key={review.id} className="border rounded-lg p-3"><p className="text-sm font-semibold">{review.reviewer_name || 'Cliente'} · {review.rating} / 5</p><p className="text-sm text-gray-600 whitespace-pre-wrap">{review.comment}</p></div>)}</div>:<p className="text-sm text-gray-600 mb-4">Ainda não há avaliações cadastradas.</p>}<dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">{item('Disponibilidade e condição de atendimento',details.serviceConditions)}{item('Agenda e disponibilidade',details.schedule)}</dl></>)}
 </div>;
}
