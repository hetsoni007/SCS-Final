
(function(){
  var ring=document.getElementById('ring'), scoreOut=document.getElementById('scoreOut'),
      bandOut=document.getElementById('bandOut'), bandSub=document.getElementById('bandSub'), form=document.getElementById('devopsAssessForm');
  var CIRC=402, MAX=24;
  var bands=[
    {min:21,nm:'Elite',sub:"Deploying on demand with strong automation, observability and recovery. We can help you push cost efficiency and reliability even further."},
    {min:15,nm:'Established',sub:"Solid foundations. The biggest gains now are in deeper automation, full observability and tighter cost control."},
    {min:8,nm:'Developing',sub:"You've started automating, but manual steps and gaps still slow you down. A focused DevOps Foundations engagement would move the needle fast."},
    {min:0,nm:'Foundational',sub:"Most delivery is still manual — which means big upside. CI/CD, infrastructure-as-code and observability would cut risk and free up your team."}
  ];
  function syncPills(){ document.querySelectorAll('.opt-pill').forEach(function(p){ var i=p.querySelector('input'); p.classList.toggle('sel', i.checked); }); }
  function compute(){
    var s=0;
    document.querySelectorAll('.opt-col input:checked').forEach(function(i){ s+=parseFloat(i.dataset.pts); });
    scoreOut.textContent=s;
    ring.style.strokeDashoffset=CIRC*(1-s/MAX);
    var b=bands.find(function(x){return s>=x.min;});
    bandOut.textContent=b.nm; bandSub.textContent=b.sub;
    if(window.scsTrack) window.scsTrack('devops_assessment_score',{score:s,band:b.nm});
    return {score:s,band:b.nm};
  }
  document.querySelectorAll('.opt-col input').forEach(function(i){ i.addEventListener('change',function(){syncPills();compute();}); });
  syncPills(); compute();

  form.onsubmit=function(e){
    e.preventDefault();
    var name=document.getElementById('aName'), email=document.getElementById('aEmail');
    var ok=true;
    if(!name.value.trim()){name.classList.add('err');ok=false}else name.classList.remove('err');
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value.trim())){email.classList.add('err');ok=false}else email.classList.remove('err');
    if(!ok)return;
    var est=compute();
    var b=form.querySelector('button'); b.textContent='Sending…'; b.disabled=true;
    var payload={kind:'assessment',name:name.value.trim(),email:email.value.trim(),
      message:'DevOps maturity assessment — score '+est.score+'/24, band: '+est.band+'.'};
    Object.assign(payload,(window.scsUTM&&window.scsUTM.get())||{});fetch('https://9cjt6qwy71.execute-api.ap-south-1.amazonaws.com',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}).catch(function(){}).then(function(){
      form.querySelectorAll('input,button,label,p').forEach(function(el){el.style.display='none'});
      document.getElementById('calcSuccess').style.display='block';
    });
  };
})();
