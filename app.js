var Q=[],BYID={};
var SN={REL:'Relacionamentos e UML',HER:'Herança',ABS:'Classe abstrata',INT:'Interface',POL:'Polimorfismo',EXC:'Exceções',KEY:'Palavras-chave'};
var ORDER=['REL','HER','ABS','INT','POL','EXC','KEY'];
var TN={vf:'V ou F sobre o código',uml:'Diagrama UML',me:'Múltipla escolha',lac:'Complete o código',lin:'Ache o erro',ce:'Certo ou errado'};
var TORDER=['vf','uml','me','lac','lin','ce'];
var CASO={},DIAG={};
var CONT=null;
function setData(DATA){Q=DATA.q;BYID={};CASO={};DIAG=DATA.diag||{};(DATA.casos||[]).forEach(function(c){CASO[c.id]=c});Q.forEach(function(q){q.t=q.t||'me';BYID[q.id]=q})}

/* ---------- estado ---------- */
var S={ans:{},chk:{},flag:{}};
var LS='poo-up2-banco-v1';
function load(){try{var v=JSON.parse(localStorage.getItem(LS)||'null');if(v)S=Object.assign({ans:{},chk:{},flag:{}},v)}catch(e){}}
function persist(){try{localStorage.setItem(LS,JSON.stringify(S))}catch(e){}}
/* ---------- util ---------- */
function esc(t){return String(t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function shuffle(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t}return a}
function isWrong(id){var r=S.ans[id];return r&&r[2]===0}
function $(id){return document.getElementById(id)}
/* texto com **negrito** e `código` */
function fmtR(t){
  return esc(t).replace(/`([^`]+)`/g,function(_,c){return '<code>'+c.replace(/\*/g,'&#42;')+'</code>'}).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>');
}
function codeBlock(src){return '<pre class="code">'+esc(src)+'</pre>'}
function norm(s){return String(s).replace(/\s+/g,'')}
function linesOf(q){return q.k.split('\n')}
function ansList(q){return Array.isArray(q.a)?q.a:[q.a]}
/* gabarito em texto, para erros e cartões */
function gabText(q){
  if(q.t==='ce')return q.a===0?'Certo':'Errado';
  if(q.t==='vf')return q.a===0?'Verdadeiro':'Falso';
  if(q.t==='uml')return 'Opção '+'ABC'[q.a];
  if(q.t==='lac')return q.a.map(function(a,i){return (q.a.length>1?'Lacuna '+(i+1)+': ':'')+a[0]}).join(' · ');
  if(q.t==='lin'){var L=linesOf(q);return ansList(q).map(function(i){return 'linha '+(i+1)+': '+L[i].trim()}).join(' / ')}
  return q.o[q.a];
}

/* ---------- diagrama UML (SVG) ---------- */
var LH=17;
function boxH(c){return (c.st?LH:0)+LH+10+Math.max(c.a.length,0)*LH+8+Math.max(c.m.length,0)*LH+8}
function umlSvg(d){
  if(!d)return '';
  var B={};d.cls.forEach(function(c){B[c.id]={x:c.x,y:c.y,w:c.w,h:boxH(c),c:c}});
  var s='<svg viewBox="0 0 '+d.w+' '+d.h+'" role="img" aria-label="Diagrama de classes" font-family="Barlow,system-ui,sans-serif" font-size="13">';
  function edge(b,tx,ty){var cx=b.x+b.w/2,cy=b.y+b.h/2,dx=tx-cx,dy=ty-cy;if(!dx&&!dy)return [cx,cy];
    var sx=dx?(b.w/2)/Math.abs(dx):1e9,sy=dy?(b.h/2)/Math.abs(dy):1e9,k=Math.min(sx,sy);return [cx+dx*k,cy+dy*k]}
  d.rel.forEach(function(r){
    var f=B[r.f],t=B[r.t],fc=[f.x+f.w/2,f.y+f.h/2],tc=[t.x+t.w/2,t.y+t.h/2];
    var p1=edge(f,tc[0],tc[1]),p2=edge(t,fc[0],fc[1]);
    var dx=p2[0]-p1[0],dy=p2[1]-p1[1],L=Math.sqrt(dx*dx+dy*dy)||1,ux=dx/L,uy=dy/L,nx=-uy,ny=ux;
    var endTrim=(r.k==='her'||r.k==='real')?14:(r.k==='comp'||r.k==='agreg')?22:0;
    var e=[p2[0]-ux*endTrim,p2[1]-uy*endTrim];
    s+='<line x1="'+p1[0]+'" y1="'+p1[1]+'" x2="'+e[0]+'" y2="'+e[1]+'" stroke="currentColor" stroke-width="1.6"'+(r.k==='real'?' stroke-dasharray="6 5"':'')+'/>';
    if(r.k==='her'||r.k==='real'){var a=[p2[0]-ux*14+nx*8,p2[1]-uy*14+ny*8],b=[p2[0]-ux*14-nx*8,p2[1]-uy*14-ny*8];
      s+='<polygon points="'+p2.join(',')+' '+a.join(',')+' '+b.join(',')+'" fill="var(--surface)" stroke="currentColor" stroke-width="1.6"/>'}
    if(r.k==='comp'||r.k==='agreg'){var m=[p2[0]-ux*11+nx*7,p2[1]-uy*11+ny*7],q2=[p2[0]-ux*22,p2[1]-uy*22],n=[p2[0]-ux*11-nx*7,p2[1]-uy*11-ny*7];
      s+='<polygon points="'+p2.join(',')+' '+m.join(',')+' '+q2.join(',')+' '+n.join(',')+'" fill="'+(r.k==='comp'?'currentColor':'var(--surface)')+'" stroke="currentColor" stroke-width="1.6"/>'}
    function lab(p,u,txt,back){if(!txt)return;var o=back?-1:1;var x=p[0]+u[0]*o*30+nx*14,y=p[1]+u[1]*o*30+ny*14+4;s+='<text x="'+x+'" y="'+y+'" text-anchor="middle" fill="currentColor">'+esc(txt)+'</text>'}
    lab(p1,[ux,uy],r.m1,false);lab(p2,[ux,uy],r.m2,true);
  });
  d.cls.forEach(function(c){var b=B[c.id],y=c.y;
    s+='<rect x="'+c.x+'" y="'+c.y+'" width="'+c.w+'" height="'+b.h+'" fill="var(--surface)" stroke="currentColor" stroke-width="1.6"/>';
    var cx=c.x+c.w/2;y+=LH;
    if(c.st){s+='<text x="'+cx+'" y="'+y+'" text-anchor="middle" fill="currentColor" font-size="12">«'+esc(c.st)+'»</text>';y+=LH}
    s+='<text x="'+cx+'" y="'+y+'" text-anchor="middle" fill="currentColor" font-weight="700"'+(c.st==='abstract'?' font-style="italic"':'')+'>'+esc(c.n)+'</text>';
    y+=8;s+='<line x1="'+c.x+'" y1="'+y+'" x2="'+(c.x+c.w)+'" y2="'+y+'" stroke="currentColor" stroke-width="1.2"/>';
    c.a.forEach(function(t){y+=LH;s+='<text x="'+(c.x+8)+'" y="'+(y-2)+'" fill="currentColor">'+esc(t)+'</text>'});
    y+=8;s+='<line x1="'+c.x+'" y1="'+y+'" x2="'+(c.x+c.w)+'" y2="'+y+'" stroke="currentColor" stroke-width="1.2"/>';
    c.m.forEach(function(t){y+=LH;var ab=/\{abstract\}/.test(t);s+='<text x="'+(c.x+8)+'" y="'+(y-2)+'" fill="currentColor"'+(ab?' font-style="italic"':'')+'>'+esc(t)+'</text>'});
  });
  return s+'</svg>';
}

/* ---------- treino ---------- */
var cfg={subj:{},tipo:{},mode:'new'};
function renderChips(){
  var c={},tc={};Q.forEach(function(q){c[q.s]=(c[q.s]||0)+1;tc[q.t]=(tc[q.t]||0)+1});
  $('subjchips').innerHTML=ORDER.filter(function(s){return c[s]}).map(function(s){
    return '<button class="chip" data-s="'+s+'" aria-pressed="'+(!!cfg.subj[s])+'">'+esc(SN[s])+' <small>'+c[s]+'</small></button>'}).join('');
  $('typechips').innerHTML=TORDER.filter(function(t){return tc[t]}).map(function(t){
    return '<button class="chip" data-t="'+t+'" aria-pressed="'+(!!cfg.tipo[t])+'">'+esc(TN[t])+' <small>'+tc[t]+'</small></button>'}).join('');
  $('subjchips').querySelectorAll('.chip').forEach(function(b){b.onclick=function(){var s=b.dataset.s;if(cfg.subj[s])delete cfg.subj[s];else cfg.subj[s]=1;renderChips()}});
  $('typechips').querySelectorAll('.chip').forEach(function(b){b.onclick=function(){var t=b.dataset.t;if(cfg.tipo[t])delete cfg.tipo[t];else cfg.tipo[t]=1;renderChips()}});
  renderPoolInfo();
}
function buildPool(){
  var anyS=Object.keys(cfg.subj).length===0,anyT=Object.keys(cfg.tipo).length===0;
  return Q.filter(function(q){
    if(!anyS&&!cfg.subj[q.s])return false;
    if(!anyT&&!cfg.tipo[q.t])return false;
    if(cfg.mode==='new')return !S.ans[q.id];
    if(cfg.mode==='wrong')return isWrong(q.id);
    return true;
  });
}
function renderPoolInfo(){
  var n=buildPool().length;
  $('poolinfo').textContent=n?(n+' questões disponíveis. Cada rodada tem até 10, em ordem aleatória.'):(cfg.mode==='wrong'?'Nenhuma questão errada aqui. Bom sinal.':'Você já respondeu todas destas. Escolha "Qualquer" para rever.');
  $('start').disabled=!n;
}
$('modeseg').querySelectorAll('button').forEach(function(b){b.onclick=function(){
  cfg.mode=b.dataset.mode;$('modeseg').querySelectorAll('button').forEach(function(x){x.setAttribute('aria-pressed',x===b)});renderPoolInfo()}});

var sess=null;
/* mantém juntas as afirmações do mesmo caso, na ordem do caso */
function groupOrder(ids){var out=[],seen={};ids.forEach(function(id){var q=BYID[id];
  if(q.t!=='vf'){out.push(id);return}if(seen[q.g])return;seen[q.g]=1;
  ids.filter(function(x){return BYID[x].g===q.g}).sort(function(x,y){return x.localeCompare(y,undefined,{numeric:true})}).forEach(function(x){out.push(x)})});return out}
function startSession(list,sim){
  sess={list:groupOrder(list),i:0,ok:0,done:0,answered:false,res:[],sim:!!sim,pts:0,max:0};
  $('setup').hidden=true;$('summary').hidden=true;$('quiz').hidden=false;showQ();window.scrollTo(0,0);
}
function histTag(id){var r=S.ans[id];if(!r)return '<span class="tag">Nova</span>';
  return '<span class="tag" style="color:'+(r[2]?'var(--ok)':'var(--bad)')+'">'+(r[2]?'✓ Acertou da última vez':'✗ Errou da última vez')+' · '+r[0]+'✓ '+r[1]+'✗</span>'}
function showQ(){
  var q=BYID[sess.list[sess.i]];sess.answered=false;
  $('sessScore').textContent=sess.sim?sess.pts:(sess.ok+'/'+sess.done);
  $('sessLeft').textContent=(sess.sim?'pontos · ':'')+'questão '+(sess.i+1)+' de '+sess.list.length;
  var head='<div class="qmeta"><span class="tag">'+esc(SN[q.s])+'</span>'+histTag(q.id)+'</div><span class="tipo">'+esc(TN[q.t])+'</span>';
  var body='<p class="qtext">'+fmtR(q.q)+'</p>';
  var prev=sess.i>0?BYID[sess.list[sess.i-1]]:null,sameCase=q.t==='vf'&&prev&&prev.g===q.g;
  if(q.t==='vf'){
    var cs=CASO[q.g],nIn=sess.list.filter(function(x){return BYID[x].g===q.g}),pos=nIn.indexOf(q.id)+1;
    body='<div class="casohd">Analise o código a seguir e selecione Verdadeiro ou Falso <span class="muted">· afirmação '+pos+' de '+nIn.length+'</span></div>'+(cs.n?'<p class="muted" style="font-size:.88rem;margin:0">'+esc(cs.n)+'</p>':'')+
      '<details class="casocode" open><summary>Código do caso</summary>'+codeBlock(cs.k)+'</details>'+
      '<p class="qtext" id="stmt">'+fmtR(q.q)+'</p>';
    sess.map=[0,1];
    body+='<div class="ce-opts"><button class="opt" data-i="0"><span>Verdadeiro</span></button><button class="opt" data-i="1"><span>Falso</span></button></div>';
  }else if(q.t==='uml'){
    body='<div class="casohd">Analise o diagrama abaixo</div><div class="uml">'+umlSvg(DIAG[q.d])+'</div><p class="qtext">'+fmtR(q.q)+'</p>';
    sess.map=[0,1,2];
    body+='<div class="opts">'+sess.map.map(function(oi){return '<button class="opt" data-i="'+oi+'"><b>'+'ABC'[oi]+'</b><span>'+codeBlock(q.o[oi])+'</span></button>'}).join('')+'</div>';
  }else if(q.t==='ce'){
    sess.map=[0,1];
    body+='<div class="ce-opts"><button class="opt" data-i="0"><span>Certo</span></button><button class="opt" data-i="1"><span>Errado</span></button></div>';
  }else if(q.t==='lac'){
    var n=0,html=esc(q.k).replace(/\{\{(\d+)\}\}/g,function(_,k){k=+k;n++;
      var w=Math.max.apply(null,q.a[k].map(function(x){return x.length}))+1;
      return '<input class="gap" data-g="'+k+'" style="width:'+Math.max(w,4)+'ch" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Lacuna '+(k+1)+'">'});
    body+='<pre class="code">'+html+'</pre><div class="row"><button class="btn grow" id="chkGap">Conferir</button></div>';
  }else if(q.t==='lin'){
    body+='<div class="lines">'+linesOf(q).map(function(l,i){return '<button data-l="'+i+'"><i>'+(i+1)+'</i><span>'+(esc(l)||' ')+'</span></button>'}).join('')+'</div>';
  }else{
    if(q.k)body+=codeBlock(q.k);
    sess.map=shuffle(q.o.map(function(_,i){return i}));
    body+='<div class="opts">'+sess.map.map(function(oi,pos){return '<button class="opt" data-i="'+oi+'"><b>'+'ABCD'[pos]+'</b><span>'+(q.oc?codeBlock(q.o[oi]):fmtR(q.o[oi]))+'</span></button>'}).join('')+'</div>';
  }
  body+='<div id="fb"></div>';
  $('qcard').innerHTML=head+body;
  if(sameCase){try{$('stmt').scrollIntoView({block:'center'})}catch(e){}}
  if(q.t==='lac'){
    var gaps=$('qcard').querySelectorAll('input.gap');
    gaps.forEach(function(g,i){g.onkeydown=function(e){if(e.key==='Enter'){e.preventDefault();if(i<gaps.length-1)gaps[i+1].focus();else checkGap(q)}}});
    $('chkGap').onclick=function(){checkGap(q)};
  }else if(q.t==='lin'){
    $('qcard').querySelectorAll('.lines button').forEach(function(b){b.onclick=function(){answerLine(q,+b.dataset.l)}});
  }else{
    $('qcard').querySelectorAll('.opt').forEach(function(b){b.onclick=function(){answerOpt(q,+b.dataset.i)}});
  }
}
function qPts(q){return q.t==='uml'?10:4}
function record(q,ok){
  sess.done++;if(ok)sess.ok++;sess.max+=qPts(q);if(ok)sess.pts+=qPts(q);
  var r=S.ans[q.id]||[0,0,0,0];r=[r[0]+(ok?1:0),r[1]+(ok?0:1),ok?1:0,Date.now()];S.ans[q.id]=r;persist();
  sess.res.push({id:q.id,ok:ok});
}
function answerOpt(q,i){
  if(sess.answered)return;sess.answered=true;
  var ok=i===q.a;record(q,ok);
  $('qcard').querySelectorAll('.opt').forEach(function(b){var k=+b.dataset.i;b.disabled=true;if(k===q.a)b.classList.add('right');else if(k===i)b.classList.add('wrong')});
  var gab=q.t==='ce'?(q.a===0?'Certo':'Errado'):q.t==='vf'?(q.a===0?'Verdadeiro':'Falso'):q.t==='uml'?'Opção '+'ABC'[q.a]:'ABCD'[sess.map.indexOf(q.a)];
  feedback(q,ok,ok?'Acertou.':'Errou. Resposta: '+gab+'.');
}
function answerLine(q,i){
  if(sess.answered)return;sess.answered=true;
  var A=ansList(q),ok=A.indexOf(i)>=0;record(q,ok);
  $('qcard').querySelectorAll('.lines button').forEach(function(b){var k=+b.dataset.l;b.disabled=true;if(A.indexOf(k)>=0)b.classList.add('right');else if(k===i)b.classList.add('wrong')});
  feedback(q,ok,ok?'Acertou.':'Errou. O erro está na linha '+A.map(function(x){return x+1}).join(' ou ')+'.');
}
function checkGap(q){
  if(sess.answered)return;
  var gaps=[].slice.call($('qcard').querySelectorAll('input.gap'));
  if(gaps.some(function(g){return !g.value.trim()})){
    var e=gaps.filter(function(g){return !g.value.trim()})[0];e.focus();
    $('fb').innerHTML='<p class="muted" style="font-size:.9rem">Preencha todas as lacunas antes de conferir.</p>';return}
  sess.answered=true;
  var allOk=true,fix=[];
  gaps.forEach(function(g){var k=+g.dataset.g,acc=q.a[k],v=norm(g.value);
    var ok=acc.some(function(a){return norm(a)===v});if(!ok)allOk=false;
    g.classList.add(ok?'right':'wrong');g.readOnly=true;
    if(!ok)fix.push((gaps.length>1?'Lacuna '+(k+1)+': ':'')+acc[0]);
  });
  $('chkGap').parentNode.remove();
  record(q,allOk);
  feedback(q,allOk,allOk?'Acertou.':'Errou. Resposta: '+fix.join(' · ')+'.');
}
function feedback(q,ok,title){
  var last=sess.i===sess.list.length-1;
  $('fb').innerHTML='<div class="fb'+(ok?'':' bad')+'"><strong>'+esc(title)+'</strong>'+(q.c?'<span>'+fmtR(q.c)+'</span>':'')+'</div>'+
    '<div class="row" style="margin-top:10px"><button class="btn grow" id="next">'+(last?'Ver resultado':'Próxima')+'</button></div>'+
    '<div class="row" style="justify-content:space-between;margin-top:6px"><span class="src">'+esc(q.f)+'</span><button class="linkbtn" id="flag">'+(S.flag[q.id]?'Marcada como suspeita':'Gabarito parece errado?')+'</button></div>';
  $('sessScore').textContent=sess.ok+'/'+sess.done;
  $('next').onclick=function(){if(last)endSession();else{sess.i++;var nq=BYID[sess.list[sess.i]];var same=nq.t==='vf'&&nq.g===q.g;if(!same)window.scrollTo(0,0);showQ()}};
  if(sess.sim)$('sessScore').textContent=sess.pts;
  $('flag').onclick=function(){if(S.flag[q.id])delete S.flag[q.id];else S.flag[q.id]=1;persist();this.textContent=S.flag[q.id]?'Marcada como suspeita':'Gabarito parece errado?'};
  try{$('next').focus({preventScroll:true})}catch(e){}
  renderBadges();
}
function endSession(){
  $('quiz').hidden=true;var s=$('summary');s.hidden=false;
  var pct=sess.done?Math.round(sess.ok/sess.done*100):0;
  var wrong=sess.res.filter(function(r){return !r.ok});
  if(sess.sim){endSim(s,wrong);return}
  s.innerHTML='<div class="label">Fim da rodada</div><div class="row"><span class="big">'+sess.ok+'/'+sess.done+'</span><span class="muted">'+pct+'% · '+(pct>=75?'meta de 75% batida':'abaixo da meta de 75%')+'</span></div>'+
   '<div class="bar'+(pct>=75?' ok':'')+'"><i style="width:'+pct+'%"></i></div>'+
   '<div class="row"><button class="btn grow" id="again">Mais 10</button>'+(wrong.length?'<button class="btn ghost grow" id="redoNow">Refazer as '+wrong.length+' erradas</button>':'')+'</div>'+
   '<button class="btn ghost small" id="back" style="width:fit-content">Mudar filtros</button>';
  $('again').onclick=function(){var p=shuffle(buildPool().map(function(q){return q.id})).slice(0,10);if(p.length)startSession(p);else{s.hidden=true;$('setup').hidden=false;renderPoolInfo()}};
  if(wrong.length)$('redoNow').onclick=function(){startSession(shuffle(wrong.map(function(r){return r.id})))};
  $('back').onclick=function(){s.hidden=true;$('setup').hidden=false;renderChips()};
  sess=null;renderAllSide();
}
function endSim(s,wrong){
  var p=sess.max?Math.round(sess.pts/sess.max*100):0,complete=sess.done===sess.list.length;
  s.innerHTML='<div class="label">Simulado no estilo da prova</div><div class="row"><span class="big">'+sess.pts+'/'+sess.max+'</span><span class="muted">pontos'+(complete?'':' (simulado encerrado antes do fim)')+' · '+(p>=60?'acima de 60%':'abaixo de 60%')+'</span></div>'+
   '<div class="bar'+(p>=60?' ok':'')+'"><i style="width:'+p+'%"></i></div>'+
   '<div class="simres">'+sess.res.map(function(r,i){var q=BYID[r.id];return '<div class="err"><span style="font-weight:600;color:'+(r.ok?'var(--ok)':'var(--bad)')+'">'+(r.ok?'✓ Correto':'✗ Incorreto')+' <span class="muted" style="font-weight:400">'+(r.ok?qPts(q):0)+'/'+qPts(q)+' pontos · '+(i+1)+'</span></span><span style="font-size:.95rem">'+fmtR(q.q)+'</span>'+(r.ok?'':'<span style="color:var(--ok);font-weight:600">Resposta: '+esc(gabText(q))+'</span>'+(q.c?'<span class="muted" style="font-size:.9rem">'+fmtR(q.c)+'</span>':''))+'</div>'}).join('')+'</div>'+
   '<div class="row"><button class="btn grow" id="simAgain">Novo simulado</button>'+(wrong.length?'<button class="btn ghost grow" id="redoNow">Refazer as '+wrong.length+' erradas</button>':'')+'</div>'+
   '<button class="btn ghost small" id="back" style="width:fit-content">Voltar ao treino</button>';
  $('simAgain').onclick=function(){startSim()};
  if(wrong.length)$('redoNow').onclick=function(){startSession(wrong.map(function(r){return r.id}))};
  $('back').onclick=function(){s.hidden=true;$('setup').hidden=false;renderChips()};
  sess=null;renderAllSide();window.scrollTo(0,0);
}
/* simulado: 4 casos (20 V/F x 4 pts) + 2 diagramas (10 pts) = 100 */
function startSim(){
  var gs=shuffle(Object.keys(CASO)).slice(0,4),ids=[];
  gs.forEach(function(g){Q.filter(function(q){return q.g===g}).forEach(function(q){ids.push(q.id)})});
  shuffle(Q.filter(function(q){return q.t==='uml'})).slice(0,2).forEach(function(q){ids.push(q.id)});
  startSession(ids,true);
}
$('startSim').onclick=function(){go('treino');startSim()};
$('start').onclick=function(){var p=shuffle(buildPool().map(function(q){return q.id})).slice(0,10);if(p.length)startSession(p)};
$('stop').onclick=function(){if(sess&&sess.done)endSession();else{sess=null;$('quiz').hidden=true;$('setup').hidden=false;renderPoolInfo()}};

/* ---------- resumos ---------- */
var openChk={},openRes={};
function resBlock(x){if(x.indexOf('```')===0)return '<li class="blk">'+codeBlock(x.slice(3))+'</li>';return '<li>'+fmtR(x)+'</li>'}
function renderChk(){
  if(!CONT){$('chklist').innerHTML='<div class="empty">Carregando resumos…</div>';return}
  var tot=0,dn=0;
  $('chklist').innerHTML=CONT.materias.map(function(m){
    var s=m.s,items=m.t,d=items.filter(function(_,i){return S.chk[s+'-'+i]}).length;tot+=items.length;dn+=d;
    var pct=Math.round(d/items.length*100);
    var trainable=Q.some(function(q){return q.s===s});
    return '<details class="sj" data-s="'+s+'"'+(openChk[s]?' open':'')+'><summary><span style="font-weight:600">'+esc(m.n)+' <span class="sjmeta">· '+esc(m.q)+'</span></span><span class="n">'+d+'/'+items.length+'</span><div class="bar ok"><i style="width:'+pct+'%"></i></div></summary><div class="items">'+
      items.map(function(t,i){var k=s+'-'+i,on=!!S.chk[k],op=!!openRes[k];
        return '<div class="top-item'+(on?' done':'')+'"><div class="top-row"><input type="checkbox" data-k="'+k+'"'+(on?' checked':'')+' aria-label="Estudado"><span class="tt">'+esc(t.t)+'</span><button class="rbtn" data-r="'+k+'" aria-expanded="'+op+'">Resumo</button></div>'+
          (op?'<div class="resumo"><ul>'+t.r.map(resBlock).join('')+'</ul></div>':'')+'</div>'}).join('')+
      (trainable?'<div style="padding:8px 14px 12px"><button class="btn ghost small" data-train="'+s+'">Treinar '+esc(SN[s])+'</button></div>':'')+'</div></details>';
  }).join('')+'<p class="muted" style="font-size:.8rem">'+esc(CONT.fonte)+'</p>';
  var p=tot?Math.round(dn/tot*100):0;$('chkTotal').textContent=p+'%';$('chkBar').style.width=p+'%';
  $('chklist').querySelectorAll('details').forEach(function(d){d.ontoggle=function(){openChk[d.dataset.s]=d.open}});
  $('chklist').querySelectorAll('input').forEach(function(c){c.onchange=function(){if(c.checked)S.chk[c.dataset.k]=1;else delete S.chk[c.dataset.k];persist();renderChk()}});
  $('chklist').querySelectorAll('[data-r]').forEach(function(b){b.onclick=function(){var k=b.dataset.r;openRes[k]=!openRes[k];renderChk()}});
  $('chklist').querySelectorAll('[data-train]').forEach(function(b){b.onclick=function(){
    cfg.subj={};cfg.subj[b.dataset.train]=1;cfg.tipo={};cfg.mode='new';
    $('modeseg').querySelectorAll('button').forEach(function(x){x.setAttribute('aria-pressed',x.dataset.mode==='new')});
    go('treino');sess=null;$('quiz').hidden=true;$('summary').hidden=true;$('setup').hidden=false;renderChips();
  }});
}

/* ---------- erros ---------- */
function wrongIds(){return Object.keys(S.ans).filter(function(id){return BYID[id]&&isWrong(id)}).sort(function(a,b){return S.ans[b][3]-S.ans[a][3]})}
function renderErr(){
  var ids=wrongIds();$('errCount').textContent=ids.length;$('redoErr').disabled=!ids.length;
  $('errlist').innerHTML=ids.length?ids.slice(0,60).map(function(id){var q=BYID[id];
    return '<div class="err"><span class="row" style="gap:6px"><span class="tag" style="width:fit-content">'+esc(SN[q.s])+'</span><span class="tipo">'+esc(TN[q.t])+'</span></span><span>'+fmtR(q.q)+'</span>'+(q.k?codeBlock(q.t==='lac'?q.k.replace(/\{\{\d+\}\}/g,'____'):q.k):'')+(q.t==='vf'?'<details class="casocode"><summary>Código do caso</summary>'+codeBlock(CASO[q.g].k)+'</details>':'')+(q.t==='uml'?'<details class="casocode"><summary>Diagrama e resposta</summary><div class="uml">'+umlSvg(DIAG[q.d])+'</div>'+codeBlock(q.o[q.a])+'</details>':'')+
      '<span style="color:var(--ok);font-weight:600">Resposta: '+esc(gabText(q))+'</span>'+(q.c?'<span class="muted" style="font-size:.9rem">'+fmtR(q.c)+'</span>':'')+'<button class="btn ghost small" style="width:fit-content;margin-top:4px" data-mk="'+esc(id)+'"'+(tgHasUser(id)?' disabled>Cartão criado':'>Criar cartão')+'</button></div>'}).join('')+(ids.length>60?'<p class="muted">Mostrando as 60 mais recentes.</p>':'')
    :'<div class="empty">Nenhum erro pendente.</div>';
  $('errlist').querySelectorAll('[data-mk]').forEach(function(b){b.onclick=function(){tgMakeFromQ(b.dataset.mk);renderErr();renderInicio()}});
}
$('redoErr').onclick=function(){var ids=shuffle(wrongIds()).slice(0,10);if(ids.length){go('treino');startSession(ids)}};

/* ---------- progresso ---------- */
function renderHist(){
  var ids=Object.keys(S.ans).filter(function(id){return BYID[id]}).sort(function(a,b){return S.ans[b][3]-S.ans[a][3]}).slice(0,30);
  $('hist').innerHTML=ids.length?ids.map(function(id){var q=BYID[id],r=S.ans[id];var d=new Date(r[3]);
    return '<div class="err"><span style="font-weight:600;color:'+(r[2]?'var(--ok)':'var(--bad)')+'">'+(r[2]?'✓ Acertou':'✗ Errou')+' <span class="muted" style="font-weight:400;font-size:.85rem">· '+esc(SN[q.s])+' · '+esc(TN[q.t])+' · '+d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})+' '+d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})+'</span></span><span style="font-size:.95rem">'+esc(q.q.length>140?q.q.slice(0,140)+'…':q.q)+'</span></div>'}).join('')
    :'<div class="empty">Você ainda não respondeu nenhuma questão.</div>';
}
function bkCode(){try{var o=Object.assign({},S);o.tg=T;return btoa(unescape(encodeURIComponent(JSON.stringify(o))))}catch(e){return ''}}
$('bkShow').onclick=function(){$('bkText').value=bkCode();$('bkMsg').textContent=''};
$('bkCopy').onclick=function(){var c=bkCode();$('bkText').value=c;
  try{navigator.clipboard.writeText(c).then(function(){$('bkMsg').textContent='Copiado.'},function(){$('bkText').select();$('bkMsg').textContent='Selecione o texto e copie.'})}catch(e){$('bkText').select();$('bkMsg').textContent='Selecione o texto e copie.'}};
