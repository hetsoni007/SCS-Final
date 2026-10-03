
document.querySelectorAll('.faq-q').forEach(function(b){b.onclick=function(){var f=b.parentElement,open=f.classList.contains('open');document.querySelectorAll('.faq').forEach(function(x){x.classList.remove('open')});if(!open)f.classList.add('open')}});
window.__KEYS=['ai','mix','eng'];
window.__R={ai:{label:'AI-led is viable',name:'You could reasonably build this with AI tools',why:'Your answers describe a largely standard product without sensitive data or hard integrations, and you are validating rather than betting the business on it. That is exactly the case where AI-assisted building is the fastest, cheapest way to find out whether the idea has legs.',note:'One condition: treat what you build as a disposable experiment, not a foundation. AI-assisted prototypes are excellent at answering \'is this worth building?\' and poor at becoming the thing you scale.'},mix:{label:'Hybrid',name:'A hybrid approach fits best',why:'There is enough standard surface here for AI to genuinely accelerate the build, and enough real complexity — integrations, data sensitivity or scale — that some of it needs an engineer accountable for the design. Draft fast where it is safe; put people on the parts with consequences.',note:'The practical split: let AI draft routine screens and tests under review, and keep architecture, data modelling and anything touching money or personal data with someone who can answer for it.'},eng:{label:'Engineer-led',name:'This one needs engineers leading',why:'Your answers point to real consequences — sensitive data, money, hard integrations, or a product the business depends on. AI can still accelerate parts of this build, but the architecture and the accountability need to sit with people, because the cost of getting it wrong lands on you.',note:'That does not mean avoiding AI. It means using it as a drafting tool under expert review, rather than as the thing deciding how your system is put together.'}};
window.__Q=[{q:'What are you trying to find out right now?',a:[{t:'Whether the idea is worth pursuing at all',w:{ai:3}},{t:'Whether we can get early users to pay',w:{ai:1,mix:2}},{t:'We are past that — this is the real build',w:{eng:3}},{t:'We are scaling something that already works',w:{eng:3}}]},{q:'What does the app handle?',a:[{t:'Content, forms and profiles',w:{ai:3}},{t:'Payments or money movement',w:{eng:3}},{t:'Health, financial or sensitive personal data',s:'DPDP, HIPAA or similar in scope',w:{eng:3}},{t:'Mostly standard, with one sensitive area',w:{mix:3}}]},{q:'How hard are your integrations?',a:[{t:'None to speak of',w:{ai:3}},{t:'Mainstream services with good SDKs',w:{ai:1,mix:2}},{t:'Several, including at least one awkward one',w:{mix:2,eng:1}},{t:'Industry-specific hardware or legacy systems',w:{eng:3}}]},{q:'Can anyone on your side read the code?',a:[{t:'Yes — a technical founder',w:{ai:2,mix:1}},{t:'Somewhat — enough to spot obvious problems',w:{mix:2}},{t:'No, we would be trusting the output',w:{eng:2}},{t:'We have engineers on the team',w:{mix:2,eng:1}}]},{q:'What happens if it breaks in six months?',a:[{t:'We would shrug and move on',w:{ai:3}},{t:'Annoying, but survivable',w:{mix:2}},{t:'We would lose customers',w:{eng:2}},{t:'The business would be in trouble',w:{eng:3}}]}];

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

