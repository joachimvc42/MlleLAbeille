import fs from 'node:fs';
const env = Object.fromEntries(fs.readFileSync('.env.local', 'utf8').split(/\r?\n/).filter(x => x && !x.startsWith('#')).map(x => { const i=x.indexOf('='); return [x.slice(0,i),x.slice(i+1)]; }));
const schema = process.argv[2] || env.NEXT_PUBLIC_SUPABASE_SCHEMA;
const res = await fetch(env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/illustrations?select=slug&limit=10', {headers: {apikey:env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'Accept-Profile':schema}});
const data=await res.json();
console.log(JSON.stringify({status:res.status, schema, ...(res.ok?{rows:data.length, slugs:data.map(x=>x.slug)}:{error:data})}));