$('bkLoad').onclick=function(){var t=$('bkText').value.trim();if(!t){$('bkMsg').textContent='Cole o código primeiro.';return}
  try{var v=JSON.parse(decodeURIComponent(escape(atob(t))));if(!v||typeof v.ans!=='object')throw 0;
    var tg=v.tg;delete v.tg;S=Object.assign({ans:{},chk:{},flag:{}},v);persist();
    if(tg&&typeof tg==='object'){T=Object.assign({c:{},u:[],pref:{falta:false}},tg);if(!T.pref||typeof T.pref!=='object')T.pref={falta:false};if(!Array.isArray(T.u))T.u=[];tPersist();tgIndex()}
    renderAll();go('progresso');$('bkMsg').textContent='Progresso restaurado.'}
  catch(e){$('bkMsg').textContent='Código inválido. Confira se copiou ele inteiro.'}};
function statRows(keys,names,keyOf){
  var by={};Q.forEach(function(q){var k=keyOf(q);var b=by[k]||(by[k]={n:0,seen:0,r:0,w:0});b.n++;var a=S.ans[q.id];if(a){b.seen++;b.r+=a[0];b.w+=a[1]}});
  return keys.filter(function(s){return by[s]}).map(function(s){var b=by[s];var pct=(b.r+b.w)?Math.round(b.r/(b.r+b.w)*100):null;
    return '<div class="stat"><span style="font-weight:500">'+esc(names[s])+'</span><span class="n">'+b.seen+'/'+b.n+' feitas'+(pct!==null?' · '+pct+'% acertos':'')+'</span><div class="bar'+(pct!==null&&pct>=75?' ok':'')+'"><i style="width:'+Math.round(b.seen/b.n*100)+'%"></i></div></div>'}).join('');
}
function renderProg(){renderHist();
  var all=Object.keys(S.ans).filter(function(id){return BYID[id]});
  var r=0,w=0;all.forEach(function(id){r+=S.ans[id][0];w+=S.ans[id][1]});
  $('pAns').textContent=all.length;$('pPct').textContent=(r+w)?Math.round(r/(r+w)*100)+'%':'–';
  $('pstats').innerHTML=statRows(ORDER,SN,function(q){return q.s});
  $('tstats').innerHTML=statRows(TORDER,TN,function(q){return q.t});
  var nf=Object.keys(S.flag).length;
  $('about').textContent=Q.length+' questões: '+Object.keys(CASO).length+' casos de código com 5 afirmações V/F e diagramas UML no estilo do Simulado UP2, mais exercícios das aulas 04 a 07 do Prof. Aldo Moura. Os gabaritos dos códigos foram conferidos compilando e executando em Java. As alternativas são embaralhadas a cada vez.'+(nf?' Você marcou '+nf+' gabarito(s) como suspeito(s): peça no chat para eu conferir.':'');
}
$('reset').onclick=function(){$('resetConfirm').hidden=false};
$('resetNo').onclick=function(){$('resetConfirm').hidden=true};
$('resetYes').onclick=function(){S={ans:{},chk:{},flag:{}};persist();$('resetConfirm').hidden=true;renderAll()};

