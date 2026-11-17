// Deno edge function. Admin-only. Secret needed: YOUTUBE_API_KEY (SUPABASE_URL/ANON_KEY are injected).
import {createClient} from 'https://esm.sh/@supabase/supabase-js@2'
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, content-type, apikey, x-client-info'}
const json=(b:unknown,s=200)=>new Response(JSON.stringify(b),{status:s,headers:{...cors,'Content-Type':'application/json'}})
function parseId(raw:string):string|null{try{const u=new URL(raw.trim());const h=u.hostname.replace(/^(www|m)\./,'')
 if(h==='youtu.be')return u.pathname.slice(1).split('/')[0]||null
 if(h==='youtube.com'){if(u.pathname==='/watch')return u.searchParams.get('v')
  const m=u.pathname.match(/^\/(shorts|live|embed)\/([\w-]{11})/);if(m)return m[2]}}catch{}return null}
function dur(iso:string){const m=iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)!;const h=+(m[1]||0),mi=+(m[2]||0),s=+(m[3]||0)
 return h?`${h}:${String(mi).padStart(2,'0')}:${String(s).padStart(2,'0')}`:`${mi}:${String(s).padStart(2,'0')}`}
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers:cors})
 const sb=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_ANON_KEY')!,{global:{headers:{Authorization:req.headers.get('Authorization')||''}}})
 const {data:{user}}=await sb.auth.getUser();if(!user)return json({error:'Not signed in'},401)
 const {data:adm}=await sb.from('admins').select('id').eq('id',user.id).maybeSingle();if(!adm)return json({error:'Admins only'},403)
 const {url}=await req.json().catch(()=>({}));const id=typeof url==='string'?parseId(url):null
 if(!id||!/^[\w-]{11}$/.test(id))return json({error:'Not a valid YouTube video link.'},400)
 const key=Deno.env.get('YOUTUBE_API_KEY');if(!key)return json({error:'YOUTUBE_API_KEY is not set on the server.'},500)
 const r=await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,status&id=${id}&key=${key}`)
 if(!r.ok)return json({error:'YouTube API request failed.'},502)
 const v=(await r.json()).items?.[0];if(!v)return json({error:'Video is private, deleted or does not exist.'},404)
 if(!v.status.embeddable)return json({error:'The owner has disabled embedding for this video.'},422)
 const t=v.snippet.thumbnails
 return json({youtube_video_id:id,youtube_url:`https://www.youtube.com/watch?v=${id}`,title:v.snippet.title,description:v.snippet.description,
  thumbnail_url:(t.maxres||t.high||t.medium||t.default).url,channel_name:v.snippet.channelTitle,duration:dur(v.contentDetails.duration),published_at:v.snippet.publishedAt})})
