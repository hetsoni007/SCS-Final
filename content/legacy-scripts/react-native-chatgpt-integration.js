
(function(){
  var kt={
    direct:{cls:"kt-bad",label:"✗ Insecure",flow:"app  →  🤖 LLM API   (key inside the app)",pts:["Your provider key ships inside the binary &mdash; extractable with standard tools.","Anyone can lift it and run up your bill on your account.","No rate limiting, no abuse protection, no caching.","Switching providers or models means a new app-store release."]},
    proxy:{cls:"kt-good",label:"✓ Production-ready",flow:"app  →  🛡 your backend  →  🤖 LLM API",pts:["The key lives on your server and never reaches the device.","Add auth, per-user rate limits and caching in one place.","Swap providers, models or prompts without shipping an update.","One endpoint to monitor for cost, latency and abuse."]}
  };
  var body=document.getElementById('ktBody');
  function render(k){var d=kt[k];body.innerHTML='<span class="kt-verdict '+d.cls+'">'+d.label+'</span><div class="kt-flow">'+d.flow+'</div><ul>'+d.pts.map(function(p){return '<li>'+p+'</li>';}).join('')+'</ul>';}
  document.querySelectorAll('#kt .kt-tab').forEach(function(b){b.addEventListener('click',function(){document.querySelectorAll('#kt .kt-tab').forEach(function(x){x.classList.remove('active');});b.classList.add('active');render(b.dataset.k);});});
  render('direct');

  var out=document.getElementById('streamOut'),btn=document.getElementById('streamBtn'),timer=null;
  var txt="Yes — streaming makes the wait feel instant. The model sends tokens as it generates them, and the app appends each one to the screen, so words appear in real time instead of after a long, frozen pause.";
  function run(){clearInterval(timer);var i=0;out.innerHTML='<span class="stream-cursor"></span>';timer=setInterval(function(){i++;if(i>txt.length){clearInterval(timer);out.textContent=txt;return;}out.innerHTML=txt.slice(0,i)+'<span class="stream-cursor"></span>';},26);}
  btn.addEventListener('click',run);
  if('IntersectionObserver' in window){var io=new IntersectionObserver(function(e){e.forEach(function(en){if(en.isIntersecting){run();io.disconnect();}});},{threshold:.4});io.observe(document.getElementById('stream'));}else{run();}
})();