/* ---------- tangochō ---------- */
var TG=null,TGERR=false,TGBY={},LT='poo-up2-tango-v1';
var T={c:{},u:[],pref:{falta:false}};
var TGV='shelf',D=null,TGNOTE='';
function tLoad(){try{var v=JSON.parse(localStorage.getItem(LT)||'null');
  if(v&&typeof v==='object'){T=Object.assign({c:{},u:[],pref:{falta:false}},v);if(!T.pref||typeof T.pref!=='object')T.pref={falta:false};if(!Array.isArray(T.u))T.u=[]}}catch(e){}}
function tPersist(){try{localStorage.setItem(LT,JSON.stringify(T))}catch(e){}}
function tgIndex(){TGBY={};
  if(TG)TG.temas.forEach(function(t){t.c.forEach(function(c){c.s=t.s;c.tema=t.id;TGBY[c.id]=c})});
  T.u.forEach(function(c){TGBY[c.id]=c})}
function tOk(id){var r=T.c[id];return !!(r&&r[2]===1)}
function tgAllIds(){var a=[];if(TG)TG.temas.forEach(function(t){t.c.forEach(function(c){a.push(c.id)})});T.u.forEach(function(c){a.push(c.id)});return a}
function tgCount(ids){var n=0;ids.forEach(function(i){if(tOk(i))n++});return n}
function tgTag(c){return c.u?'Meus cartões':(SN[c.s]||c.s)}

