// ⚡ DopaMind Vault — Service Worker v2
const CACHE = 'dopamind-vault-v2';
const BASE  = self.location.pathname.replace('/sw.js','');
const STATIC = [BASE+'/',BASE+'/index.html',BASE+'/manifest.json'];
const CDN    = ['https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(async c=>{
    try{await c.addAll(STATIC)}catch(_){for(const u of STATIC){try{await c.add(u)}catch(_2){}}}
    for(const u of CDN){try{const r=await fetch(u,{mode:'cors'});if(r.ok)await c.put(u,r)}catch(_){}}
  }));
  self.skipWaiting();
});

self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  const url=e.request.url;
  // Never cache Firebase API calls
  if(url.includes('firebaseio.com')||url.includes('firebase')) return;
  if(!url.startsWith('http')) return;
  if(e.request.mode==='navigate'){
    e.respondWith(caches.match(BASE+'/index.html').then(c=>c||fetch(e.request)).catch(()=>caches.match(BASE+'/index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then(cached=>{
    if(cached) return cached;
    return fetch(e.request).then(r=>{
      if(r&&r.ok){const cl=r.clone();caches.open(CACHE).then(c=>{try{c.put(e.request,cl)}catch(_){}});}
      return r;
    }).catch(()=>{});
  }));
});
