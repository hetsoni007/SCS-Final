
document.querySelectorAll('.faq-q').forEach(function(b){b.onclick=function(){var f=b.parentElement,open=f.classList.contains('open');document.querySelectorAll('.faq').forEach(function(x){x.classList.remove('open')});if(!open)f.classList.add('open')}});
window.__KEYS=['no','native','super'];
window.__R={no:{label:'Stay focused',name:'Stay a single-purpose app for now',why:'Your answers point to a product that has not yet earned the habitual use a platform strategy depends on. Adding services will not create that engagement — it will spread a fixed amount of attention across more surface area, and give you more to maintain.',note:'The most valuable next move is almost certainly retention on your core use case, not expansion. Revisit the platform question once people open your app without being prompted.'},native:{label:'Add services natively',name:'Add adjacent services yourself first',why:'You have real engagement, and there is a plausible case for offering more. But the jump straight to a third-party platform carries SDK, sandboxing and governance costs you do not need yet. Build the next one or two services natively inside your app and keep the distribution benefit without the platform burden.',note:'If those additions do well, the platform argument becomes evidence-based rather than aspirational — and you will know which services users actually want before you invite anyone to build on you.'},super:{label:'Platform play',name:'A mini-app platform is a defensible move',why:'Habitual use, a shared account model and genuine demand for services beyond your own — this is the profile where hosting third parties creates real leverage rather than just complexity.',note:'Before writing an SDK: fix the sandbox boundary, set performance budgets as a publishing condition, write the review policy ahead of your first partner, and design consent for a multi-service world from the start.'}};
window.__Q=[{q:'How often do your users open the app?',a:[{t:'Daily, without being prompted',w:{super:3}},{t:'A few times a week',w:{native:3}},{t:'When they need the specific thing it does',w:{no:2,native:1}},{t:'Rarely — retention is a known problem',w:{no:3}}]},{q:'Have users asked for services beyond your core?',a:[{t:'Yes — we can name three specific requests',w:{super:3}},{t:'One or two keep coming up',w:{native:3}},{t:'Not really, it is our idea',w:{no:2}},{t:'We have not asked them',w:{no:2}}]},{q:'Who would build the additional services?',a:[{t:'Third parties, on our platform',w:{super:3}},{t:'Us, at least at first',w:{native:3}},{t:'A mix, eventually',w:{native:1,super:2}},{t:'Unclear',w:{no:2}}]},{q:'Do you already own identity and payment?',a:[{t:'Yes — accounts and payment details on file',w:{super:3}},{t:'Accounts yes, payment no',w:{native:2}},{t:'Neither, really',w:{no:2}},{t:'We use a third party for both',w:{native:1,no:1}}]},{q:'Could you staff platform work ongoing?',s:'SDK, docs, review, developer support',a:[{t:'Yes — we can dedicate people to it',w:{super:3}},{t:'Maybe, if it proved itself first',w:{native:2}},{t:'Not without stopping other work',w:{no:2,native:1}},{t:'No',w:{no:3}}]}];

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
      '<div class="cta-row"><a class="btn btn-primary" href="https://calendly.com/het-soni-soniconsultancyservices/introductory" target="_blank" rel="noopener">Pressure-test this on a free call &#8594;</a>'+
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

