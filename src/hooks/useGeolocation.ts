import {useState,useEffect,useCallback,useRef} from 'react';
import {reverseGeocode,isStateAvailable,getStateAvailability,AVAILABLE_STATES} from '../services/geocodingService';
export interface LocationData {latitude:number;longitude:number;city:string;state:string;country:string;address:string;}
export interface GeolocationState {location:LocationData|null;isLoading:boolean;error:string|null;isPermissionDenied:boolean;isSupported:boolean;}
export interface GeolocationOptions {enableHighAccuracy?:boolean;timeout?:number;maximumAge?:number;autoRequest?:boolean;watch?:boolean;}
export default function useGeolocation(options:GeolocationOptions={}) {
 const {enableHighAccuracy=true,timeout=15000,maximumAge=0,autoRequest=false,watch=false}=options;
 const [state,setState]=useState<GeolocationState>({location:null,isLoading:false,error:null,isPermissionDenied:false,isSupported:typeof navigator!=='undefined' && 'geolocation' in navigator});
 const active=useRef(true);const sequence=useRef(0);const last=useRef<{lat:number;lon:number;time:number}|null>(null);
 const failure=useCallback((error:any)=>{if(!active.current)return;sequence.current++;setState(previous=>({...previous,location:null,isLoading:false,error:error.code===1?'Permissão de localização negada.':error.code===3?'Tempo limite para obter localização.':error.message || 'Localização indisponível.',isPermissionDenied:error.code===1}));},[]);
 const receive=useCallback(async(position:GeolocationPosition,force=false)=>{
  const {latitude,longitude}=position.coords;const previous=last.current;
  if(!force && previous && Date.now()-previous.time<60000 && Math.abs(previous.lat-latitude)<0.001 && Math.abs(previous.lon-longitude)<0.001)return;
  last.current={lat:latitude,lon:longitude,time:Date.now()};const current=++sequence.current;
  setState(value=>({...value,isLoading:true,error:null}));
  try{const result=await reverseGeocode(latitude,longitude);if(active.current && current===sequence.current)setState(value=>({...value,location:{latitude,longitude,city:result.city,state:result.stateCode,country:result.country,address:result.formattedAddress},isLoading:false,error:null,isPermissionDenied:false}));}
  catch(error){if(current===sequence.current)failure(error);}
 },[failure]);
 const getCurrentPosition=useCallback(async()=>{if(!state.isSupported){failure(new Error('Geolocalização não é suportada neste navegador.'));return;}setState(value=>({...value,isLoading:true,error:null}));await new Promise<void>(resolve=>navigator.geolocation.getCurrentPosition(position=>{void receive(position,true).finally(resolve);},error=>{failure(error);resolve();},{enableHighAccuracy,timeout,maximumAge}));},[state.isSupported,receive,failure,enableHighAccuracy,timeout,maximumAge]);
 useEffect(()=>{active.current=true;let id:number|undefined;if(autoRequest && state.isSupported){setState(value=>({...value,isLoading:true}));if(watch)id=navigator.geolocation.watchPosition(position=>{void receive(position);},failure,{enableHighAccuracy,timeout,maximumAge});else void getCurrentPosition();}return()=>{active.current=false;sequence.current++;last.current=null;if(id!==undefined)navigator.geolocation.clearWatch(id);};},[autoRequest,watch,state.isSupported,receive,failure,getCurrentPosition,enableHighAccuracy,timeout,maximumAge]);
 const requestPermission=useCallback(async()=>{try{return (await navigator.permissions.query({name:'geolocation'})).state;}catch{return null;}},[]);
 return {...state,getCurrentPosition,requestPermission,isStateAvailable,checkStateAvailability:getStateAvailability,availableStates:AVAILABLE_STATES};
}
