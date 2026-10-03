
(function(){
  function fmtINR(n){
    n=Math.round(n/1000)*1000;
    if(n>=100000){return '₹'+(n/100000).toFixed(n%100000===0?0:1)+'L';}
    return '₹'+n.toLocaleString('en-IN');
  }
  var MODELS={
    biz:{name:"Business Website",
      inputs:[
        {k:"pages",l:"Number of pages",min:3,max:25,step:1,v:8,f:function(x){return x+' pages';}},
        {k:"tier",l:"Design level",min:0,max:2,step:1,v:0,f:function(x){return ["Template-based","Semi-custom","Fully custom"][x];}}],
      calc:function(v){
        var tiers=[{base:22000,per:2500},{base:45000,per:4200},{base:95000,per:7000}];
        var t=tiers[v.tier];
        var low=t.base+v.pages*t.per*0.75;
        var high=t.base+v.pages*t.per*1.6;
        return [low,high];
      },
      fit:function(v){
        var names=["a template-based site","a semi-custom design","a fully custom design"];
        return "<b>At "+v.pages+" pages with "+names[v.tier]+":</b> this is a typical range for a business website of this scope in the current India market.";
      }},
    store:{name:"WooCommerce Store",
      inputs:[
        {k:"products",l:"Number of products",min:10,max:500,step:10,v:50,f:function(x){return x.toLocaleString('en-IN');}},
        {k:"custom",l:"Custom features (multiple gateways, shipping rules, integrations)",min:0,max:1,step:1,v:0,f:function(x){return x?"Yes":"No, standard setup";}}],
      calc:function(v){
        var low=65000+v.products*450+(v.custom?30000:0);
        var high=140000+v.products*950+(v.custom?70000:0);
        return [low,high];
      },
      fit:function(v){
        return "<b>At "+v.products.toLocaleString('en-IN')+" products"+(v.custom?" with custom integrations":"")+":</b> this reflects typical India pricing for a WooCommerce build of this scope, including payment gateway setup.";
      }}
  };
  var d=document,cur='biz',vals={};
  var tabs=d.getElementById('mTabs'),rows=d.getElementById('mRows');
  Object.keys(MODELS).forEach(function(k){
    var b=d.createElement('button');b.type='button';b.className='mtab'+(k===cur?' on':'');b.textContent=MODELS[k].name;b.dataset.k=k;
    b.onclick=function(){cur=k;tabs.querySelectorAll('.mtab').forEach(function(x){x.classList.remove('on');});b.classList.add('on');build();if(window.scsTrack)scsTrack('wp_cost_calc_view',{model:k});};
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
    out();
  }
  function out(){
    var r=MODELS[cur].calc(vals);
    d.getElementById('mRange').textContent=fmtINR(r[0])+' – '+fmtINR(r[1]);
    d.getElementById('mFit').innerHTML=MODELS[cur].fit(vals);
    d.getElementById('mNote').textContent='Drag the sliders to match your project — this is a market-range estimate, not our quote.';
  }
  build();
})();
