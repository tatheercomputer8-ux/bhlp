import {createClient} from '@supabase/supabase-js'
export const sb=createClient(import.meta.env.VITE_SUPABASE_URL,import.meta.env.VITE_SUPABASE_ANON_KEY)
export type Video={id:string;youtube_video_id:string;youtube_url:string;title:string;description:string|null;thumbnail_url:string|null;channel_name:string|null;duration:string|null;category_id:string|null;reciter_name:string|null;is_featured:boolean;is_published:boolean;published_at:string|null;created_at:string;categories?:{name_en:string;slug:string}|null}
export type Settings={website_name:string;website_name_ur:string;logo_url:string|null;hero_description:string;about_content:string;contact_email:string|null;contact_phone:string|null;social_links:Record<string,string>}
export const SEL='*,categories(name_en,slug)'
