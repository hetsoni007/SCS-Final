// Phase 1 extractor: live marketing pages -> typed block JSON (content/pages/*.json)
import fs from 'fs'; import * as cheerio from 'cheerio';
const OUT='out/pages'; fs.mkdirSync(OUT,{recursive:true}); fs.mkdirSync('out/scripts',{recursive:true});
const INLINE=new Set(['a','strong','b','em','i','br','code','span','u','small','sup','sub','mark']);
const SKIP=new Set(['svg','script','style','noscript','canvas']);
let $;
const first=e=>(e.attribs?.class||'').split(/\s+/)[0]||'';
const cls=e=>(e.attribs?.class||'').trim();
function inline(el){ // sanitized inline html
  const c=$(el).clone(); c.find('svg,script,style').remove();
  c.find('*').each((i,n)=>{ const keep={}; if(n.tagName==='a'){ if(n.attribs.href)keep.href=n.attribs.href; if(/^https?:/.test(n.attribs.href||''))Object.assign(keep,{target:'_blank',rel:'noopener'});} n.attribs=keep; });
  c.find('span').each((i,n)=>{$(n).replaceWith($(n).html())});
  return (c.html()||'').replace(/\s+/g,' ').trim();
}
const isLeaf=el=>!$(el).find('.btn,.chip,.kw,.cred-chip,img').length&&$(el).find('*').toArray().every(n=>INLINE.has(n.tagName)||SKIP.has(n.tagName));
function form(el){
  const f=$(el).is('form')?$(el):$(el).find('form').first();
  const fields=[]; f.find('input,select,textarea').each((i,n)=>{ const t=n.attribs.type||n.tagName; if(t==='hidden'||$(n).closest('.lb-hp').length)return;
    const id=n.attribs.id; let label=id?f.find(`label[for="${id}"]`).text().trim():''; if(!label)label=$(n).closest('label').text().replace(/\s+/g,' ').trim()||$(n).prev('label').text().trim();
    fields.push({name:n.attribs.name||id,id,type:t,label,placeholder:n.attribs.placeholder,required:'required' in n.attribs,options:n.tagName==='select'?$(n).find('option').toArray().map(o=>$(o).text().trim()):undefined});});
  return {t:'form',id:f.attr('id'),fields,submit:f.find('button').first().text().replace(/\s+/g,' ').trim(),
    kick:$(el).find('.lb-kick').text().trim()||undefined,title:$(el).find('h2,h3').first().text().replace(/\s+/g,' ').trim()||undefined,sub:$(el).find('.lb-sub,.subtitle').first().text().trim()||undefined,
    note:$(el).find('.lb-note,.legal').text().replace(/\s+/g,' ').trim()||undefined,consent:$(el).find('.lb-consent').text().replace(/\s+/g,' ').trim()||undefined,success:inline($(el).find('.lb-ok,.success').first()[0]||'<i/>')||undefined};
}
function blocks(el){
  const out=[]; const kids=$(el).contents().toArray();
  for(const k of kids){
    if(k.type==='text'){ const t=k.data.replace(/\s+/g,' ').trim(); if(t) out.push({t:'text',html:t}); continue; }
    if(k.type!=='tag'||SKIP.has(k.tagName)) continue;
    const tag=k.tagName, c=cls(k), f=first(k);
    if(f==='breadcrumb'||f==='lb-hp'||f==='goodfirm-widget') continue;
    if(/^h[1-6]$/.test(tag)){ out.push({t:'h',level:+tag[1],html:inline(k),cls:c||undefined}); continue; }
    if(tag==='p'){ const h=inline(k); if(h) out.push({t:'p',html:h,cls:c||undefined}); continue; }
    if(tag==='ul'||tag==='ol'){ out.push({t:'list',ordered:tag==='ol',cls:c||undefined,items:$(k).children('li').toArray().map(inline)}); continue; }
    if(tag==='table'){ out.push({t:'table',head:$(k).find('thead th').toArray().map(inline),rows:$(k).find('tbody tr').toArray().map(r=>$(r).children().toArray().map(inline))}); continue; }
    if(tag==='img'){ out.push({t:'img',src:k.attribs.src,alt:k.attribs.alt||'',cls:c||undefined}); continue; }
    if(tag==='form'||f==='leadbox'||f==='scoping-form'||f==='form-card'){ out.push(form(k)); continue; }
    if(f==='faq'){ const item={q:$(k).find('.faq-q').text().replace(/\s+/g,' ').trim(),a:inline($(k).find('.faq-a-inner')[0])}; const last=out[out.length-1]; if(last?.t==='faq')last.items.push(item); else out.push({t:'faq',items:[item]}); continue; }
    if((tag==='a'||tag==='button')&&/\bbtn\b/.test(c)){ const item={label:$(k).text().replace(/\s+/g,' ').trim(),href:k.attribs.href,variant:/primary/.test(c)?'primary':'glass'}; const last=out[out.length-1]; if(last?.t==='buttons')last.items.push(item); else out.push({t:'buttons',items:[item]}); continue; }
    if(f==='chip'||f==='kw'||f==='cred-chip'){ const item={label:$(k).text().trim(),href:k.attribs.href}; const last=out[out.length-1]; if(last?.t==='chips')last.items.push(item); else out.push({t:'chips',items:[item]}); continue; }
    if(f==='eyebrow'||f==='kick'){ out.push({t:'eyebrow',text:$(k).text().replace(/\s+/g,' ').trim()}); continue; }
    if(f==='metric'){ out.push({t:'metric',num:$(k).find('.num').text().trim(),lbl:$(k).find('.lbl').text().trim()}); continue; }
    if(tag==='blockquote'){ out.push({t:'quote',html:inline(k),cls:c||undefined}); continue; }
    if(isLeaf(k)){ const h=inline(k); if(h) out.push({t:'text',html:h,cls:c||undefined,href:tag==='a'?k.attribs.href:undefined}); continue; }
    const ek=$(k).children().toArray().filter(n=>!SKIP.has(n.tagName));
    const sig=n=>n.tagName+'.'+first(n);
    const uniform=tag!=='a'&&ek.length>=2&&ek.every(n=>sig(n)===sig(ek[0]))&&!['p','li','br','span','h3','h4'].includes(ek[0].tagName)&&first(ek[0])!=='faq'&&!/\bbtn\b|chip/.test(cls(ek[0]));
    if(uniform){ out.push({t:'grid',cls:c||undefined,items:ek.map(n=>({cls:cls(n)||undefined,href:n.tagName==='a'?n.attribs.href:undefined,id:n.attribs.id,blocks:blocks(n)}))}); continue; }
    if(/glass|^case$|flip|card|^opt$|model|tier|obs|result|calc-block|q-block|cat-block/.test(c)||tag==='article'||tag==='figure'||tag==='a'){ out.push({t:'panel',cls:c||undefined,href:tag==='a'?k.attribs.href:undefined,id:k.attribs.id,blocks:blocks(k)}); continue; }
    const inner=blocks(k); if(k.attribs.id&&inner.length) out.push({t:'group',id:k.attribs.id,cls:c||undefined,blocks:inner}); else if(c&&inner.length>1&&!/^(wrap|wrap-wide|sec-head|left|right|l|r|body)$/.test(f)) out.push({t:'group',cls:c,blocks:inner}); else out.push(...inner);
  }
  return out;
}
const map=[];
for (const file of fs.readdirSync('raw').filter(f=>f.endsWith('.html')&&!f.startsWith('blog__')&&!['usa.html','hire-developers.html'].includes(f))) {
  $=cheerio.load(fs.readFileSync('raw/'+file,'utf8'));
  const slug=file.replace('.html','');
  const m=n=>$(`meta[name="${n}"]`).attr('content'), og=n=>$(`meta[property="og:${n}"]`).attr('content');
  const meta={title:$('title').text(),description:m('description'),keywords:m('keywords'),robots:m('robots'),canonical:$('link[rel=canonical]').attr('href'),ogTitle:og('title'),ogDescription:og('description'),ogType:og('type')};
  const jsonLd=$('script[type="application/ld+json"]').toArray().map(s=>JSON.parse($(s).html()));
  const breadcrumb=$('main .breadcrumb').first().text().replace(/\s+/g,' ').trim()||undefined;
  const sections=$('main').children().toArray().filter(e=>e.type==='tag'&&!SKIP.has(e.tagName)).map(s=>({id:s.attribs.id,cls:cls(s)||undefined,blocks:blocks(s)})).filter(s=>s.blocks.length);
  const h1el=$('h1').first().clone(); h1el.find('br').replaceWith(' '); const h1=h1el.text().replace(/\s+/g,' ').trim();
  fs.writeFileSync(`${OUT}/${slug}.json`,JSON.stringify({slug,path:slug==='index'?'/':`/${slug}/`,meta,h1,breadcrumb,jsonLd,sections},null,1));
  const sc=$('script:not([src])').toArray().map(s=>$(s).html()).filter(t=>!/Tawk_API|fbq\(|lintrk|scs-theme/.test(t)&&!t.trim().startsWith('{')&&t.length>300);
  if(sc.length) fs.writeFileSync(`out/scripts/${slug}.js`,sc.join('\n\n// -----\n\n'));
  map.push({slug,title:meta.title,h1,canonical:meta.canonical,sections:sections.length});
}
fs.writeFileSync('out/pages-map.json',JSON.stringify(map,null,1));
console.table(map.map(m=>({slug:m.slug,sections:m.sections,h1:m.h1.slice(0,50)})));
