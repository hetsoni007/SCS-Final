
document.querySelectorAll('.faq-q').forEach(function(b){b.onclick=function(){var f=b.parentElement,open=f.classList.contains('open');document.querySelectorAll('.faq').forEach(function(x){x.classList.remove('open')});if(!open)f.classList.add('open')}});
window.__BANDS=[{min:90,t:'Strong position.',d:'You are ahead of most fintech apps we see. Keep the annual VAPT and record-retention discipline current, and re-run this whenever you add a new payment flow or lending feature.'},{min:70,t:'Solid, with real gaps.',d:'The foundations are there. Close the remaining controls in order — confirm your RBI category, then verify data localisation and audit logging — and get the licensing questions in front of a fintech compliance lawyer soon.'},{min:40,t:'Meaningful work ahead.',d:'Several unchecked items here are infrastructure decisions, not paperwork — data localisation and audit logging in particular are expensive to retrofit. Get a compliance lawyer and a technical audit involved before you scale further.'},{min:0,t:'Start with your RBI category.',d:'A low score here is fixable, but not on a short timeline if you are already processing real transactions. First establish exactly which RBI category applies to you, then get a qualified fintech lawyer involved before building further.'}];

(function(){
  var t=document.getElementById('dt'); if(!t) return;
  var items=t.querySelectorAll('.ci'), out=t.querySelector('.out'), bar=t.querySelector('.prog>i');
  var BANDS=window.__BANDS;
  function upd(){
    var done=t.querySelectorAll('.ci.on').length, n=items.length;
    var pct=Math.round(done/n*100);
    bar.style.width=pct+'%';
    var band=BANDS.find(function(b){return pct>=b.min;});
    out.innerHTML='<div class="score">'+pct+'<span style="font-size:.42em">/100</span></div>'+
      '<p style="margin:10px 0 0"><b>'+band.t+'</b></p>'+
      '<p style="font-size:14px;color:var(--t2);line-height:1.65;margin:8px 0 0">'+band.d+'</p>'+
      '<p style="font-size:13px;color:var(--t3);margin:10px 0 0">'+done+' of '+n+' controls in place</p>';
  }
  items.forEach(function(el){
    el.onclick=function(){ el.classList.toggle('on'); upd(); };
    el.onkeydown=function(e){ if(e.key===' '||e.key==='Enter'){e.preventDefault(); el.click();} };
    el.tabIndex=0; el.setAttribute('role','checkbox'); el.setAttribute('aria-checked','false');
  });
  var mo=new MutationObserver(function(m){m.forEach(function(r){
    r.target.setAttribute('aria-checked', r.target.classList.contains('on')?'true':'false');});});
  items.forEach(function(el){mo.observe(el,{attributes:true,attributeFilter:['class']});});
  upd();
})();

