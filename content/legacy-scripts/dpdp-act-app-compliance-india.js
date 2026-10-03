
document.querySelectorAll('.faq-q').forEach(function(b){b.onclick=function(){var f=b.parentElement,open=f.classList.contains('open');document.querySelectorAll('.faq').forEach(function(x){x.classList.remove('open')});if(!open)f.classList.add('open')}});
window.__BANDS=[{min:90,t:'Strong position.',d:'You are ahead of most teams we see. Keep the data map current as you add features and vendors, and re-run this whenever a new integration starts touching personal data.'},{min:70,t:'Solid, with real gaps.',d:'The foundations are there. Close the remaining controls in order — data map first, then consent capture, then withdrawal and deletion — and you will be in good shape well before enforcement.'},{min:40,t:'Meaningful work ahead.',d:'You have started, but the unchecked items include things that take engineering time rather than paperwork. Sequence them: map your data, fix consent capture so the problem stops growing, then build withdrawal and deletion.'},{min:0,t:'Start with the data map.',d:'A low score here is common and fixable, but not on a short timeline. Begin by documenting every field you collect and where it flows — every other control depends on that being right, and it is usually faster than teams expect.'}];

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

