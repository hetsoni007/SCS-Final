
(function(){
  /* animated chat demo */
  var msgs=document.getElementById('cdMsgs'),st=document.getElementById('cdSt');
  var script=[{who:'me',t:"What's your refund window?"},{type:1},{who:'bot',t:"You can request a refund within 30 days of purchase — want me to start one?"},{who:'me',t:"Yes please"},{type:1},{who:'bot',t:"Done ✅ Refund initiated. You'll see it in 3–5 business days."}];
  function clear(){msgs.innerHTML='';}
  function addBubble(who,t){var r=document.createElement('div');r.className='cd-row '+who;r.innerHTML='<div class="bub '+who+'">'+t+'</div>';msgs.appendChild(r);requestAnimationFrame(function(){r.classList.add('show');});return r;}
  function addTyping(){var r=document.createElement('div');r.className='cd-row bot show';r.innerHTML='<div class="bub bot cd-typing"><i></i><i></i><i></i></div>';msgs.appendChild(r);return r;}
  function play(){clear();var i=0,typingEl=null;(function step(){if(i>=script.length){st.textContent='online';setTimeout(play,3800);return;}var s=script[i++];if(s.type===1){st.textContent='typing…';typingEl=addTyping();setTimeout(step,1100);}else{if(typingEl){typingEl.remove();typingEl=null;}st.textContent='online';addBubble(s.who,s.t);setTimeout(step,s.who==='me'?700:1200);}})();}
  if('IntersectionObserver' in window){var io=new IntersectionObserver(function(e){e.forEach(function(en){if(en.isIntersecting){play();io.disconnect();}});},{threshold:.3});io.observe(document.getElementById('cd'));}else{play();}

  /* tier selector */
  var fill=document.getElementById('tierFill'),nm=document.getElementById('tierName'),meta=document.getElementById('tierMeta'),desc=document.getElementById('tierDesc');
  var tiers=[
    {n:"Tier 1 · Simple FAQ bot",pct:25,time:"2–3 weeks",eng:"Prompt + chat UI",d:"Conversational answers from a fixed knowledge base. No live data, no actions — fast to ship and a solid way to validate demand."},
    {n:"Tier 2 · Grounded assistant",pct:55,time:"4–8 weeks",eng:"+ retrieval (RAG)",d:"Answers grounded in your own documents and data via a vector store, with evaluation so it stays accurate. The most common production tier."},
    {n:"Tier 3 · Capable assistant",pct:80,time:"8–12 weeks",eng:"+ voice / multilingual",d:"Adds voice in/out or multiple languages on top of grounded answers — more UX surface and more testing."},
    {n:"Tier 4 · Advanced / agentic",pct:100,time:"10+ weeks",eng:"+ tool-calling & actions",d:"The bot takes real actions through your APIs — it's now part chatbot, part agent, with guardrails and human fallback front of mind."}
  ];
  function calc(){var sum=0;document.querySelectorAll('#tier .tier-opt').forEach(function(b){if(b.getAttribute('aria-pressed')==='true')sum+=parseInt(b.dataset.w,10);});var idx=sum<=0?0:sum<=1?1:sum<=2?2:3;var t=tiers[idx];fill.style.width=t.pct+'%';nm.textContent=t.n;meta.innerHTML='<span>⏱ <b>'+t.time+'</b></span><span>🔧 <b>'+t.eng+'</b></span>';desc.textContent=t.d;}
  document.querySelectorAll('#tier .tier-opt').forEach(function(b){b.addEventListener('click',function(){b.setAttribute('aria-pressed',b.getAttribute('aria-pressed')==='true'?'false':'true');calc();});});
  calc();
})();