function tgRender(){
  if(TGV==='deck'&&D){tgDeck();return}
  if(TGV==='sum'&&D){tgSummary();return}
  tgShelf();
}
function tgShow(which){$('tgHome').parentNode.hidden=which!=='shelf';$('tgShelf').hidden=which!=='shelf';$('tgDeck').hidden=which!=='deck';$('tgSum').hidden=which!=='sum';TGV=which}

function tgShelf(){
  tgShow('shelf');
  var box=$('tgShelf');
  if(!TG){box.innerHTML='<div class="card"><h2>Tangochō</h2><div class="empty">'+(TGERR?'Não consegui carregar os cartões. Verifique a internet e abra de novo.':'Carregando cartões…')+'</div></div>';return}
  var all=tgAllIds(),done=tgCount(all),pct=all.length?Math.round(done/all.length*100):0;
  var html='<div class="card"><div class="row"><h2 class="grow">Tangochō</h2><span class="big">'+pct+'%</span></div>'+
    '<div class="bar ok"><i style="width:'+pct+'%"></i></div>'+
    '<p class="muted" style="font-size:.92rem">'+done+' de '+all.length+' cartões lembrados. Escolha uma argola. Toque no cartão para virar e depois marque <b>Lembrei</b> ou <b>Rever</b>. Os que você marcar Rever voltam ao fim da pilha.</p>'+
    '<div class="row"><button class="chip" id="tgFalta" aria-pressed="'+(!!T.pref.falta)+'">Só as que faltam</button><button class="btn grow" id="tgAll">Misturar todos os temas</button></div>'+
    (TGNOTE?'<div class="tgmsg">'+esc(TGNOTE)+'</div>':'')+'</div>';
  if(T.u.length){
    var uids=T.u.map(function(c){return c.id}),ud=tgCount(uids);
    html+='<div class="card"><div class="label">Feitos por você a partir dos erros</div><div class="shelf" style="padding:0"><button class="ringbk" data-ring="USR"><b>Meus cartões</b><span class="n">'+ud+'/'+uids.length+' lembrados</span><div class="bar ok"><i style="width:'+Math.round(ud/uids.length*100)+'%"></i></div></button></div></div>';
  }
  var by={};TG.temas.forEach(function(t){(by[t.s]||(by[t.s]=[])).push(t)});
  html+=ORDER.filter(function(s){return by[s]}).map(function(s){
    var ts=by[s],ids=[];ts.forEach(function(t){t.c.forEach(function(c){ids.push(c.id)})});
    var d=tgCount(ids),p=ids.length?Math.round(d/ids.length*100):0;
    return '<details class="sj" data-s="'+s+'"'+(openTgS[s]?' open':'')+'><summary><span style="font-weight:600">'+esc(SN[s])+' <span class="sjmeta">· '+ts.length+(ts.length>1?' argolas':' argola')+'</span></span><span class="n">'+d+'/'+ids.length+'</span><div class="bar ok"><i style="width:'+p+'%"></i></div></summary>'+
      '<div class="sjtools"><button class="btn ghost small" data-mix="'+s+'">Misturar '+esc(SN[s])+'</button></div>'+
      '<div class="shelf">'+ts.map(function(t){var tid=t.c.map(function(c){return c.id}),td=tgCount(tid);
        return '<button class="ringbk" data-ring="'+t.id+'"><b>'+esc(t.t)+'</b><span class="n">'+td+'/'+tid.length+' lembrados</span><div class="bar ok"><i style="width:'+Math.round(td/tid.length*100)+'%"></i></div></button>'}).join('')+'</div></details>';
  }).join('');
  html+='<div class="card"><button class="linkbtn" id="tgReset" style="width:fit-content">Zerar progresso do Tangochō</button><div id="tgResetBox" hidden class="row"><span class="grow">Apagar o que você marcou como lembrado ou rever? Os cartões que você criou continuam.</span><button class="btn small" id="tgResetYes">Apagar</button><button class="btn ghost small" id="tgResetNo">Cancelar</button></div></div>';
  box.innerHTML=html;
  $('tgFalta').onclick=function(){T.pref.falta=!T.pref.falta;tPersist();TGNOTE='';tgShelf()};
  $('tgAll').onclick=function(){tgStart(tgAllIds(),'Todos os temas misturados',true)};
  box.querySelectorAll('details').forEach(function(d){d.ontoggle=function(){openTgS[d.dataset.s]=d.open}});
  box.querySelectorAll('[data-mix]').forEach(function(b){b.onclick=function(){var s=b.dataset.mix,ids=[];
    TG.temas.forEach(function(t){if(t.s===s)t.c.forEach(function(c){ids.push(c.id)})});tgStart(ids,'Misturado: '+SN[s],true)}});
  box.querySelectorAll('[data-ring]').forEach(function(b){b.onclick=function(){var r=b.dataset.ring,ids=[],title='';
    if(r==='USR'){ids=T.u.map(function(c){return c.id});title='Meus cartões'}
    else TG.temas.forEach(function(t){if(t.id===r){ids=t.c.map(function(c){return c.id});title=SN[t.s]+': '+t.t}});
    tgStart(ids,title,false)}});
  $('tgReset').onclick=function(){$('tgResetBox').hidden=false};
  $('tgResetNo').onclick=function(){$('tgResetBox').hidden=true};
  $('tgResetYes').onclick=function(){T.c={};tPersist();TGNOTE='';tgShelf();renderInicio()};
}
var openTgS={};

