/* Transitional compatibility adapter for the React screens. No Supabase runtime. */
export interface User { id: string; email?: string; role?: string; email_confirmed_at?: string; created_at?: string; user_metadata: Record<string, any>; }
export interface Session { access_token: string; token_type: string; expires_in: number; expires_at: number; user: User; }
type Result = { data: any; error: null | { message: string; code?: string; status?: number; details?: string; hint?: string }; count?: number | null };
const base = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
const key = 'xopy-jwt-session';
const listeners = new Set<(event: string, session: Session | null) => void>();
let session: Session | null = null;
try { session = JSON.parse(localStorage.getItem(key) || 'null'); } catch { localStorage.removeItem(key); }
function save(next: Session | null, event: string) {
  session = next; next ? localStorage.setItem(key, JSON.stringify(next)) : localStorage.removeItem(key);
  listeners.forEach(fn => fn(event, next));
}
export async function request(path: string, method = 'GET', body?: any): Promise<any> {
  const token = ["/auth/login", "/auth/register", "/auth/forgot-password", "/auth/reset-password"].includes(path) ? undefined : session?.access_token;
  const response = await fetch(`${base}${path}`, {
    ...(path.startsWith('/payments/seller/') ? { credentials: 'include' as RequestCredentials } : {}),
    method, headers: { ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body === undefined ? {} : { body: body instanceof FormData ? body : JSON.stringify(body) }),
  });
  const text = await response.text(); let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { throw new Error('Resposta inválida da API'); }
  if (!response.ok) { if (response.status === 401 && token) save(null, 'SIGNED_OUT'); throw new Error(data?.message || `Falha HTTP ${response.status}`); }
  return data;
}
export async function requestFile(path:string):Promise<Blob> {
 const response=await fetch(base+path,{headers:session?.access_token?{Authorization:`Bearer ${session.access_token}`}:{}});
 if(!response.ok){const data=await response.json().catch(()=>null);throw new Error(data?.message || `Falha HTTP ${response.status}`);}
 const blob=await response.blob();const signature=new Uint8Array(await blob.slice(0,4).arrayBuffer());
 if(signature[0]!==80 || signature[1]!==75)throw new Error('Arquivo de backup inválido recebido');return blob;
}
async function wrapped(fn: () => Promise<any>): Promise<Result> {
  try { return { data: await fn(), error: null }; } catch (e) { return { data: null, error: { message: e instanceof Error ? e.message : 'Erro de conexão' } }; }
}
const unsupported = async (name: string): Promise<Result> => ({ data: null, error: { message: `Funcionalidade ainda não convertida: ${name}`, code: 'NOT_IMPLEMENTED' } });
class Query implements PromiseLike<Result> {
  private query: any = { action: 'select', select: '*', filters: [], order: [] };
  constructor(private table: string) {}
  select(columns = '*', options?: any) { this.query.select = columns; this.query.head = !!options?.head; return this; }
  insert(values: any) { this.query.action = 'insert'; this.query.values = values; return this; }
  update(values: any) { this.query.action = 'update'; this.query.values = values; return this; }
  upsert(values: any, options?: any) { this.query.action = 'upsert'; this.query.values = values; this.query.upsertOptions = options; return this; }
  delete() { this.query.action = 'delete'; return this; }
  private filter(column: string, op: string, value: any) { this.query.filters.push({ column, op, value }); return this; }
  eq(c: string, v: any) { return this.filter(c, 'eq', v); }
  neq(c: string, v: any) { return this.filter(c, 'neq', v); }
  in(c: string, v: any[]) { return this.filter(c, 'in', v); }
  is(c: string, v: any) { return this.filter(c, 'is', v); }
  ilike(c: string, v: any) { return this.filter(c, 'ilike', v); }
  gt(c: string, v: any) { return this.filter(c, 'gt', v); }
  gte(c: string, v: any) { return this.filter(c, 'gte', v); }
  lt(c: string, v: any) { return this.filter(c, 'lt', v); }
  lte(c: string, v: any) { return this.filter(c, 'lte', v); }
  contains(c: string, v: any) { return this.filter(c, 'contains', v); }
  or(v: string) { return this.filter('', 'or', v); }
  not(c: string, op: string, v: any) { return this.filter(c, `not.${op}`, v); }
  match(v: Record<string, any>) { Object.entries(v).forEach(([c, x]) => this.eq(c, x)); return this; }
  order(column: string, options?: any) { this.query.order.push({ column, ascending: options?.ascending !== false }); return this; }
  limit(n: number) { this.query.limit = n; return this; }
  range(from: number, to: number) { this.query.offset = from; this.query.limit = to - from + 1; return this; }
  single() { this.query.single = 'single'; this.query.limit = 2; return this; }
  maybeSingle() { this.query.single = 'maybe'; this.query.limit = 2; return this; }
  then<T1 = Result, T2 = never>(resolve?: ((value: Result) => T1 | PromiseLike<T1>) | null, reject?: ((reason: any) => T2 | PromiseLike<T2>) | null): PromiseLike<T1 | T2> {
    return wrapped(() => request(`/data/${encodeURIComponent(this.table)}`, 'POST', this.query)).then(r => r.error ? r : r.data as Result).then(resolve, reject);
  }
}
// Channels intentionally do not emit fake database events. Realtime migration is pending.
class Channel {
  on(..._args: any[]) { return this; }
  subscribe(callback?: (status: string) => void) { callback?.('CLOSED'); return this; }
  unsubscribe() { return Promise.resolve('ok'); }
}
export const springClient = {
  from: (table: string) => new Query(table),
  rpc: (name: string, _args?: any) => name === 'is_admin' ? wrapped(async () => (await request('/rpc/is_admin', 'POST', {})).data) : unsupported(name),
  channel: (_name: string) => new Channel(),
  removeChannel: (channel: Channel) => channel.unsubscribe(),
  removeAllChannels: () => Promise.resolve(),
  functions: { invoke: (name: string, options?: any) => wrapped(() => request(`/functions/${encodeURIComponent(name)}`, 'POST', options?.body || {})) },
  auth: {
    getSession: async () => { if (session && session.expires_at <= Date.now() / 1000) save(null, 'SIGNED_OUT'); return { data: { session }, error: null }; },
    getUser: async () => { if (!session) return { data: { user: null }, error: null }; const r = await wrapped(() => request('/auth/me')); return { data: { user: r.data }, error: r.error }; },
    onAuthStateChange: (fn: (event: string, session: Session | null) => void) => { listeners.add(fn); queueMicrotask(() => fn('INITIAL_SESSION', session)); return { data: { subscription: { unsubscribe: () => { listeners.delete(fn); } } } }; },
    signInWithPassword: async (data: { email: string; password: string }) => { const r = await wrapped(() => request('/auth/login', 'POST', data)); if (!r.error) save(r.data, 'SIGNED_IN'); return { data: { user: r.data?.user || null, session: r.data }, error: r.error }; },
    signUp: async (data: any) => { const d = data.options?.data || {}; const r = await wrapped(() => request('/auth/register', 'POST', { email: data.email, password: data.password, name: d.full_name || d.name || '', phone: d.phone, type: d.user_type || d.type || 'customer' })); if (!r.error) save(r.data, 'SIGNED_IN'); return { data: { user: r.data?.user || null, session: r.data }, error: r.error }; },
    signOut: async (_options?: any) => { const r = session ? await wrapped(() => request('/auth/logout', 'POST')) : { error: null }; save(null, 'SIGNED_OUT'); return { error: r.error }; },
    updateUser: (_data: any) => unsupported('alteração de senha exige senha atual; usar /auth/password'),
    resetPasswordForEmail: (_email: string, _options?: any) => unsupported('recuperação de senha por e-mail'),
    signInWithOAuth: (_data: any) => unsupported('login social'),
    exchangeCodeForSession: (_code: string) => unsupported('código de recuperação antigo do Supabase'),
    setSession: (_data: any) => unsupported('sessão antiga do Supabase'),
  },
  storage: { from: (bucket: string) => ({
    upload: async (path: string, file: Blob, _options?: any) => { const form = new FormData(); form.set('key', path); form.set('file', file); const r = await wrapped(() => request(`/files/${encodeURIComponent(bucket)}`, 'POST', form)); return r.error ? r : { data: r.data.data, error: null }; },
    getPublicUrl: (path: string) => ({ data: { publicUrl: `${base}/files/public/${encodeURIComponent(bucket)}/${path.split('/').map(encodeURIComponent).join('/')}` } }),
    remove: (paths: string[]) => wrapped(() => request(`/files/${encodeURIComponent(bucket)}`, 'DELETE', paths)),
    list: (_path?: string) => unsupported('listagem de arquivos'),
  }) },
};
window.addEventListener('storage', e => { if (e.key === key) { try { session = JSON.parse(e.newValue || 'null'); } catch { session = null; } listeners.forEach(fn => fn(session ? 'SIGNED_IN' : 'SIGNED_OUT', session)); } });
