import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import ts from 'typescript';
const source=readFileSync(new URL('../src/services/geocodingService.ts',import.meta.url),'utf8');const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;const {reverseGeocode}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
let url='';globalThis.fetch=async value=>{url=String(value);return {ok:true,json:async()=>({city:'Fortaleza',principalSubdivision:'Ceará',principalSubdivisionCode:'BR-CE',countryName:'Brasil'})};};
const result=await reverseGeocode(-3.73,-38.52);assert.equal(result.city,'Fortaleza');assert.equal(result.stateCode,'CE');assert.ok(url.includes('latitude=-3.73'));assert.ok(url.includes('longitude=-38.52'));
globalThis.fetch=async()=>({ok:false});await assert.rejects(reverseGeocode(-3.73,-38.52));await assert.rejects(reverseGeocode(200,0));
globalThis.fetch=async()=>({ok:true,json:async()=>({countryName:'Brasil'})});await assert.rejects(reverseGeocode(-3.73,-38.52));console.log('Cidade real, estado, coordenadas e ausência de localização fictícia verificados.');
