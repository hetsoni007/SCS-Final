// Phase 1 extractor: live blog posts -> MDX (content/blog/*.mdx) + embeds + widget scripts
import fs from 'fs'; import * as cheerio from 'cheerio'; import TurndownService from 'turndown'; import {gfm} from 'turndown-plugin-gfm';
fs.mkdirSync('out/blog',{recursive:true}); fs.mkdirSync('out/blog-embeds',{recursive:true}); fs.mkdirSync('out/blog-scripts',{recursive:true});
const td=new TurndownService({headingStyle:'atx',bulletListMarker:'-',codeBlockStyle:'fenced',emDelimiter:'*'}); td.use(gfm);
td.addRule('drop',{filter:['svg','script','style'],replacement:()=>''});
td.addRule('pre',{filter:'pre',replacement:(c,n)=>'\n\n```'+((n.querySelector&&n.querySelector('code')?.className||'').replace(/.*language-/,'')||'')+'\n'+n.textContent.replace(/\n$/,'')+'\n```\n\n'});
const unesc=s=>s.replace(/‹LT›/g,'&lt;').replace(/‹LB›/g,'&#123;').replace(/‹RB›/g,'&#125;');
const slugify=s=>s.toLowerCase().trim().replace(/[^\w\s-]/g,'').replace(/\s+/g,'-');
const idx=cheerio.load(fs.readFileSync('raw/blog.html','utf8')); const cards={};
idx('a.blog-card, a.featured').each((i,a)=>{ const s=(a.attribs.href||'').replace(/\/$/,'').split('/').pop(); cards[s]={order:i,excerpt:idx(a).find('p').first().text().trim(),cat:idx(a).find('.cat,.article-meta span').first().text().trim(),filter:a.attribs['data-cat']||a.attribs['data-tags'],thumb:idx.html(idx(a).find('svg').first())}; });
const report=[];
for (const file of fs.readdirSync('raw').filter(f=>f.startsWith('blog__'))) {
  const slug=file.slice(6,-5); const $=cheerio.load(fs.readFileSync('raw/'+file,'utf8'));
  const jsonLd=$('script[type="application/ld+json"]').toArray().map(s=>JSON.parse($(s).html()));
  const art=jsonLd.find(j=>/Article|BlogPosting/.test(j['@type']))||{};
  const metaLine=$('.article-meta span').last().text().trim();
  const fm={slug,title:$('h1').first().text().replace(/\s+/g,' ').trim(),metaTitle:$('title').text(),description:$('meta[name=description]').attr('content'),keywords:$('meta[name=keywords]').attr('content'),
    canonical:$('link[rel=canonical]').attr('href'),ogTitle:$('meta[property="og:title"]').attr('content'),ogDescription:$('meta[property="og:description"]').attr('content'),
    categories:$('.article-cat').first().text().split('·').map(s=>s.trim()).filter(Boolean),lead:$('.article-lead').first().text().replace(/\s+/g,' ').trim(),
    author:$('.article-meta span').first().text().trim(),readTime:(metaLine.match(/(\d+) min read/)||[])[0],dateLabel:(metaLine.split('·')[1]||'').trim(),
    datePublished:art.datePublished,dateModified:art.dateModified,excerpt:cards[slug]?.excerpt,indexOrder:cards[slug]?.order,indexFilter:cards[slug]?.filter};
  // text-node escaping for MDX
  $('.article-body').find('*').contents().each((i,n)=>{ if(n.type==='text'&&!$(n).closest('pre,code').length) n.data=n.data.replace(/</g,'‹LT›').replace(/\{/g,'‹LB›').replace(/\}/g,'‹RB›'); });
  let out=[], embeds=0, widget=false, notes=[]; let faq=[];
  const flushFaq=()=>{ if(faq.length){ out.push('<FaqList>\n'+faq.map(f=>`<Faq q=${JSON.stringify(f.q)}>\n\n${f.a}\n\n</Faq>`).join('\n')+'\n</FaqList>'); faq=[]; } };
  for(const el of $('.article-body').children().toArray()){
    const c=(el.attribs.class||'').split(' ')[0], tag=el.tagName;
    if(c!=='faq') flushFaq();
    if(tag==='nav'||c==='article-author') continue;
    if(/^h[23]$/.test(tag)){ const text=$(el).text().trim(); if(tag==='h2'&&el.attribs.id&&slugify(unesc(text).replace(/&[^;]+;/g,''))!==el.attribs.id) notes.push(`id-mismatch:${el.attribs.id}`); out.push(td.turndown($.html(el))); continue; }
    if(c==='article-callout'){ out.push('<Callout>\n\n'+td.turndown($(el).html())+'\n\n</Callout>'); continue; }
    if(c==='dtool'){ out.push(`<Widget post="${slug}" />`); widget=true; fs.writeFileSync(`out/blog-embeds/${slug}.widget.html`,unesc($.html(el)).replace(/&lt;/g,'<')); continue; }
    if(c==='faq'){ faq.push({q:unesc($(el).find('.faq-q').text().replace(/\s+/g,' ').trim()).replace(/&lt;/g,'<').replace(/&#123;/g,'{').replace(/&#125;/g,'}'),a:td.turndown($(el).find('.faq-a-inner').html())}); continue; }
    if(['p','ul','ol','blockquote','pre','table','h4'].includes(tag)){ out.push(td.turndown($.html(el))); continue; }
    if(tag==='div'&&$(el).children().length===1&&$(el).children('table').length){ out.push(td.turndown($.html($(el).children('table')))); continue; }
    embeds++; const id=`${slug}-${embeds}`; fs.writeFileSync(`out/blog-embeds/${id}.html`,$.html(el).replace(/‹LT›/g,'&lt;').replace(/‹LB›/g,'{').replace(/‹RB›/g,'}')); out.push(`<Embed id="${id}" />`); notes.push(`embed:${tag}.${el.attribs.class||''}`);
  }
  flushFaq();
  const sc=$('script:not([src])').toArray().map(s=>$(s).html()).filter(t=>!/Tawk_API|fbq\(|lintrk|scs-theme/.test(t)&&!t.trim().startsWith('{')&&t.length>300);
  if(sc.length) fs.writeFileSync(`out/blog-scripts/${slug}.js`,sc.join('\n\n// -----\n\n'));
  const cta=$('main > section').toArray().map(s=>$(s).find('.glass h2').first().text().trim()).filter(Boolean)[0];
  fm.cta={heading:cta,body:$('main .glass h2').first().next('p').text().trim(),buttons:$('main .glass h2').first().parent().find('a.btn').toArray().map(a=>({label:$(a).text().trim(),href:a.attribs.href}))};
  fm.related=$('main .blog-grid a').toArray().map(a=>a.attribs.href.replace(/\/$/,'').split('/').pop());
  fm.hasWidget=widget;
  fs.writeFileSync(`out/blog/${slug}.mdx`,'---\n'+Object.entries(fm).filter(([,v])=>v!==undefined).map(([k,v])=>`${k}: ${JSON.stringify(v)}`).join('\n')+'\n---\n\n'+unesc(out.join('\n\n'))+'\n');
  fs.writeFileSync(`out/blog-embeds/${slug}.jsonld.json`,JSON.stringify(jsonLd,null,1));
  if(cards[slug]?.thumb) fs.writeFileSync(`out/blog-embeds/${slug}.thumb.svg`,cards[slug].thumb);
  report.push({slug:slug.slice(0,38),date:fm.datePublished,label:fm.dateLabel,read:fm.readTime,w:widget?'Y':'',notes:notes.join(' ').slice(0,90)});
}
console.table(report);
