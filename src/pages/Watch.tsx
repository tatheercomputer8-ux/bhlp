import {useEffect,useState} from 'react'
import {Link,useParams} from 'react-router-dom'
import {sb,SEL,Video} from '../lib/supabase';import {Card} from './Home'
export default function Watch(){
 const {vid}=useParams();const [v,setV]=useState<Video|null>(null);const [rel,setRel]=useState<Video[]>([]);const [state,setState]=useState('loading');const [copied,setCopied]=useState(false)
 useEffect(()=>{setState('loading');sb.from('videos').select(SEL).eq('youtube_video_id',vid).eq('is_published',true).maybeSingle().then(async({data})=>{
  if(!data){setState('missing');return}const d=data as Video;setV(d);setState('ok');document.title=`${d.title} | Babul Hawaij Layyah Party`
  const r=await sb.from('videos').select(SEL).eq('is_published',true).neq('id',d.id).order('published_at',{ascending:false}).limit(4);setRel((r.data||[]) as Video[])})},[vid])
 if(state==='loading')return <p className="text-mute">Loading…</p>
 if(!v)return <p className="text-center text-mute">This video is not available. <Link className="text-gold" to="/videos">Back to videos</Link></p>
 const share=()=>navigator.share?navigator.share({title:v.title,url:location.href}):copy();const copy=()=>navigator.clipboard.writeText(location.href).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000)})
 return <><Link to="/videos" className="text-sm text-mute hover:text-gold2">← Back to videos</Link>
 <div className="mx-auto mt-4 max-w-4xl"><div className="aspect-video overflow-hidden rounded-xl border border-line"><iframe className="h-full w-full" loading="lazy" src={`https://www.youtube-nocookie.com/embed/${v.youtube_video_id}`} title={v.title} allow="accelerometer;autoplay;encrypted-media;picture-in-picture;fullscreen" allowFullScreen/></div>
 <h1 className="mt-4 text-2xl font-bold">{v.title}</h1><p className="mt-1 text-sm text-mute">{v.channel_name}</p>
 <div className="mt-3 flex gap-2"><button className="btn-gold" onClick={share}>Share</button><button className="btn-ghost" onClick={copy}>{copied?'Copied':'Copy link'}</button></div>
 {v.description&&<p className="mt-5 whitespace-pre-line text-sm leading-7 text-mute">{v.description}</p>}</div>
 {rel.length>0&&<section className="mt-12"><h2 className="mb-4 text-xl font-bold text-gold2">Related videos</h2><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{rel.map(r=><Card key={r.id} v={r}/>)}</div></section>}</>}
