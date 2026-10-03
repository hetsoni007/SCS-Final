
document.querySelectorAll('.faq-q').forEach(function(b){b.onclick=function(){var f=b.parentElement,open=f.classList.contains('open');document.querySelectorAll('.faq').forEach(function(x){x.classList.remove('open')});if(!open)f.classList.add('open')}});
window.__KEYS=['rn','kmp'];
window.__R={rn:{label:'React Native',name:'React Native looks like the better fit',why:'Your answers point to a team and product shape where one shared codebase and one hiring pool are worth more than native-by-construction UI. React Native gets you to a shipped product on both stores faster, and keeps the maintenance bill lower.',note:'This is a starting position, not a verdict. Before committing, check your five hardest integrations for maintained React Native modules — that is the check that most often changes the answer.'},kmp:{label:'Kotlin Multiplatform',name:'Kotlin Multiplatform deserves a serious look',why:'Your answers point to existing native investment, native engineers, or a product where platform-native UI fidelity is a core value. KMP lets you remove duplicated logic without giving up native interfaces — and you can adopt it one module at a time.',note:'Worth validating before you commit: check library support for your hardest integrations, and be honest about whether you can hire Kotlin plus Swift and Android skills over the next two years.'}};
window.__Q=[{q:'Who is on your mobile team today?',a:[{t:'Web / JavaScript engineers',s:'React, TypeScript, Node',w:{rn:3}},{t:'Native iOS and Android engineers',s:'Swift and Kotlin already on the team',w:{kmp:3}},{t:'A mix of both',w:{rn:1,kmp:1}},{t:'Nobody yet — we will hire',s:'Staffing is an open question',w:{rn:2}}]},{q:'Are you starting fresh or extending something?',a:[{t:'Greenfield — no app exists yet',w:{rn:3}},{t:'We have two mature native apps',s:'And we are tired of fixing bugs twice',w:{kmp:3}},{t:'One native app, adding the second platform',w:{kmp:2,rn:1}},{t:'Replacing an ageing cross-platform app',w:{rn:1,kmp:1}}]},{q:'How much does native UI fidelity matter?',a:[{t:'Critical — it must feel perfectly native',s:'Platform conventions, day-one OS refreshes',w:{kmp:3}},{t:'Important, but not defining',w:{kmp:1,rn:1}},{t:'A consistent brand look matters more',w:{rn:2}},{t:'Users mostly will not notice',w:{rn:2}}]},{q:'Is a web product part of the same system?',a:[{t:'Yes — and it shares real business logic',w:{rn:3}},{t:'Yes, but they are largely separate',w:{rn:1}},{t:'Not today, likely later',w:{rn:1}},{t:'No — mobile only',w:{kmp:2}}]},{q:'What is your biggest constraint?',a:[{t:'Time to market',s:'We need something in users hands soon',w:{rn:3}},{t:'Long-term maintainability',s:'This runs for five years or more',w:{kmp:2,rn:1}},{t:'Hiring and retention',w:{rn:3}},{t:'Performance ceiling',w:{kmp:2}}]}];

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

