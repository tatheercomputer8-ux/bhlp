import {useEffect,useState} from 'react'
import {Link,useSearchParams} from 'react-router-dom'
import {sb,SEL,Video,Settings} from '../lib/supabase'
const noMotion=()=>typeof matchMedia!=='undefined'&&matchMedia('(prefers-reduced-motion: reduce)').matches
const tilt=(e:React.MouseEvent<HTMLElement>)=>{if(noMotion())return;const el=e.currentTarget,r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;el.style.transform=`perspective(700px) rotateX(${-y*10}deg) rotateY(${x*12}deg) translateZ(12px)`}
const untilt=(e:React.MouseEvent<HTMLElement>)=>{e.currentTarget.style.transform=''}
const heroMove=(e:React.MouseEvent<HTMLElement>)=>{if(noMotion())return;const el=e.currentTarget,r=el.getBoundingClientRect();el.style.setProperty('--ry',`${((e.clientX-r.left)/r.width-.5)*16}deg`);el.style.setProperty('--rx',`${-((e.clientY-r.top)/r.height-.5)*12}deg`)}
export function Card({v}:{v:Video}){return <Link to={`/videos/${v.youtube_video_id}`} className="card3d group overflow-hidden rounded-xl border border-line bg-card hover:border-gold" onMouseMove={tilt} onMouseLeave={untilt}>
 <div className="relative aspect-video overflow-hidden"><img loading="lazy" src={v.thumbnail_url||''} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-105"/>
 <span className="absolute inset-0 grid place-items-center text-4xl text-gold opacity-80">▶</span>{v.duration&&<span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 text-xs">{v.duration}</span>}
 {v.is_featured&&<span className="absolute left-2 top-2 rounded bg-gold px-2 text-xs font-semibold text-bg">Featured</span>}</div>
 <div className="p-3"><h3 className="line-clamp-2 text-sm font-semibold">{v.title}</h3><p className="mt-1 text-xs text-mute">{v.channel_name} {v.categories&&`• ${v.categories.name_en}`}</p></div></Link>}
const Grid=({list}:{list:Video[]})=><div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{list.map(v=><Card key={v.id} v={v}/>)}</div>
export default function Home({s,listOnly}:{s:Settings|null;listOnly?:boolean}){
 const [p,setP]=useSearchParams();const [q,setQ]=useState(p.get('q')||'');const [sort,setSort]=useState(false)
 const [vids,setVids]=useState<Video[]>([]);const [loading,setLoading]=useState(true);const [err,setErr]=useState('')
 const cat=p.get('category'),feat=p.get('featured'),searching=!!(p.get('q')||cat||feat||listOnly)
 useEffect(()=>{setLoading(true);let qb=sb.from('videos').select(SEL).eq('is_published',true).order('published_at',{ascending:sort}).limit(200)
  const t=p.get('q')?.replace(/[%,()]/g,' ').trim();if(t)qb=qb.or(`title.ilike.%${t}%,reciter_name.ilike.%${t}%,description.ilike.%${t}%`)
  if(feat)qb=qb.eq('is_featured',true)
  qb.then(({data,error})=>{setErr(error?.message||'');let d=(data||[]) as Video[];if(cat)d=d.filter(v=>v.categories?.slug===cat);setVids(d);setLoading(false)})},[p,sort])
 const go=(e:React.FormEvent)=>{e.preventDefault();setP(q?{q}:{})}
 const sec=(t:string,l:Video[],to:string)=>l.length>0&&<section className="mt-12"><div className="mb-4 flex items-end justify-between"><h2 className="text-xl font-bold text-gold2">{t}</h2><Link to={to} className="text-sm text-mute hover:text-gold2">View All</Link></div><Grid list={l.slice(0,4)}/></section>
 return <>{!listOnly&&!p.get('q')&&<section onMouseMove={heroMove} className="hero3d relative overflow-hidden rounded-2xl border border-line bg-bg2 px-6 py-16 text-center" style={{backgroundImage:'radial-gradient(circle at 50% 0,rgba(212,175,55,.12),transparent 60%)'}}>
  <div className="scene" aria-hidden="true"><div className="star">{[-90,-45,0,45,90].map(z=><div key={z} className="layer" style={{transform:`translateZ(${z}px)`,opacity:1-Math.abs(z)/160}}><i/><i/></div>)}</div></div>
  <h1 className="text-3xl font-bold tracking-wide text-gold sm:text-5xl">BABUL HAWAIJ LAYYAH PARTY</h1><p className="mt-3 font-ur text-3xl leading-[2]">باب الحوائج لیہ پارٹی</p>
  <p className="mx-auto mt-2 max-w-xl text-mute">{s?.hero_description}</p>
  <form onSubmit={go} className="mx-auto mt-6 flex max-w-xl gap-2"><input className="inp py-3" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search Nohay, Reciters and Videos..." aria-label="Search"/><button className="btn-gold">Search</button></form>
  <div className="mt-5 flex justify-center gap-3"><Link to="/videos" className="btn-gold">Explore All Nohay</Link><a href="#latest" className="btn-ghost">Watch Latest Videos</a></div></section>}
 {listOnly&&<form onSubmit={go} className="flex gap-2"><input className="inp" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search Nohay, Reciters and Videos..."/><button className="btn-gold">Search</button></form>}
 {err&&<p className="mt-6 text-red-400">Could not load videos: {err}</p>}{loading&&<p className="mt-8 text-mute">Loading…</p>}
 {!loading&&searching&&<><div className="mt-6 flex items-center justify-between"><h2 className="text-xl font-bold text-gold2">{p.get('q')?`Results for “${p.get('q')}”`:feat?'Featured Videos':cat?'Muharram Videos':'All Nohay'}</h2><button className="btn-ghost" onClick={()=>setSort(!sort)}>{sort?'Oldest first':'Latest first'}</button></div>
  {vids.length?<div className="mt-4"><Grid list={vids}/></div>:<p className="mt-10 text-center text-mute">No videos found. Try a different word or browse all Nohay.</p>}</>}
 {!loading&&!searching&&<>{sec('Featured Nohay',vids.filter(v=>v.is_featured),'/videos?featured=1')}<div id="latest">{sec('Latest Nohay',vids,'/videos')}</div>{sec('Muharram Special',vids.filter(v=>v.categories?.slug==='muharram'),'/videos?category=muharram')}
  {vids.length>0?<section className="mt-12"><h2 className="mb-4 text-xl font-bold text-gold2">All Videos</h2><Grid list={vids}/></section>:<p className="mt-10 text-center text-mute">No videos have been published yet.</p>}</>}</>}