function tgBuildQueue(){
  var q=D.scope.filter(function(i){return TGBY[i]&&(!T.pref.falta||!tOk(i))});
  if(D.shuf)shuffle(q);
  D.queue=q;D.total=q.length;D.flipped=false;D.seen=false;D.hist=[];
}
function tgStart(ids,title,shuf){
  D={title:title,scope:ids.slice(),shuf:!!shuf,queue:[],total:0,ok:0,rev:0,flipped:false,seen:false,anim:false,hist:[]};
  tgBuildQueue();
  if(!D.queue.length){var t=title;D=null;TGNOTE='Nada falta em "'+t+'". Desligue "Só as que faltam" para rever tudo.';tgShelf();window.scrollTo(0,0);return}
  TGNOTE='';tgShow('deck');tgDeck();window.scrollTo(0,0);
}
function tgDeck(){
  tgShow('deck');
  var id=D.queue[0],c=TGBY[id],nx=D.queue[1]?TGBY[D.queue[1]]:null,left=D.queue.length;
  var pct=D.total?Math.round((D.total-left)/D.total*100):0;
  var back='<div class="label">Resposta</div><p class="bt">'+fmtR(c.r)+'</p>'+(c.f?'<span class="src">Fonte: '+esc(c.f)+'</span>':'');
  $('tgDeck').innerHTML=
    '<div class="row"><button class="btn ghost small back" id="tgBack">‹ Estante</button><span class="grow"></span><span class="muted" style="font-size:.9rem;font-variant-numeric:tabular-nums">restam '+left+'</span></div>'+
    '<div><div class="label">'+esc(D.title)+'</div><div class="bar ok" style="margin-top:6px"><i style="width:'+pct+'%"></i></div></div>'+
    '<div class="row"><button class="chip" id="tgFilt" aria-pressed="'+(!!T.pref.falta)+'">Só as que faltam</button><button class="btn ghost small" id="tgShuf">Embaralhar</button></div>'+
    '<div class="stack">'+
      '<div class="under u2"></div>'+
      '<div class="under u1">'+(nx?'<div class="uf"><span class="label">'+esc(tgTag(nx))+' · Pergunta</span><p class="bt">'+fmtR(nx.p)+'</p></div>':'')+'</div>'+
      '<div class="page" id="tgPage"><div class="flip'+(D.flipped?' is-flipped':'')+'" id="tgFlip" role="button" tabindex="0" aria-label="Virar o cartão">'+
        '<div class="face front" id="tgFront"'+(D.flipped?' aria-hidden="true"':'')+'><span class="label">'+esc(tgTag(c))+' · Pergunta</span><p class="bt">'+fmtR(c.p)+'</p></div>'+
        '<div class="face verso" id="tgBackFace"'+(D.flipped?'':' aria-hidden="true"')+'>'+back+'</div>'+
      '</div></div>'+
      '<span class="ring r1"></span><span class="ring r2"></span>'+
    '</div>'+
    '<p class="muted" id="tgHint" style="font-size:.9rem;text-align:center">'+(D.seen?'Como foi?':'Toque no cartão para ver a resposta.')+'</p>'+
    '<div class="row"><button class="btn ghost grow" id="tgNo"'+(D.seen?'':' disabled')+'>Rever</button><button class="btn okb grow" id="tgYes"'+(D.seen?'':' disabled')+'>Lembrei</button></div>'+
    '<div class="row" style="justify-content:space-between"><button class="linkbtn" id="tgUndo"'+(D.hist.length?'':' hidden')+'>Desfazer a última marcação</button>'+(c.u?'<button class="linkbtn" id="tgDel">Excluir este cartão</button>':'<span></span>')+'</div>';
  $('tgBack').onclick=function(){D=null;TGNOTE='';tgShelf();renderInicio();window.scrollTo(0,0)};
  $('tgFilt').onclick=function(){T.pref.falta=!T.pref.falta;tPersist();tgBuildQueue();
    if(!D.queue.length){tgSummary();return}tgDeck()};
  $('tgShuf').onclick=function(){if(D.anim)return;shuffle(D.queue);D.flipped=false;D.seen=false;tgDeck()};
  var fl=$('tgFlip');
  fl.onclick=tgFlip;
  fl.onkeydown=function(e){if(e.key==='Enter'||e.key===' '||e.key==='Spacebar'){e.preventDefault();tgFlip()}};
  $('tgYes').onclick=function(){tgMark(true)};
  $('tgNo').onclick=function(){tgMark(false)};
  $('tgUndo').onclick=tgUndo;
  if(c.u)$('tgDel').onclick=function(){tgDelUser(c.id)};
}
function tgFlip(){
  if(!D||D.anim)return;
  D.flipped=!D.flipped;if(D.flipped)D.seen=true;
  $('tgFlip').classList.toggle('is-flipped',D.flipped);
  $('tgFront').setAttribute('aria-hidden',D.flipped?'true':'false');$('tgBackFace').setAttribute('aria-hidden',D.flipped?'false':'true');
  $('tgNo').disabled=!D.seen;$('tgYes').disabled=!D.seen;
  $('tgHint').textContent=D.seen?'Como foi?':'Toque no cartão para ver a resposta.';
}
function tgMark(ok){
  if(!D||!D.seen||D.anim)return;
  var id=D.queue[0],prev=T.c[id]?T.c[id].slice():null,r=T.c[id]||[0,0,0,0];
  D.hist.push({id:id,prev:prev,ok:ok,q:D.queue.slice()});
  T.c[id]=[r[0]+(ok?1:0),r[1]+(ok?0:1),ok?1:0,Date.now()];tPersist();
  if(ok)D.ok++;else D.rev++;
  D.anim=true;
  function done(){
    D.anim=false;D.queue.shift();if(!ok)D.queue.push(id);
    D.flipped=false;D.seen=false;
    if(!D.queue.length)tgSummary();else tgDeck();
    window.scrollTo(0,0);
  }
  var pg=$('tgPage');
  if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches){done();return}
  var fired=false;function once(){if(fired)return;fired=true;done()}
  pg.addEventListener('animationend',once);pg.classList.add('turn');setTimeout(once,800);
}
function tgUndo(){
  if(!D||D.anim||!D.hist.length)return;
  var h=D.hist.pop();
  if(h.prev)T.c[h.id]=h.prev;else delete T.c[h.id];
  tPersist();if(h.ok)D.ok--;else D.rev--;
  D.queue=h.q.slice();D.flipped=false;D.seen=false;tgDeck();
}
function tgDelUser(id){
  T.u=T.u.filter(function(c){return c.id!==id});delete T.c[id];tPersist();tgIndex();
  D.scope=D.scope.filter(function(i){return i!==id});D.queue=D.queue.filter(function(i){return i!==id});D.flipped=false;D.seen=false;
  if(!D.queue.length)tgSummary();else tgDeck();
}
function tgSummary(){
  tgShow('sum');
  var left=D.scope.filter(function(i){return TGBY[i]&&!tOk(i)}).length;
  var s=$('tgSum');
  s.innerHTML='<div class="label">Fim da pilha</div><h2>'+esc(D.title)+'</h2>'+
    '<div class="row" style="gap:24px"><div><div class="label">Lembrei</div><span class="big">'+D.ok+'</span></div><div><div class="label">Rever</div><span class="big">'+D.rev+'</span></div><div><div class="label">Ainda faltam</div><span class="big">'+left+'</span></div></div>'+
    '<div class="row"><button class="btn grow" id="tgAgain"'+(left?'':' disabled')+'>Estudar as que faltam</button><button class="btn ghost grow" id="tgShelfBtn">Voltar à estante</button></div>';
  $('tgAgain').onclick=function(){var ids=D.scope.filter(function(i){return TGBY[i]&&!tOk(i)}),t=D.title,sh=D.shuf;T.pref.falta=true;tPersist();tgStart(ids,t,sh)};
  $('tgShelfBtn').onclick=function(){D=null;TGNOTE='';tgShelf();renderInicio();window.scrollTo(0,0)};
  window.scrollTo(0,0);
}

