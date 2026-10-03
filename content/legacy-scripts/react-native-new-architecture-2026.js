
document.querySelectorAll('.faq-q').forEach(function(b){b.onclick=function(){var f=b.parentElement,open=f.classList.contains('open');document.querySelectorAll('.faq').forEach(function(x){x.classList.remove('open')});if(!open)f.classList.add('open')}});
window.__KEYS=['urgent','soon','fine'];
window.__R={urgent:{label:'Migrate now',name:'This needs to move to the top of the roadmap',why:'Between the version you are on and the shape of your dependencies, you are carrying real risk today — either you cannot get security or bug fixes without upgrading, or an upgrade is going to force this migration on you with far less control over timing than you have right now.',note:'Start with the native module audit this week, even before you touch a release plan. It is the one step that tells you the real size of the job.'},soon:{label:'Plan it for this quarter',name:'Not an emergency, but don’t let it drift',why:'You have some runway, but the gap between where you are and where React Native is heading is widening every release. Doing this on your own schedule, with time to audit dependencies properly, is a materially easier project than doing it under pressure later.',note:'Put a native module audit on the roadmap now, even if the migration itself waits a sprint or two.'},fine:{label:'You’re in reasonable shape',name:'No immediate action needed',why:'Either you are already on the New Architecture or close to a version where the jump is small. Keep an eye on your dependency versions as you update React Native, since New Architecture support is uneven across the ecosystem.',note:'Re-run this check whenever you plan your next React Native upgrade.'}};
window.__Q=[{q:'What React Native version is your app on?',a:[{t:'0.82 or later',s:'New Architecture only — already migrated',w:{fine:3}},{t:'0.76 – 0.81',s:'New Architecture available, opt-in or default',w:{soon:2,fine:1}},{t:'0.70 – 0.75',w:{urgent:2,soon:1}},{t:'Older than 0.70, or not sure',w:{urgent:3}}]},{q:'How many custom or third-party native modules does your app use?',a:[{t:'Almost none — mostly JavaScript',w:{fine:2,soon:1}},{t:'A handful of well-maintained libraries',w:{soon:2}},{t:'Several, including some rarely updated',w:{urgent:2,soon:1}},{t:'Many, including custom in-house native code',w:{urgent:3}}]},{q:'Do you rely on an Expo managed workflow?',a:[{t:'Yes, on a recent SDK',w:{fine:2}},{t:'Yes, but an older SDK',w:{soon:2}},{t:'No — bare React Native',w:{soon:1,urgent:1}},{t:'Not sure',w:{urgent:1,soon:1}}]},{q:'When did you last upgrade React Native?',a:[{t:'Within the last 3 months',w:{fine:2}},{t:'3–12 months ago',w:{soon:2}},{t:'1–2 years ago',w:{urgent:2,soon:1}},{t:'More than 2 years, or never',w:{urgent:3}}]},{q:'What happens if you need a security or bug fix from React Native itself?',a:[{t:'We can upgrade freely, no blockers',w:{fine:2}},{t:'We could, but it would take real effort',w:{soon:2}},{t:'We are stuck — a dependency blocks upgrading',w:{urgent:3}},{t:'Honestly, we don’t know',w:{urgent:1,soon:1}}]}];

(function(){
  var t=document.getElementById('dt'); if(!t) return;
  var Q=window.__Q, R=window.__R, KEYS=window.__KEYS;
  var i=0, score={}; KEYS.forEach(function(k){score[k]=0;});
  var qWrap=t.querySelector('.qwrap'), res=t.querySelector('.res'), bar=t.querySelector('.prog>i');
  function paint(){
    var q=Q[i];
    bar.style.width=((i)/Q.length*100)+'%';
    qWrap.innerHTML='<p class="q">'+q.q+'</p><div class="opts">'+q.a.map(function(o,n){
      return '<button class="opt" data-n="'+n+'">'+o.t+(o.s?'<small>'+o.s+'</small>':'')+'</button>';
    }).join('')+'</div><div class="nav-row"><span>Question '+(i+1)+' of '+Q.length+'</span>'+
    (i>0?'<button class="back" type="button">&#8592; Back</button>':'<span></span>')+'</div>';
    qWrap.querySelectorAll('.opt').forEach(function(b){
      b.onclick=function(){
        var pick=Q[i].a[+b.dataset.n];
        Q[i].picked=pick;
        Object.keys(pick.w||{}).forEach(function(k){score[k]+=pick.w[k];});
        i++; if(i<Q.length){paint();} else {show();}
      };
    });
    var bk=qWrap.querySelector('.back');
    if(bk) bk.onclick=function(){
      i--; var prev=Q[i].picked;
      if(prev) Object.keys(prev.w||{}).forEach(function(k){score[k]-=prev.w[k];});
      paint();
    };
  }
  function show(){
    bar.style.width='100%';
    qWrap.style.display='none';
    var max=KEYS.slice().sort(function(a,b){return score[b]-score[a];})[0];
    var total=KEYS.reduce(function(s,k){return s+Math.max(0,score[k]);},0)||1;
    var r=R[max];
    res.innerHTML='<span class="badge">Your result</span><h3>'+r.name+'</h3><p>'+r.why+'</p>'+
      '<div class="bars">'+KEYS.map(function(k){
        var pct=Math.round(Math.max(0,score[k])/total*100);
        return '<div class="bar"><span>'+R[k].label+'</span><span class="track"><i data-w="'+pct+'"></i></span><span>'+pct+'%</span></div>';
      }).join('')+'</div>'+
      '<p style="font-size:13.5px;color:var(--t3);line-height:1.6">'+r.note+'</p>'+
      '<div class="cta-row"><a class="btn btn-primary" href="https://calendly.com/het-soni-soniconsultancyservices/introductory" target="_blank" rel="noopener">Get a migration scoping call &#8594;</a>'+
      '<button class="again" type="button">Start over</button></div>';
    res.classList.add('on');
    requestAnimationFrame(function(){
      res.querySelectorAll('.track>i').forEach(function(el){el.style.width=el.dataset.w+'%';});
    });
    res.querySelector('.again').onclick=function(){
      i=0; KEYS.forEach(function(k){score[k]=0;}); Q.forEach(function(q){q.picked=null;});
      res.classList.remove('on'); res.innerHTML=''; qWrap.style.display=''; paint();
    };
    if(window.scsTrack) window.scsTrack('tool_complete',{tool:document.title.slice(0,60),result:max});
  }
  paint();
})();

