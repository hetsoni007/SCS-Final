
(function(){
  var RATE_LO=1800, RATE_HI=3200; // indicative blended $/week — adjust to your real pricing
  var form=document.getElementById('calcLeadForm');
  var costOut=document.getElementById('costOut'), weeksOut=document.getElementById('weeksOut'), tags=document.getElementById('scopeTags');
  function k(n){ return '$'+Math.round(n/1000)+'k'; }
  function syncPills(){ document.querySelectorAll('.opt-pill').forEach(function(p){ var i=p.querySelector('input'); p.classList.toggle('sel', i.checked); }); }
  function compute(){
    var base=parseFloat(document.querySelector('[name=stage]:checked').dataset.base);
    var pMult=parseFloat(document.querySelector('[name=platform]:checked').dataset.mult);
    var dMult=parseFloat(document.querySelector('[name=design]:checked').dataset.mult);
    var bAdd=parseFloat(document.querySelector('[name=backend]:checked').dataset.add);
    var feat=0, chosen=[];
    document.querySelectorAll('[data-group=features] input:checked').forEach(function(i){
      feat+=parseFloat(i.dataset.weeks);
      chosen.push(i.parentElement.childNodes[1].textContent.trim());
    });
    var weeks=Math.round((base+feat+bAdd)*pMult*dMult);
    if(weeks<3)weeks=3;
    var lo=Math.round(weeks*RATE_LO/1000)*1000, hi=Math.round(weeks*RATE_HI/1000)*1000;
    costOut.textContent=k(lo)+' – '+k(hi);
    weeksOut.textContent='~'+weeks+' weeks';
    var stageLbl=document.querySelector('[name=stage]:checked').parentElement.childNodes[1].textContent.trim();
    var platLbl=document.querySelector('[name=platform]:checked').parentElement.childNodes[1].textContent.trim();
    tags.innerHTML='';
    [platLbl,stageLbl].concat(chosen).slice(0,8).forEach(function(t){ var s=document.createElement('span'); s.textContent=t; tags.appendChild(s); });
    if(window.scsTrack) window.scsTrack('calculator_estimate',{weeks:weeks,low:lo,high:hi});
    return {weeks:weeks,lo:lo,hi:hi,scope:chosen.join(', '),stage:stageLbl,platform:platLbl,design:document.querySelector('[name=design]:checked').value,backend:document.querySelector('[name=backend]:checked').value};
  }
  document.querySelectorAll('.calc-grid input').forEach(function(i){ i.addEventListener('change',function(){syncPills();compute();}); });
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
    var payload={kind:'calculator',name:name.value.trim(),email:email.value.trim(),
      message:'App cost estimate — '+est.platform+', '+est.stage+', ~'+est.weeks+' weeks, $'+est.lo+'–$'+est.hi+'. Features: '+(est.scope||'core only')+'. Design: '+est.design+', backend: '+est.backend+'.'};
    Object.assign(payload,(window.scsUTM&&window.scsUTM.get())||{});fetch('https://9cjt6qwy71.execute-api.ap-south-1.amazonaws.com',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}).catch(function(){}).then(function(){
      form.querySelectorAll('input,button,label,p').forEach(function(el){el.style.display='none'});
      document.getElementById('calcSuccess').style.display='block';
    });
  };
})();
