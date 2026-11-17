import {useCallback,useEffect,useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {sb,SEL,Video} from '../lib/supabase'
export function Login(){
 const nav=useNavigate();const [e,setE]=useState('');const [p,setP]=useState('');const [err,setErr]=useState('');const [busy,setBusy]=useState(false)
 const submit=async(ev:React.FormEvent)=>{ev.preventDefault();setBusy(true);setErr('');const {error}=await sb.auth.signInWithPassword({email:e,password:p});setBusy(false);error?setErr(error.message):nav('/admin/dashboard')}
 return <div className="grid min-h-screen place-items-center px-4"><form onSubmit={submit} className="w-full max-w-sm space-y-3 rounded-xl border border-line bg-card p-6"><h1 className="text-xl font-bold text-gold">Admin sign in</h1>
 <input className="inp" type="email" required placeholder="Email" value={e} onChange={x=>setE(x.target.value)}/><input className="inp" type="password" required placeholder="Password" value={p} onChange={x=>setP(x.target.value)}/>
 {err&&<p className="text-sm text-red-400">{err}</p>}<button disabled={busy} className="btn-gold w-full">{busy?'Signing in…':'Sign in'}</button></form></div>}
type Meta={youtube_video_id:string;youtube_url:string;title:string;description:string;thumbnail_url:string;channel_name:string;duration:string;published_at:string}
export function Dashboard(){
 const nav=useNavigate();const [ok,setOk]=useState(false);const [list,setList]=useState<Video[]>([]);const [cats,setCats]=useState<{id:string;name_en:string}[]>([])
 const [url,setUrl]=useState('');const [m,setM]=useState<Meta|null>(null);const [cat,setCat]=useState('');const [rec,setRec]=useState('');const [msg,setMsg]=useState<{t:'ok'|'err';s:string}|null>(null);const [busy,setBusy]=useState(false)
 const load=useCallback(async()=>{const {data}=await sb.from('videos').select(SEL).order('created_at',{ascending:false});setList((data||[]) as Video[])},[])
 useEffect(()=>{(async()=>{const {data:{session}}=await sb.auth.getSession();if(!session)return nav('/admin/login')
  const {data}=await sb.from('admins').select('id').eq('id',session.user.id).maybeSingle();if(!data){await sb.auth.signOut();return nav('/admin/login')}
  setOk(true);load();const c=await sb.from('categories').select('id,name_en').order('sort_order');setCats(c.data||[]);setCat(c.data?.[0]?.id||'')})()},[nav,load])
 const fetchMeta=async()=>{setBusy(true);setMsg(null);setM(null);const {data,error}=await sb.functions.invoke('youtube-meta',{body:{url}})
  if(error){let s=error.message;try{s=(await (error as any).context.json()).error||s}catch{};setMsg({t:'err',s})}else setM(data as Meta);setBusy(false)}
 const publish=async()=>{if(!m)return;setBusy(true);const {error}=await sb.from('videos').insert({...m,category_id:cat||null,reciter_name:rec||null,is_published:true})
  setBusy(false);if(error)return setMsg({t:'err',s:error.code==='23505'?'This video has already been added.':error.message})
  setMsg({t:'ok',s:'Published.'});setM(null);setUrl('');setRec('');load()}
 const patch=async(id:string,c:Partial<Video>)=>{await sb.from('videos').update(c).eq('id',id);load()}
 const del=async(v:Video)=>{if(confirm(`Delete “${v.title}”?`)){await sb.from('videos').delete().eq('id',v.id);load()}}
 if(!ok)return <p className="p-8 text-mute">Checking access…</p>
 return <div className="mx-auto max-w-5xl px-4 py-8"><div className="flex items-center justify-between"><h1 className="text-2xl font-bold text-gold">Dashboard</h1><button className="btn-ghost" onClick={async()=>{await sb.auth.signOut();nav('/admin/login')}}>Log out</button></div>
 <p className="mt-2 text-sm text-mute">{list.length} videos • {list.filter(v=>v.is_published).length} published • {list.filter(v=>v.is_featured).length} featured</p>
 <section className="mt-6 rounded-xl border border-line bg-card p-4"><h2 className="mb-3 font-semibold">Add New Video</h2><div className="flex gap-2"><input className="inp" placeholder="Paste a YouTube link" value={url} onChange={e=>setUrl(e.target.value)}/><button className="btn-gold" disabled={busy||!url} onClick={fetchMeta}>Fetch</button></div>
 {msg&&<p className={`mt-3 text-sm ${msg.t==='ok'?'text-green-400':'text-red-400'}`}>{msg.s}</p>}
 {m&&<div className="mt-4 grid gap-4 sm:grid-cols-2"><img src={m.thumbnail_url} alt="" className="rounded-lg"/><div className="space-y-2"><input className="inp" value={m.title} onChange={e=>setM({...m,title:e.target.value})}/><p className="text-xs text-mute">{m.channel_name} • {m.duration}</p>
 <textarea className="inp h-24" value={m.description} onChange={e=>setM({...m,description:e.target.value})}/><input className="inp" placeholder="Reciter (optional)" value={rec} onChange={e=>setRec(e.target.value)}/>
 <select className="inp" value={cat} onChange={e=>setCat(e.target.value)}>{cats.map(c=><option key={c.id} value={c.id}>{c.name_en}</option>)}</select><button className="btn-gold" disabled={busy} onClick={publish}>Publish Video</button></div></div>}</section>
 <section className="mt-6 space-y-2">{list.length===0&&<p className="text-mute">No videos yet. Paste a link above to add the first one.</p>}{list.map(v=><div key={v.id} className="flex items-center gap-3 rounded-lg border border-line bg-card p-2">
 <img src={v.thumbnail_url||''} alt="" className="h-14 w-24 rounded object-cover"/><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{v.title}</p><p className="text-xs text-mute">{v.is_published?'Published':'Draft'}{v.is_featured&&' • Featured'}</p></div>
 <button className="btn-ghost" onClick={()=>patch(v.id,{is_published:!v.is_published})}>{v.is_published?'Unpublish':'Publish'}</button><button className="btn-ghost" onClick={()=>patch(v.id,{is_featured:!v.is_featured})}>{v.is_featured?'Unfeature':'Feature'}</button><button className="btn-ghost text-red-400" onClick={()=>del(v)}>Delete</button></div>)}</section></div>}
