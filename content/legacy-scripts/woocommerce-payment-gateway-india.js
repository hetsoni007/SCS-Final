
(function(){
  var d=document;
  function fmtINR(n){
    if(n>=100000){return '\u20B9'+(n/100000).toFixed(1).replace(/\.0$/,'')+'L';}
    return '\u20B9'+Math.round(n).toLocaleString('en-IN');
  }
  var vol=d.getElementById('g_vol'),aov=d.getElementById('g_aov');
  function upd(){
    var v=+vol.value;
    d.getElementById('gv_vol').textContent=fmtINR(v);
    d.getElementById('gv_aov').textContent='\u20B9'+(+aov.value).toLocaleString('en-IN');
    var fees={rz:v*0.02,cf:v*0.0195,pu:v*0.02+4999/12};
    d.getElementById('gf_rz').textContent=fmtINR(fees.rz)+'/mo';
    d.getElementById('gf_cf').textContent=fmtINR(fees.cf)+'/mo';
    d.getElementById('gf_pu').textContent=fmtINR(fees.pu)+'/mo';
    var win=Object.keys(fees).sort(function(a,b){return fees[a]-fees[b];})[0];
    ['rz','cf','pu'].forEach(function(k){d.getElementById('gc_'+k).classList.toggle('win',k===win);});
  }
  vol.addEventListener('input',upd);
  aov.addEventListener('input',upd);
  vol.addEventListener('change',function(){if(window.scsTrack)scsTrack('gateway_calc_use',{});});
  upd();
})();
