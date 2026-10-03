
(function(){
  var ITEMS=[
    {t:"Quality hosting, not bargain shared",d:"Managed WordPress or VPS hosting with server-level caching and PHP 8+ — not a \u20B999/month shared plan."},
    {t:"Page caching is active",d:"A caching plugin or host-level page cache serves prebuilt pages instead of rebuilding every request."},
    {t:"Images are optimised",d:"WebP format, sized to display dimensions, lazy-loaded below the fold — not full-size camera uploads."},
    {t:"Plugins are audited",d:"Every active plugin earns its place; unused ones deleted (not just deactivated); no overlapping duplicates."},
    {t:"A CDN serves your assets",d:"Static files delivered from edge locations near your visitors — critical for India\u2019s mobile networks."},
    {t:"Core Web Vitals pass on mobile",d:"Green LCP/CLS/INP in PageSpeed Insights on mobile, not just desktop."},
    {t:"SEO basics are wired up",d:"Unique titles and meta descriptions, an XML sitemap submitted to Google Search Console, clean permalinks."},
    {t:"Schema markup exists",d:"Structured data for your business/products so Google (and AI search) understands the site."},
    {t:"HTTPS everywhere, no mixed content",d:"Valid SSL, all assets over HTTPS, HTTP redirecting to HTTPS."},
    {t:"Old URLs redirect after changes",d:"Any rebuild/migration preserved URLs or 301-redirected old ones \u2014 no ranking thrown away."}
  ];
  var d=document,list=d.getElementById('aList'),answers=new Array(ITEMS.length).fill(null);
  var OPTS=[["Yes",2],["Partly",1],["No",0]];
  ITEMS.forEach(function(it,idx){
    var el=d.createElement('div');el.className='aitem';
    var btns=OPTS.map(function(o){return '<button type="button" class="ab" data-i="'+idx+'" data-v="'+o[1]+'">'+o[0]+'</button>';}).join('');
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
    d.getElementById('aFill').style.width=pct+'%';
    d.getElementById('aScore').textContent=done===ITEMS.length?pct+'/100':'\u2026';
    if(done===ITEMS.length){
      var v=d.getElementById('aVerdict');v.classList.add('on');
      var t,x;
      if(pct>=80){t='Solid: '+pct+'/100';x='Your site\u2019s foundations look good. Keep plugins updated, re-run this quarterly, and consider a professional Core Web Vitals pass to squeeze out the rest.';}
      else if(pct>=50){t='Gaps to close: '+pct+'/100';x='Real gaps, but fixable ones. Start with hosting and caching \u2014 they\u2019re the biggest wins \u2014 then images, then the plugin audit. Most of this is days of work, not a rebuild.';}
      else{t='Losing customers: '+pct+'/100';x='At this score your site is actively costing you speed, rankings and conversions. The fixes are well-understood \u2014 hosting, caching, images, redirects \u2014 and a focused rescue usually beats starting over.';}
      d.getElementById('avTitle').textContent=t;d.getElementById('avText').textContent=x;
      if(window.scsTrack)scsTrack('wp_speed_audit_result',{score:pct});
      v.scrollIntoView({behavior:'smooth',block:'nearest'});
    }
  }
})();