/* criar cartão a partir de uma questão errada */
function tgHasUser(qid){return T.u.some(function(c){return c.id==='u-'+qid})}
function tgMakeFromQ(qid){
  var q=BYID[qid];if(!q||tgHasUser(qid))return;
  var pre=q.t==='ce'?'Certo ou errado? ':q.t==='vf'?'Verdadeiro ou falso? ':(q.t==='lin'?'Onde está o erro? ':(q.t==='lac'?'Complete: ':''));
  T.u.push({id:'u-'+qid,u:1,s:q.s,p:pre+q.q,r:'Resposta: '+gabText(q)+(q.c?' '+q.c:''),f:q.f||''});
  tPersist();tgIndex();
}
function renderInicio(){
  var n=Object.keys(S.ans).filter(function(id){return BYID[id]}).length,e=wrongIds().length;
  $('stQ').textContent=Q.length?(n+' de '+Q.length+' respondidas · '+e+' no caderno de erros'):'';
  if(TG){var all=tgAllIds();$('stT').textContent=tgCount(all)+' de '+all.length+' cartões lembrados'}else $('stT').textContent='';
  $('stM').textContent=MP?(MP.mapas.length+' assuntos · '+MP.mapas.reduce(function(a,m){return a+m.r.length},0)+' ramos'):'';
  if(CONT){var tot=0,dn=0;CONT.materias.forEach(function(m){m.t.forEach(function(_,i){tot++;if(S.chk[m.s+'-'+i])dn++})});$('stR').textContent=dn+' de '+tot+' tópicos marcados como estudados'}
}

