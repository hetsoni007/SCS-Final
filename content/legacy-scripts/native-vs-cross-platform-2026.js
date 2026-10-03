
(function(){
  var Q=[
    {q:"What matters most for this app right now?",a:[
      {t:"Ship fast, control budget",s:{rn:2,fl:1,na:0}},
      {t:"Absolute performance & native feel",s:{rn:0,fl:1,na:2}},
      {t:"A balance of both",s:{rn:1,fl:2,na:0}}]},
    {q:"Which platforms do you need?",a:[
      {t:"iOS + Android (maybe web later)",s:{rn:2,fl:1,na:0}},
      {t:"Mainly one platform, best-in-class",s:{rn:0,fl:0,na:2}},
      {t:"iOS + Android + web from one codebase",s:{rn:2,fl:2,na:0}}]},
    {q:"Your team's existing skills?",a:[
      {t:"JavaScript / React",s:{rn:3,fl:0,na:0}},
      {t:"Swift / Kotlin (native)",s:{rn:0,fl:0,na:3}},
      {t:"Starting fresh / no team yet",s:{rn:1,fl:1,na:0}}]},
    {q:"Does the app lean on heavy device hardware?",a:[
      {t:"Yes — AR, advanced camera, BLE, 3D/graphics",s:{rn:0,fl:1,na:2}},
      {t:"Some device features",s:{rn:1,fl:1,na:1}},
      {t:"Mostly standard app features",s:{rn:2,fl:1,na:0}}]},
    {q:"What stage are you at?",a:[
      {t:"MVP / early validation",s:{rn:2,fl:1,na:0}},
      {t:"Scaling an existing product",s:{rn:1,fl:1,na:1}},
      {t:"Enterprise-grade / mission-critical",s:{rn:1,fl:1,na:1}}]}
  ];
  var VERD={
    rn:{name:"React Native",why:"Your answers point to speed, cost-efficiency and reach — exactly where React Native wins. One JavaScript codebase covers iOS and Android (and can share logic with web), so you ship faster and maintain less. It's our core stack, and for most products it's the smart default."},
    fl:{name:"Flutter",why:"You're weighting custom, polished UI and cross-platform reach. Flutter's single Dart codebase renders pixel-perfect interfaces beautifully across iOS and Android — a great fit for design-led, animation-rich apps. We ship Flutter too."},
    na:{name:"Native (Swift & Kotlin)",why:"Your needs lean on hardware, raw performance or a single best-in-class platform — the case where native earns its higher cost. Expect to build and maintain per platform. We can help you scope whether that trade-off is truly required, or whether cross-platform gets you 95% of the way for far less."}
  };
  var d=document, i=0, ans=[], root=d.getElementById('dtool');
  var qBox=d.getElementById('dtQ'), rBox=d.getElementById('dtRes');
  function render(){
    var item=Q[i];
    d.getElementById('dtProg').style.width=(i/Q.length*100)+'%';
    d.getElementById('dtStep').textContent='Question '+(i+1)+' of '+Q.length;
    d.getElementById('dtQtext').textContent=item.q;
    d.getElementById('dtBack').style.visibility=i?'visible':'hidden';
    var o=d.getElementById('dtOpts'); o.innerHTML='';
    item.a.forEach(function(opt,idx){
      var b=d.createElement('button'); b.type='button'; b.className='opt'; b.textContent=opt.t;
      b.onclick=function(){ ans[i]=opt.s; if(window.scsTrack)scsTrack('decision_tool_answer',{step:i+1}); i++; if(i<Q.length){render();} else {finish();} };
      o.appendChild(b);
    });
  }
  d.getElementById('dtBack').onclick=function(){ if(i){i--;render();} };
  function finish(){
    var tot={rn:0,fl:0,na:0}; ans.forEach(function(s){for(var k in s)tot[k]+=s[k];});
    var order=['rn','fl','na'].sort(function(a,b){return tot[b]-tot[a];});
    var win=order[0];
    var max=Math.max(tot.rn,tot.fl,tot.na)||1;
    qBox.style.display='none'; rBox.classList.add('on');
    d.getElementById('dtProg').style.width='100%';
    d.getElementById('dtVerdict').textContent=VERD[win].name;
    d.getElementById('dtWhy').textContent=VERD[win].why;
    var labels={rn:'React Native',fl:'Flutter',na:'Native'};
    var bars=d.getElementById('dtBars'); bars.innerHTML='';
    ['rn','fl','na'].forEach(function(k){
      var row=d.createElement('div'); row.className='bar';
      var pct=Math.round(tot[k]/max*100);
      row.innerHTML='<span>'+labels[k]+'</span><span class="track"><i></i></span><span style="text-align:right;color:var(--t2)">'+pct+'%</span>';
      bars.appendChild(row);
      setTimeout(function(){row.querySelector('i').style.width=pct+'%';},60);
    });
    if(window.scsTrack)scsTrack('decision_tool_result',{result:labels[win]});
  }
  d.getElementById('dtAgain').onclick=function(){ i=0; ans=[]; rBox.classList.remove('on'); qBox.style.display='block'; render(); };
  render();
})();
