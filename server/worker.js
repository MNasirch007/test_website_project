import { sampleWorkspace } from '../shared/rental.js';
import { applyCommand, ValidationError } from './commands.js';
const json = (data, status = 200) => new Response(JSON.stringify(data), {status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
async function body(request) {
  if(!request.headers.get('content-type')?.startsWith('application/json')) throw new ValidationError('Send a JSON request.',415);
  const reader=request.body?.getReader(); if(!reader) throw new ValidationError('Request body is required.');
  let size=0; const chunks=[];
  while(true) { const {value,done}=await reader.read(); if(done) break; size+=value.byteLength; if(size>32768) {await reader.cancel();throw new ValidationError('Request is too large.',413);} chunks.push(value); }
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  try{return JSON.parse(new TextDecoder().decode(bytes));}catch{throw new ValidationError('Request JSON is invalid.');}
}
const owned = (db, ownerId) => db.prepare('SELECT * FROM workspaces WHERE owner_id = ?').bind(ownerId).first();
async function getOwned(db, ownerId) {
  let row=await owned(db,ownerId);
  if(!row) {
    await db.prepare('INSERT OR IGNORE INTO workspaces (owner_id, public_id, data, revision) VALUES (?, ?, ?, 0)').bind(ownerId,crypto.randomUUID(),JSON.stringify(sampleWorkspace())).run();
    row=await owned(db,ownerId);
  }
  return row;
}
function payload(row) { return { ...JSON.parse(row.data), revision:row.revision, publicId:row.public_id }; }
export async function handleApi(request, env) {
  const url=new URL(request.url);
  try {
    if(!env.DB) return json({error:'Database binding is not configured.'},503);
    const ownerId=request.headers.get('oai-authenticated-user-id');
    const user=request.headers.get('oai-authenticated-user-full-name') || 'Owner';
    const isPublic=url.pathname.startsWith('/api/public/');
    const publicId=isPublic ? url.pathname.split('/')[3] : null;
    if(!isPublic && !ownerId) return json({error:'Sign in to your owner workspace.'},401);
    if(!isPublic && !['/api/workspace','/api/commands'].includes(url.pathname)) return json({error:'Route not found.'},404);
    let row=isPublic ? await env.DB.prepare('SELECT * FROM workspaces WHERE public_id = ?').bind(publicId).first() : await getOwned(env.DB,ownerId);
    if(!row) return json({error:'This rental business was not found.'},404);
    if(request.method==='GET') {
      if(isPublic) {
        const state=JSON.parse(row.data);
        return json({businessId:row.public_id,demo:state.demo,settings:state.settings,vehicles:state.vehicles.filter(v=>v.listed),blocked:state.bookings.filter(b=>['Confirmed','Active'].includes(b.status)).map(b=>({vehicleId:b.vehicleId,start:b.start,end:b.status==='Active'&&Date.parse(b.end)<Date.now()?new Date(Date.now()+86400000).toISOString():b.end})),maintenance:state.maintenance.map(m=>({vehicleId:m.vehicleId,start:m.start,end:m.end}))});
      }
      if(url.pathname!=='/api/workspace') return json({error:'Method not allowed.'},405);
      return json({...payload(row),accountName:user});
    }
    if(request.method!=='POST'||(!isPublic&&url.pathname!=='/api/commands')) return json({error:'Method not allowed.'},405);
    if((request.headers.get('origin') && request.headers.get('origin')!==url.origin)||request.headers.get('sec-fetch-site')==='cross-site') return json({error:'Cross-site requests are not allowed.'},403);
    const input=await body(request);
    for(let attempt=0;attempt<4;attempt++) {
      if(!isPublic && input.revision!==row.revision) return json({error:'The workspace changed in another tab. Refresh and try again.'},409);
      const state=applyCommand(JSON.parse(row.data),input,isPublic?'Customer':user,isPublic);
      const serialized=JSON.stringify(state);
      if(serialized.length>1500000) return json({error:'Workspace storage limit reached. Export your records before adding more.'},409);
      // shortcut: small fleets use one atomic workspace document; normalize tables before large fleets or granular staff permissions.
      const update=await env.DB.prepare('UPDATE workspaces SET data = ?, revision = revision + 1 WHERE owner_id = ? AND revision = ?').bind(serialized,row.owner_id,row.revision).run();
      if(update.meta.changes) {
        if(isPublic) {
          const booking=state.bookings.find(b=>b.submissionId===input.commandId);
          return json({reference:booking?.reference,status:'Requested'},201);
        }
        return json({...state,publicId:row.public_id,revision:row.revision+1,accountName:user});
      }
      row=await (isPublic?env.DB.prepare('SELECT * FROM workspaces WHERE public_id = ?').bind(publicId).first():owned(env.DB,ownerId));
    }
    return json({error:'Another booking was saved at the same time. Please try again.'},409);
  } catch(error) {
    if(error instanceof ValidationError) return json({error:error.message},error.status);
    console.error('Renter API error',error.message);
    return json({error:'Unable to save right now. Please try again.'},500);
  }
}
export default {
  async fetch(request,env) {
    if(new URL(request.url).pathname.startsWith('/api/')) return handleApi(request,env);
    return env.ASSETS.fetch(request);
  },
};

