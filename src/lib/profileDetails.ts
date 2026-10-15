export interface ProfileDetails {
 type: 'individual' | 'business'; name: string; taxId: string; phone: string;
 nickname?: string; profession?: string; certification?: string; courses?: string; previousCompanies?: string; experienceTime?: string; portfolioPhotos?: string; completedServices?: string; serviceConditions?: string; schedule?: string;
 category?: string; experience?: string; dailyRate?: string; neighborhood?: string; description?: string; specialties?: string;
 address: string; city: string; state: string; zipCode: string; companyName: string;
}
export const emptyProfileDetails: ProfileDetails = {type:'individual',name:'',taxId:'',phone:'',address:'',city:'',state:'MA',zipCode:'',companyName:''};
export function profileCityValue(city: string) {
 const normalized = city.normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
 return normalized === 'sao luis' || normalized === 'sao-luis' ? 'sao-luis' : normalized === 'raposa' ? 'raposa' : city;
}
