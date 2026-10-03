
document.querySelectorAll('.faq-q').forEach(function(b){b.onclick=function(){var f=b.parentElement,open=f.classList.contains('open');document.querySelectorAll('.faq').forEach(function(x){x.classList.remove('open')});if(!open)f.classList.add('open')}});
(function(){
  var d=document;
  function fmtUSD(n){return '$'+n.toLocaleString('en-US',{maximumFractionDigits:0});}
  var mau=d.getElementById('g_mau');
  function upd(){
    var v=+mau.value;
    d.getElementById('gv_mau').textContent=v.toLocaleString('en-US');
    var fcmCost=0;
    var osCost = v<=1000 ? 0 : 19 + (v-0)*0.012;
    d.getElementById('gf_fcm').textContent=fcmCost===0?'Free':fmtUSD(fcmCost)+'/mo';
    d.getElementById('gf_os').textContent=osCost===0?'Free':fmtUSD(osCost)+'/mo';
    var win = fcmCost<=osCost ? 'fcm' : 'os';
    d.getElementById('gc_fcm').classList.toggle('win', win==='fcm');
    d.getElementById('gc_os').classList.toggle('win', win==='os');
  }
  mau.addEventListener('input',upd);
  mau.addEventListener('change',function(){if(window.scsTrack)scsTrack('push_calc_use',{});});
  upd();
})();
