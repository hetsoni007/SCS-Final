
(function(){
  var Q=[
    {q:"Where will your product primarily live?",a:[
      {t:"On phones (mobile-first)",s:{mern:3,next:0,fire:2,ai:1}},
      {t:"In the browser (web-first SaaS)",s:{mern:0,next:3,fire:0,ai:1}},
      {t:"Both mobile and web from day one",s:{mern:2,next:2,fire:0,ai:1}}]},
    {q:"How custom is your backend logic?",a:[
      {t:"Standard: auth, profiles, data, push",s:{mern:1,next:1,fire:3,ai:0}},
      {t:"Real business rules & integrations",s:{mern:3,next:2,fire:0,ai:1}},
      {t:"Mostly orchestrating AI models",s:{mern:1,next:1,fire:0,ai:3}}]},
    {q:"How central is AI to the product?",a:[
      {t:"AI IS the product",s:{mern:0,next:0,fire:0,ai:4}},
      {t:"A feature, not the core",s:{mern:2,next:2,fire:1,ai:1}},
      {t:"Not needed for the MVP",s:{mern:2,next:2,fire:2,ai:0}}]},
    {q:"What does your team know best?",a:[
      {t:"JavaScript / React",s:{mern:3,next:2,fire:2,ai:1}},
      {t:"No tech team yet",s:{mern:2,next:1,fire:2,ai:1}},
      {t:"Mixed / other languages",s:{mern:1,next:2,fire:1,ai:1}}]},
    {q:"What matters most right now?",a:[
      {t:"Validate as fast as possible",s:{mern:1,next:1,fire:3,ai:0}},
      {t:"A foundation that scales 18 months",s:{mern:3,next:3,fire:0,ai:1}},
      {t:"Shipping a differentiated AI experience",s:{mern:1,next:1,fire:0,ai:3}}]}
  ];
  var VERD={
    mern:{name:"React Native + Node/Express + MongoDB (MERN)",why:"Mobile-first with real backend logic and a JavaScript-friendly team — the classic MERN + React Native setup gives you one language everywhere, one codebase for both stores, and a backend you fully control. It's the stack we ship most.",
      l:{Frontend:"React Native (iOS + Android)",Backend:"Node.js + Express API",Database:"MongoDB",Hosting:"AWS (S3/CloudFront + EC2/Lambda)"}},
    next:{name:"Next.js + PostgreSQL",why:"Your product lives in the browser — Next.js gives you the app and the marketing site in one framework with server rendering and great SEO, while Postgres handles relational data like teams, roles and billing properly from day one.",
      l:{Frontend:"Next.js (React)",Backend:"Next.js API routes / Node",Database:"PostgreSQL",Hosting:"Vercel or AWS"}},
    fire:{name:"React Native + Firebase",why:"Speed of validation is your priority and your backend needs are standard — a backend-as-a-service removes the server entirely so you ship in weeks. Graduating to a custom API later is a normal, planned migration.",
      l:{Frontend:"React Native (iOS + Android)",Backend:"Firebase (Auth, Functions)",Database:"Firestore",Hosting:"Firebase / Google Cloud"}},
    ai:{name:"React Native / Next.js + Node AI layer",why:"AI is the core of your product — you need a thin, secure API layer between your app and the model providers for key management, prompt assembly, streaming and cost control, with the UI in React Native or Next.js depending on surface.",
      l:{Frontend:"React Native or Next.js",Backend:"Node.js AI proxy (streaming)",Database:"MongoDB / Postgres + vector store",Hosting:"AWS + LLM APIs (Claude, GPT)"}}
  };
  var d=document,i=0,ans=[];
  var qBox=d.getElementById('dtQ'),rBox=d.getElementById('dtRes');
  function render(){
    var item=Q[i];
    d.getElementById('dtProg').style.width=(i/Q.length*100)+'%';
    d.getElementById('dtStep').textContent='Question '+(i+1)+' of '+Q.length;
    d.getElementById('dtQtext').textContent=item.q;
    d.getElementById('dtBack').style.visibility=i?'visible':'hidden';
    var o=d.getElementById('dtOpts');o.innerHTML='';
    item.a.forEach(function(opt){
      var b=d.createElement('button');b.type='button';b.className='opt';b.textContent=opt.t;
      b.onclick=function(){ans[i]=opt.s;if(window.scsTrack)scsTrack('stack_picker_answer',{step:i+1});i++;i<Q.length?render():finish();};
      o.appendChild(b);
    });
  }
  d.getElementById('dtBack').onclick=function(){if(i){i--;render();}};
  function finish(){
    var tot={mern:0,next:0,fire:0,ai:0};ans.forEach(function(s){for(var k in s)tot[k]+=s[k];});
    var win=Object.keys(tot).sort(function(a,b){return tot[b]-tot[a];})[0];
    qBox.style.display='none';rBox.classList.add('on');
    d.getElementById('dtProg').style.width='100%';
    d.getElementById('dtVerdict').textContent=VERD[win].name;
    d.getElementById('dtWhy').textContent=VERD[win].why;
    var L=d.getElementById('dtLayers');L.innerHTML='';
    var ls=VERD[win].l;
    Object.keys(ls).forEach(function(k){
      var row=d.createElement('div');row.className='layer';
      row.innerHTML='<span class="k">'+k+'</span><span class="v">'+ls[k]+'</span>';
      L.appendChild(row);
    });
    if(window.scsTrack)scsTrack('stack_picker_result',{result:win});
  }
  d.getElementById('dtAgain').onclick=function(){i=0;ans=[];rBox.classList.remove('on');qBox.style.display='block';render();};
  render();
})();
