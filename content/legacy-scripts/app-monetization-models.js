
(function(){
  function fmt(n){
    if(n>=1e7)return '$'+(n/1e6).toFixed(1)+'M';
    if(n>=1e4)return '$'+Math.round(n/1e3)+'K';
    return '$'+Math.round(n).toLocaleString('en-US');
  }
  var MODELS={
    sub:{name:"Subscription",fit:"<b>Fits:</b> recurring-value products — tools, content, communities. Revenue compounds with retention; churn is the real battle.",
      inputs:[
        {k:"mau",l:"Monthly active users",min:1000,max:500000,step:1000,v:20000,f:function(x){return x.toLocaleString('en-US');}},
        {k:"conv",l:"% of users on a paid plan",min:0.5,max:20,step:0.5,v:4,f:function(x){return x+'%';}},
        {k:"price",l:"Monthly price",min:1,max:50,step:1,v:9,f:function(x){return '$'+x;}},
        {k:"cut",l:"Store cut (in-app billing)",min:0,max:30,step:15,v:15,f:function(x){return x+'%';}}],
      calc:function(v){return v.mau*(v.conv/100)*v.price*(1-v.cut/100);}},
    iap:{name:"Freemium + IAP",fit:"<b>Fits:</b> apps with a natural 'more' to sell — features, capacity, content. The craft is the free/paid split.",
      inputs:[
        {k:"mau",l:"Monthly active users",min:1000,max:500000,step:1000,v:30000,f:function(x){return x.toLocaleString('en-US');}},
        {k:"buy",l:"% of users buying each month",min:0.5,max:15,step:0.5,v:2.5,f:function(x){return x+'%';}},
        {k:"avg",l:"Average purchase",min:1,max:50,step:1,v:6,f:function(x){return '$'+x;}},
        {k:"cut",l:"Store cut (in-app billing)",min:0,max:30,step:15,v:15,f:function(x){return x+'%';}}],
      calc:function(v){return v.mau*(v.buy/100)*v.avg*(1-v.cut/100);}},
    ads:{name:"Advertising",fit:"<b>Fits:</b> broad, high-frequency consumer apps. The math is honest — without big engaged scale, ads earn pocket change.",
      inputs:[
        {k:"mau",l:"Monthly active users",min:5000,max:2000000,step:5000,v:100000,f:function(x){return x.toLocaleString('en-US');}},
        {k:"imp",l:"Ad impressions / user / month",min:5,max:300,step:5,v:60,f:function(x){return x.toLocaleString('en-US');}},
        {k:"ecpm",l:"eCPM (per 1,000 impressions)",min:0.5,max:20,step:0.5,v:3,f:function(x){return '$'+x;}}],
      calc:function(v){return v.mau*v.imp/1000*v.ecpm;}},
    fee:{name:"Commission",fit:"<b>Fits:</b> marketplaces and service platforms — rides, bookings, orders. Scales with transaction volume, needs liquidity.",
      inputs:[
        {k:"tx",l:"Transactions / month",min:100,max:200000,step:100,v:8000,f:function(x){return x.toLocaleString('en-US');}},
        {k:"aov",l:"Average order value",min:2,max:200,step:1,v:18,f:function(x){return '$'+x;}},
        {k:"take",l:"Your take-rate",min:1,max:30,step:0.5,v:12,f:function(x){return x+'%';}}],
      calc:function(v){return v.tx*v.aov*(v.take/100);}}
  };
  var d=document,cur='sub',vals={};
  var tabs=d.getElementById('mTabs'),rows=d.getElementById('mRows');
  Object.keys(MODELS).forEach(function(k){
    var b=d.createElement('button');b.type='button';b.className='mtab'+(k===cur?' on':'');b.textContent=MODELS[k].name;b.dataset.k=k;
    b.onclick=function(){cur=k;tabs.querySelectorAll('.mtab').forEach(function(x){x.classList.remove('on');});b.classList.add('on');build();if(window.scsTrack)scsTrack('monetization_model_view',{model:k});};
    tabs.appendChild(b);
  });
  function build(){
    var m=MODELS[cur];rows.innerHTML='';vals={};
    m.inputs.forEach(function(inp){
      vals[inp.k]=inp.v;
      var w=d.createElement('div');w.className='mrow';
      w.innerHTML='<label><span>'+inp.l+'</span><b id="mv_'+inp.k+'">'+inp.f(inp.v)+'</b></label>'+
        '<input type="range" min="'+inp.min+'" max="'+inp.max+'" step="'+inp.step+'" value="'+inp.v+'" data-k="'+inp.k+'" aria-label="'+inp.l+'"/>';
      rows.appendChild(w);
      w.querySelector('input').addEventListener('input',function(){
        vals[inp.k]=+this.value;d.getElementById('mv_'+inp.k).textContent=inp.f(+this.value);out();
      });
    });
    d.getElementById('mFit').innerHTML=m.fit;
    d.getElementById('mNote').textContent='Defaults are editable assumptions, not benchmarks — drag every slider to your own numbers.';
    out();
  }
  function out(){
    var mo=MODELS[cur].calc(vals);
    d.getElementById('mMo').textContent=fmt(mo);
    d.getElementById('mYr').textContent=fmt(mo*12);
  }
  build();
})();
