// Extracts blog widget data (questions, weights, verdicts) from the live site's inline scripts into JSON.
import fs from 'fs'; import vm from 'vm'; import * as cheerio from 'cheerio';
const OUT='../site/content/widgets'; fs.mkdirSync(OUT,{recursive:true});
const S=s=>fs.readFileSync(`out/blog-scripts/${s}.js`,'utf8'), H=s=>cheerio.load(fs.readFileSync(`out/blog-embeds/${s}.widget.html`,'utf8'));
const ev=code=>{const w={}; const ctx={window:w}; vm.runInNewContext(code,ctx); return ctx;};
const ctas=$=>$('.cta-row a').toArray().map(a=>({label:$(a).text().trim(),href:a.attribs.href,primary:/btn-primary/.test(a.attribs.class)}));
const save=(slug,d)=>{fs.writeFileSync(`${OUT}/${slug}.json`,JSON.stringify(d,null,1)); console.log(slug, d.type, Object.keys(d).join(','));};

for(const slug of ['can-ai-build-my-app','kotlin-multiplatform-vs-react-native','react-native-new-architecture-2026','super-app-development']){
  const src=S(slug), $=H(slug);
  const data=src.split('\n').filter(l=>/^window\.__(KEYS|R|Q)=/.test(l)).join('\n');
  const {window:w}=ev(data);
  const cta=/<a class="btn btn-primary" href="([^"]+)"[^>]*>(.*?)<\/a>/.exec(src);
  save(slug,{type:'quiz',kick:$('.kick').text().trim(),keys:w.__KEYS,results:w.__R,questions:w.__Q,cta:{href:cta[1],label:cheerio.load(cta[2]).text()},badge:/<span class="badge">(.*?)<\/span>/.exec(src)[1]});
}
for(const slug of ['dpdp-act-app-compliance-india','rbi-fintech-app-compliance-india']){
  const src=S(slug), $=H(slug);
  const {window:w}=ev(src.split('\n').filter(l=>/^window\.__BANDS=/.test(l)).join('\n'));
  save(slug,{type:'checklist',kick:$('.kick').text().trim(),bands:w.__BANDS,items:$('.ci').toArray().map(c=>{const tx=$(c).find('.tx'); const small=tx.find('small').text().trim(); tx.find('small').remove(); return {t:tx.text().trim(),s:small};}),footnote:$('.dtool > p').text().trim()});
}
for(const slug of ['mobile-app-security-checklist','wordpress-seo-speed-checklist']){
  const src=S(slug), $=H(slug);
  const items=vm.runInNewContext('('+/var ITEMS=(\[[\s\S]*?\]);/.exec(src)[1]+')');
  const opts=vm.runInNewContext('('+/var OPTS=(\[.*?\]\]);/.exec(src)[1]+')');
  const v=[...src.matchAll(/(?:if|else if)\(pct>=(\d+)\)\{t='(.*?)'\+pct\+'\/100';x='((?:[^'\\]|\\.)*)';\}/g)].map(m=>({min:+m[1],title:m[2],text:m[3].replace(/\\'/g,"'")}));
  const e=/else\{t='(.*?)'\+pct\+'\/100';x='((?:[^'\\]|\\.)*)';\}/.exec(src);
  v.push({min:0,title:e[1],text:e[2].replace(/\\'/g,"'")});
  save(slug,{type:'audit',kick:$('.kick').text().trim(),items,options:opts,verdicts:v,ctas:ctas($)});
}
for(const slug of ['mvp-tech-stack-2026','native-vs-cross-platform-2026','wordpress-vs-custom-website']){
  const src=S(slug), $=H(slug);
  const chunk=src.slice(src.indexOf('var Q='),src.indexOf('var d=document'));
  const ctx={}; vm.runInNewContext(chunk+';this.Q=Q;this.VERD=VERD;',ctx);
  const labels=/var labels=(\{.*?\});/.exec(src);
  save(slug,{type:'wizard',kick:$('.kick').text().trim(),badge:$('.badge').text().trim(),questions:ctx.Q,verdicts:ctx.VERD,barLabels:labels?vm.runInNewContext('('+labels[1]+')'):undefined,ctas:ctas($)});
}
for(const slug of ['app-monetization-models','wordpress-website-cost-india','react-native-push-notifications','woocommerce-payment-gateway-india']){
  const $=H(slug);
  save(slug,{type:'custom',kick:$('.kick').text().trim(),note:$('.mnote').text().trim(),ctas:ctas($),cards:$('.gwcard').toArray().map(c=>({id:c.attribs.id,name:$(c).find('.nm').text(),sub:$(c).find('.sub').html()})),out:$('.mcard .k').toArray().map(k=>$(k).text())});
}
