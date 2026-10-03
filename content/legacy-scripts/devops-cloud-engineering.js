
/* FAQ accordion */
document.querySelectorAll('.faq-q').forEach(function(b){b.onclick=function(){var f=b.parentElement,open=f.classList.contains('open');document.querySelectorAll('.faq').forEach(function(x){x.classList.remove('open')});if(!open)f.classList.add('open')}});

/* Interactive architecture diagram */
(function(){
  var nodes=document.querySelectorAll('.arch-node'),
      k=document.getElementById('archK'),t=document.getElementById('archT'),d=document.getElementById('archD');
  function set(n){nodes.forEach(function(x){x.classList.remove('on')});n.classList.add('on');k.textContent=n.dataset.k;t.textContent=n.dataset.t;d.innerHTML=n.dataset.d;}
  nodes.forEach(function(n){n.addEventListener('click',function(){set(n)});n.addEventListener('mouseenter',function(){set(n)});});
})();

/* Illustrative observability dashboard */
(function(){
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var spark=document.getElementById('spark');
  if(spark){
    var vals=[];for(var i=0;i<14;i++){vals.push(6+Math.round(Math.abs(Math.sin(i*1.3)*9)+Math.random()*4));}
    vals.forEach(function(v){var s=document.createElement('span');s.style.height=Math.min(100,v*6)+'%';s.title=v+' deploys';spark.appendChild(s);});
  }
  if(reduce)return;
  var stages=document.querySelectorAll('#pipe .pipe-stage'), idx=2;
  var df=document.getElementById('m-df');
  var tick=setInterval(function(){
    /* advance the pipeline stage that's "running" */
    stages.forEach(function(s){s.classList.remove('run')});
    idx=(idx+1)%stages.length;
    for(var i=0;i<stages.length;i++){stages[i].classList.toggle('done',i<idx);}
    stages[idx].classList.add('run');
    if(idx===0){ /* a fresh deploy completed — nudge the counter + sparkline */
      var n=12+Math.floor(Math.random()*6); if(df)df.innerHTML=n+'<span style="font-size:.5em"> / day</span>';
      if(spark&&spark.lastChild){var bars=spark.children;for(var j=0;j<bars.length-1;j++){bars[j].style.height=bars[j+1].style.height;}bars[bars.length-1].style.height=Math.min(100,(6+Math.floor(Math.random()*12))*6)+'%';}
    }
  },2400);
  /* flip the 'payments' warning dot back to healthy after a bit */
  var warn=document.getElementById('svc-warn');
  if(warn)setTimeout(function(){warn.classList.remove('warn');},6000);
  window.addEventListener('pagehide',function(){clearInterval(tick);});
})();
