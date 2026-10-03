
(function(){
  var d={
    privacy:{pick:"On-device",why:"When data <b>can't legally or ethically leave the phone</b> &mdash; health, finance, legal &mdash; on-device makes privacy an architectural guarantee, not a policy promise."},
    offline:{pick:"On-device",why:"Inference runs locally, so the feature <b>keeps working with no signal</b> &mdash; ideal for field tools, travel and low-connectivity markets."},
    cost:{pick:"On-device",why:"There's <b>no per-call API fee</b>: the model runs on the user's hardware, so cost stays flat whether a feature is used once or a million times a day."},
    capability:{pick:"Cloud",why:"For the <b>hardest reasoning and broadest knowledge</b>, a frontier cloud model behind your backend beats anything small enough to run on a phone."},
    context:{pick:"Cloud",why:"Very large context windows need cloud models. Keep the key on your <b>backend proxy</b> and stream the result &mdash; see our LLM integration guide."}
  };
  var pick=document.getElementById('dmPick'),why=document.getElementById('dmWhy');
  function render(k){pick.textContent=d[k].pick;why.innerHTML=d[k].why;}
  document.querySelectorAll('#dm .dm-opt').forEach(function(b){b.addEventListener('click',function(){document.querySelectorAll('#dm .dm-opt').forEach(function(x){x.classList.remove('active');});b.classList.add('active');render(b.dataset.k);});});
  render('privacy');
})();