/* ---------- mapas ---------- */
var MP=null,MPERR=false,MPBY={},MPS='HER',MPO={};
var PN={alta:'Alta',media:'Média',baixa:'Baixa'},PC={alta:'pa',media:'pm',baixa:'pb'};
function mpTema(id){var r=null;if(TG)TG.temas.forEach(function(t){if(t.id===id)r=t});return r}
function mpRender(){
  var box=$('mpBody');
  if(!MP||!TG){box.innerHTML='<div class="card"><div class="empty">'+((MPERR||TGERR)?'Não consegui carregar os mapas. Verifique a internet e abra de novo.':'Carregando mapas…')+'</div></div>';return}
  var falta=!!T.pref.mpFalta,m=MPBY[MPS],all=[],done=0;
  m.r.forEach(function(b){var t=mpTema(b.t);if(t)t.c.forEach(function(c){all.push(c.id);if(tOk(c.id))done++})});
  var chips=Object.keys(MPBY).map(function(k){return '<button class="chip" data-ms="'+k+'" aria-pressed="'+(k===MPS)+'">'+esc(SN[k]||k)+'</button>'}).join('');
  var h='<div class="chips">'+chips+'</div>'+
    '<div class="mpc"><span class="label">Mapa mental</span><b>'+esc(SN[MPS]||MPS)+'</b><span>'+done+' de '+all.length+' cartões lembrados · '+m.r.length+' ramos</span><div class="bar ok"><i style="width:'+(all.length?Math.round(done/all.length*100):0)+'%"></i></div></div>'+
    '<div class="row"><button class="chip" id="mpFalta" aria-pressed="'+falta+'">Só o que falta</button></div>'+
    '<div class="mpleg"><span><i style="background:var(--accent)"></i>Prioridade alta</span><span><i style="background:var(--ink)"></i>Média</span><span><i style="background:var(--muted)"></i>Baixa</span></div>'+
    '<div class="mpt">';
  var shown=0;
  m.r.forEach(function(b){
    var t=mpTema(b.t);if(!t)return;
    var ids=t.c.map(function(c){return c.id}),d=tgCount(ids);
    if(falta&&d===ids.length)return;
    shown++;
    var leaves=t.c.filter(function(c){return !falta||!tOk(c.id)}).map(function(c){
      return '<details class="mpl"><summary><span class="dot'+(tOk(c.id)?' ok':'')+'" title="'+(tOk(c.id)?'Lembrado':'Falta')+'"></span><span>'+fmtR(c.p)+'</span></summary><div class="mpans">'+fmtR(c.r)+(c.f?'<span class="src">Fonte: '+esc(c.f)+'</span>':'')+'</div></details>'}).join('');
    h+='<details class="mpb '+PC[b.p]+'" data-t="'+b.t+'"'+(MPO[b.t]?' open':'')+'><summary><span class="tag" style="width:fit-content">Prioridade '+PN[b.p]+'</span><b>'+esc(t.t)+'</b><span class="mpn">'+d+'/'+ids.length+' lembrados</span><div class="bar ok"><i style="width:'+Math.round(d/ids.length*100)+'%"></i></div></summary>'+
      '<div class="mpbody"><div class="mpwhy">'+esc(b.n)+'</div>'+leaves+'<button class="btn small" data-st="'+b.t+'">Estudar este ramo no Tangochō</button></div></details>';
  });
  if(!shown)h+='<div class="card"><div class="empty">Nada falta neste mapa. Desligue "Só o que falta" para rever tudo.</div></div>';
  h+='</div><p class="muted" style="font-size:.85rem">'+esc(MP.nota)+'</p>';
  box.innerHTML=h;
  box.querySelectorAll('[data-ms]').forEach(function(b){b.onclick=function(){MPS=b.dataset.ms;mpRender();window.scrollTo(0,0)}});
  $('mpFalta').onclick=function(){T.pref.mpFalta=!T.pref.mpFalta;tPersist();mpRender()};
  box.querySelectorAll('details.mpb').forEach(function(d){d.ontoggle=function(){MPO[d.dataset.t]=d.open}});
  box.querySelectorAll('[data-st]').forEach(function(b){b.onclick=function(e){e.preventDefault();var t=mpTema(b.dataset.st);if(!t)return;go('tango');tgStart(t.c.map(function(c){return c.id}),SN[t.s]+': '+t.t,false)}});
}
function mpIndex(){MPBY={};if(MP)MP.mapas.forEach(function(m){MPBY[m.s]=m})}

