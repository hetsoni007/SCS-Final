
(function(){
  var ITEMS=[
    {t:"All traffic uses HTTPS with modern TLS",d:"No plain HTTP anywhere; no disabled certificate validation, even in dev builds."},
    {t:"Tokens live in Keychain / Keystore",d:"Session and refresh tokens in secure storage — not AsyncStorage, localStorage or files."},
    {t:"Every API endpoint authorizes server-side",d:"The server checks the user may touch the resource — not just that they're logged in."},
    {t:"No secrets ship in the app bundle",d:"Payment, AI/LLM and service keys stay on your server behind an API you control."},
    {t:"All input is validated on the server",d:"Client-side checks are UX; the server validates and sanitizes everything regardless."},
    {t:"Dependencies are scanned automatically",d:"npm audit / Dependabot (or similar) run in CI; security patches applied promptly."},
    {t:"Auth endpoints are rate-limited",d:"Login, OTP and password flows are throttled to block credential-stuffing."},
    {t:"Sessions expire and can be revoked",d:"Short-lived access tokens with refresh rotation; server-side kill switch for a compromised session."},
    {t:"Sensitive data is encrypted at rest",d:"PII and business data encrypted in the database; backups included; access logged."},
    {t:"You monitor and can respond",d:"Crash + security alerting exists, and someone owns the response when it fires."}
  ];
  var d=document,list=d.getElementById('aList'),answers=new Array(ITEMS.length).fill(null);
  var OPTS=[["Yes",2],["Partly",1],["No",0]];
  ITEMS.forEach(function(it,idx){
    var el=d.createElement('div');el.className='aitem';
    var btns=OPTS.map(function(o,k){return '<button type="button" class="ab" data-i="'+idx+'" data-v="'+o[1]+'">'+o[0]+'</button>';}).join('');
    el.innerHTML='<div class="at">'+(idx+1)+'. '+it.t+'</div><div class="ad">'+it.d+'</div><div class="abtns">'+btns+'</div>';
    list.appendChild(el);
  });
  list.addEventListener('click',function(e){
    var b=e.target.closest('.ab');if(!b)return;
    var i=+b.dataset.i;answers[i]=+b.dataset.v;
    b.parentNode.querySelectorAll('.ab').forEach(function(x){x.classList.remove('on');});
    b.classList.add('on');update();
  });
  function update(){
    var done=answers.filter(function(a){return a!==null;}).length;
    d.getElementById('aCount').textContent=done+'/'+ITEMS.length+' answered';
    if(!done){return;}
    var pts=answers.reduce(function(s,a){return s+(a||0);},0);
    var pct=Math.round(pts/(ITEMS.length*2)*100);
    d.getElementById('aFill').style.width=(done===ITEMS.length?pct:Math.round(done/ITEMS.length*100)*0+pct)+'%';
    d.getElementById('aScore').textContent=done===ITEMS.length?pct+'/100':'…';
    if(done===ITEMS.length){
      var v=d.getElementById('aVerdict');v.classList.add('on');
      var t,x;
      if(pct>=80){t='Solid: '+pct+'/100';x='Your foundations look strong. Keep dependencies moving, re-run this quarterly, and consider a periodic external review to keep yourselves honest.';}
      else if(pct>=50){t='Gaps to close: '+pct+'/100';x='Real gaps, but fixable ones. Prioritise anything you answered "No" on that touches tokens, secrets or server-side authorization — those are the breach-makers. Most fixes take days, not months.';}
      else{t='At risk: '+pct+'/100';x='Treat hardening as this sprint\'s work, not backlog. Start with transport security, token storage and server-side auth — then work down the list. This is well-understood engineering; you don\'t need a security team to fix it.';}
      d.getElementById('avTitle').textContent=t;d.getElementById('avText').textContent=x;
      if(window.scsTrack)scsTrack('security_audit_result',{score:pct});
      v.scrollIntoView({behavior:'smooth',block:'nearest'});
    }
  }
})();
