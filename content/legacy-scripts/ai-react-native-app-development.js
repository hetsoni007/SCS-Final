
(function(){
  var data={
    device:{txt:"The model lives <b>inside the app binary</b> and runs on the phone's own chip. No request ever leaves the device.",chips:[["Latency","Instant, no round-trip"],["Privacy","Data never leaves device"],["Cost","$0 per call"],["Offline","Fully offline"]],lit:["g-devicechip"],dim:["g-cloudpath"]},
    cloud:{txt:"The app calls <b>your backend</b>, which calls a frontier model in the cloud and streams the answer back. Most capable, needs a connection.",chips:[["Latency","Network round-trip"],["Privacy","Leaves device (your control)"],["Cost","Per-token"],["Offline","Needs connection"]],lit:["g-cloudpath"],dim:["g-devicechip"]},
    hybrid:{txt:"Cheap, instant work runs <b>on-device</b>; heavy reasoning routes to a <b>cloud model</b>. The default shape for most production AI apps.",chips:[["Latency","Best of both"],["Privacy","Sensitive bits stay local"],["Cost","Lower per-token"],["Offline","Core works offline"]],lit:["g-devicechip","g-cloudpath"],dim:[]}
  };
  var panel=document.getElementById('archPanel'),chips=document.getElementById('archChips'),svg=document.querySelector('#arch .arch-svg');
  function setGroup(cls,on){svg.querySelectorAll('.'+cls).forEach(function(el){el.classList.remove('lit','dim');el.classList.add(on?'lit':'dim');});}
  function render(k){var d=data[k];panel.innerHTML=d.txt;chips.innerHTML=d.chips.map(function(c){return '<div class="arch-chip"><div class="k">'+c[0]+'</div><div class="v">'+c[1]+'</div></div>';}).join('');['g-devicechip','g-cloudpath'].forEach(function(g){setGroup(g,d.lit.indexOf(g)>-1);});}
  document.querySelectorAll('#arch .arch-tab').forEach(function(b){b.addEventListener('click',function(){document.querySelectorAll('#arch .arch-tab').forEach(function(x){x.classList.remove('active');});b.classList.add('active');render(b.dataset.k);});});
  render('device');
})();
