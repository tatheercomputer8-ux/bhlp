import {useEffect,useState} from 'react'
import {Routes,Route,Link,NavLink,useNavigate} from 'react-router-dom'
import {sb,Settings} from './lib/supabase'
import Home from './pages/Home';import Watch from './pages/Watch';import Info from './pages/Info';import {Login,Dashboard} from './pages/Admin'
function Shell({s,children}:{s:Settings|null;children:React.ReactNode}){
 const [open,setOpen]=useState(false);const nav=[['/','Home'],['/videos','All Nohay'],['/videos?category=muharram','Muharram Videos'],['/videos?featured=1','Featured Videos'],['/about','About Us'],['/contact','Contact Us']]
 return <><header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
  <Link to="/" className="flex items-center gap-3">{s?.logo_url?<img src={s.logo_url} alt="" className="h-10 w-10 rounded-full object-cover ring-1 ring-gold"/>:<span className="grid h-10 w-10 place-items-center rounded-full ring-1 ring-gold font-ar text-gold">ب</span>}
  <span><b className="block text-sm tracking-wide text-gold">{(s?.website_name||'Babul Hawaij Layyah Party').toUpperCase()}</b><span className="font-ur text-xs text-mute">{s?.website_name_ur}</span></span></Link>
  <nav className="ml-auto hidden gap-5 text-sm text-mute lg:flex">{nav.map(([to,l])=><NavLink key={l} to={to} className="hover:text-gold2">{l}</NavLink>)}</nav>
  <button className="btn-ghost ml-auto lg:hidden" aria-label="Menu" onClick={()=>setOpen(!open)}>☰</button></div>
  {open&&<nav className="grid gap-1 border-t border-line px-4 py-3 lg:hidden">{nav.map(([to,l])=><Link key={l} to={to} onClick={()=>setOpen(false)} className="py-2 text-mute">{l}</Link>)}</nav>}</header>
  <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
  <footer className="mt-16 border-t border-line bg-bg2 px-4 py-10 text-center text-sm text-mute"><b className="text-gold">BABUL HAWAIJ LAYYAH PARTY</b><p className="mt-1">Preserving the Legacy of Azadari and the Remembrance of Karbala.</p>
   <p className="mt-3">{Object.entries(s?.social_links||{}).filter(([,v])=>v).map(([k,v])=><a key={k} href={v} rel="noopener noreferrer" target="_blank" className="mx-2 hover:text-gold2">{k}</a>)}</p><p className="mt-3">© 2026 Babul Hawaij Layyah Party. All Rights Reserved.</p></footer></>}
export default function App(){
 const [s,setS]=useState<Settings|null>(null)
 useEffect(()=>{sb.from('site_settings').select('*').eq('id',1).single().then(({data})=>setS(data as Settings))},[])
 return <Routes><Route path="/admin/login" element={<Login/>}/><Route path="/admin/dashboard" element={<Dashboard/>}/>
  <Route path="*" element={<Shell s={s}><Routes><Route path="/" element={<Home s={s}/>}/><Route path="/videos" element={<Home s={s} listOnly/>}/><Route path="/videos/:vid" element={<Watch/>}/>
  <Route path="/about" element={<Info title="About Babul Hawaij Layyah Party" body={s?.about_content}/>}/>
  <Route path="/contact" element={<Info title="Contact Us" body={[s?.contact_phone&&`Phone: ${s.contact_phone}`,s?.contact_email&&`Email: ${s.contact_email}`].filter(Boolean).join('\n')||'Contact details have not been added yet.'}/>}/></Routes></Shell>}/></Routes>}