/* ---------- navegação ---------- */
var QVIEWS=['treino','conteudos','erros','progresso'];
var VIEWS=['inicio','tango','mapas'].concat(QVIEWS);
function go(v){
  if(VIEWS.indexOf(v)<0)v='inicio';
  VIEWS.forEach(function(x){$('v-'+x).hidden=x!==v});
  var inQ=QVIEWS.indexOf(v)>=0;
  $('hdrQ').hidden=!inQ;$('tabs').hidden=!inQ;document.body.setAttribute('data-area',inQ?'q':v);
  $('tabs').querySelectorAll('button').forEach(function(b){if(b.dataset.v===v)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
  if(v==='inicio')renderInicio();if(v==='tango')tgRender();if(v==='mapas')mpRender();
  if(v==='conteudos')renderChk();if(v==='erros')renderErr();if(v==='progresso')renderProg();
  if(v==='treino'&&!sess)renderPoolInfo();
  try{if(location.hash!=='#'+v)history.replaceState(null,'','#'+v)}catch(e){}
  window.scrollTo(0,0);
}
$('tabs').querySelectorAll('button').forEach(function(b){b.onclick=function(){go(b.dataset.v)}});
window.addEventListener('hashchange',function(){go(location.hash.slice(1))});
function renderBadges(){var n=wrongIds().length;var d=$('errDot');d.hidden=!n;d.textContent=n>99?'99+':n}
function renderAllSide(){renderBadges();renderPoolInfo()}
function renderAll(){renderChips();renderBadges();var v=location.hash.slice(1);go(VIEWS.indexOf(v)>=0?v:'inicio')}

/* ---------- início ---------- */
load();tLoad();tgIndex();
$('goTango').onclick=function(){go('tango')};$('goMapas').onclick=function(){go('mapas')};$('mpHome').onclick=function(){go('inicio')};
$('goQuest').onclick=function(){go('treino')};$('goRes').onclick=function(){go('conteudos')};
$('toInicio').onclick=function(){go('inicio')};$('tgHome').onclick=function(){if(TGV!=='shelf'){D=null;TGNOTE='';TGV='shelf'}go('inicio')};
go(location.hash.slice(1));
['gesturestart','gesturechange'].forEach(function(e){document.addEventListener(e,function(ev){ev.preventDefault()},{passive:false})});
try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist()}catch(e){}
fetch('questoes.json').then(function(r){return r.json()}).then(function(d){setData(d);renderAll()})
 .catch(function(){document.querySelector('.wrap').insertAdjacentHTML('beforeend','<div class="card"><b>Não consegui carregar as questões.</b><span class="muted">Verifique a internet e abra de novo.</span></div>')});
fetch('conteudos.json').then(function(r){return r.json()}).then(function(c){CONT=c;renderInicio();if(!$('v-conteudos').hidden)renderChk()}).catch(function(){});
fetch('cartoes.json').then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){TG=d;tgIndex();if(!$('v-tango').hidden)tgRender();if(!$('v-mapas').hidden)mpRender();renderInicio()}).catch(function(){TGERR=true;if(!$('v-tango').hidden)tgRender();if(!$('v-mapas').hidden)mpRender()});
fetch('mapas.json').then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){MP=d;mpIndex();renderInicio();if(!$('v-mapas').hidden)mpRender()}).catch(function(){MPERR=true;if(!$('v-mapas').hidden)mpRender()});
if('serviceWorker' in navigator&&location.protocol.indexOf('http')===0){try{var had=navigator.serviceWorker.controller,rl=false;navigator.serviceWorker.addEventListener('controllerchange',function(){if(had&&!rl){rl=true;location.reload()}});navigator.serviceWorker.register('sw.js').then(function(r){r.update&&r.update()}).catch(function(){})}catch(e){}}
