
(function(){
  var spend=document.getElementById('spend'), spendOut=document.getElementById('spendOut');
  var saveOut=document.getElementById('saveOut'), pctOut=document.getElementById('pctOut'), moOut=document.getElementById('moOut'), bar=document.getElementById('saveBar');
  var form=document.getElementById('cloudCalcForm');
  function fmt(n){ if(n>=1000) return '$'+(Math.round(n/100)/10).toFixed(1).replace(/\.0$/,'')+'k'; return '$'+Math.round(n); }
  function syncPills(){ document.querySelectorAll('.opt-pill').forEach(function(p){ var i=p.querySelector('input'); p.classList.toggle('sel', i.checked); }); }
  function compute(){
    var s=parseFloat(spend.value);
    spendOut.innerHTML=fmt(s)+'<span style="font-size:.4em;font-weight:500"> / mo</span>';
    var lo=0,hi=0;
    document.querySelectorAll('[data-group=waste] input:checked').forEach(function(i){ lo+=parseFloat(i.dataset.lo); hi+=parseFloat(i.dataset.hi); });
    /* indicative optimisation band — capped so it stays credible */
    lo=Math.min(lo,35); hi=Math.min(hi,55);
    var annual=s*12;
    var saveLo=annual*lo/100, saveHi=annual*hi/100;
    var moLo=s*lo/100, moHi=s*hi/100;
    saveOut.textContent=fmt(saveLo)+' – '+fmt(saveHi);
    pctOut.textContent=(lo? lo:0)+' – '+hi+'%';
    moOut.textContent='~'+fmt(moLo)+' – '+fmt(moHi);
    bar.style.width=Math.min(100,hi*1.8)+'%';
    var cloud=document.querySelector('[name=cloud]:checked').value;
    if(window.scsTrack) window.scsTrack('cloud_savings_estimate',{spend:s,lo:lo,hi:hi,cloud:cloud});
    return {spend:s,lo:lo,hi:hi,saveLo:Math.round(saveLo),saveHi:Math.round(saveHi),cloud:cloud};
  }
  document.querySelectorAll('.calc-grid input').forEach(function(i){ i.addEventListener('input',function(){syncPills();compute();}); i.addEventListener('change',function(){syncPills();compute();}); });
  syncPills(); compute();

  form.onsubmit=function(e){
    e.preventDefault();
    var name=document.getElementById('cName'), email=document.getElementById('cEmail');
    var ok=true;
    if(!name.value.trim()){name.classList.add('err');ok=false}else name.classList.remove('err');
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value.trim())){email.classList.add('err');ok=false}else email.classList.remove('err');
    if(!ok)return;
    var est=compute();
    var b=form.querySelector('button'); b.textContent='Sending…'; b.disabled=true;
    var payload={kind:'cloud_calc',name:name.value.trim(),email:email.value.trim(),
      message:'Cloud cost calculator — '+est.cloud+', ~$'+est.spend+'/mo spend, indicative savings '+est.lo+'–'+est.hi+'% ($'+est.saveLo+'–$'+est.saveHi+'/yr).'};
    Object.assign(payload,(window.scsUTM&&window.scsUTM.get())||{});fetch('https://9cjt6qwy71.execute-api.ap-south-1.amazonaws.com',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}).catch(function(){}).then(function(){
      form.querySelectorAll('input,button,label,p').forEach(function(el){el.style.display='none'});
      document.getElementById('calcSuccess').style.display='block';
    });
  };
})();
