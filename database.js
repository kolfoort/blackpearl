import {createClient} from 'https://esm.sh/@supabase/supabase-js@2';
export const db=createClient('https://bibzafctpkekixsevqfx.supabase.co','sb_publishable_iH6_f3FntZZWJ44xVyAARw_EKmmEhDf');
export const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const number=v=>Number(v||0).toLocaleString('nl-NL');
export const photo=p=>p?.startsWith('assets/')?p:db.storage.from('car-photos').getPublicUrl(p||'').data.publicUrl;
