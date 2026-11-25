const C='poo-up2-v1',F=['./','index.html','app.js','questoes.json','conteudos.json','cartoes.json','mapas.json','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(F)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.indexOf('poo-')===0&&x!==C).map(x=>caches.delete(x)))));self.clients.claim()});
// Rede primeiro: com internet pega a versão mais nova; sem internet usa a cópia guardada.
self.addEventListener('fetch',e=>{
if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;
if(!new URL(e.request.url).pathname.startsWith(new URL(self.registration.scope).pathname))return;
e.respondWith(fetch(e.request,{cache:'no-cache'}).then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp));return r}).catch(()=>caches.match(e.request)))});
