(function(){
 const sources={
  zhwiki:{name:'中文维基百科',host:'https://zh.wikipedia.org',kind:'wiki',lang:'zh'},
  enwiki:{name:'英文维基百科',host:'https://en.wikipedia.org',kind:'wiki',lang:'en'},
  wikidata:{name:'Wikidata',host:'https://www.wikidata.org',kind:'data',lang:'zh'}
 };
 function requestUrl(key,query){const s=sources[key];if(!s)throw new Error('Unknown source');const params=new URLSearchParams(s.kind==='wiki'?{action:'query',list:'search',srsearch:query,srlimit:'5',srnamespace:'0',srprop:'snippet|timestamp',format:'json',origin:'*'}:{action:'wbsearchentities',search:query,language:s.lang,uselang:'zh',limit:'5',type:'item',format:'json',origin:'*'});return `${s.host}/w/api.php?${params}`}
 function records(key,data){if(data.error)throw new Error('Source returned an error');const s=sources[key];const list=s.kind==='wiki'?data.query?.search:data.search;if(!Array.isArray(list))throw new Error('Unexpected response');return list.map(r=>s.kind==='wiki'?{title:r.title,description:r.snippet||'',url:`${s.host}/?curid=${encodeURIComponent(r.pageid)}`,updated:r.timestamp||'',html:true}:{title:r.label||r.id,description:r.description||'此条目暂无中文描述。',url:`https://www.wikidata.org/wiki/${encodeURIComponent(r.id)}`,id:r.id,html:false})}
 if(typeof module!=='undefined'){module.exports={requestUrl,records,sources};return}
 const panel=document.getElementById('online-search');const result= document.getElementById('online-results');const query=document.getElementById('query');
 let timer,version=0,active=[],last='';const cache=new Map();
 function el(tag,text,className){const n=document.createElement(tag);if(text)n.textContent=text;if(className)n.className=className;return n}
 function link(text,url){const a=el('a',text);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a}
 function textOnly(raw){return new DOMParser().parseFromString(raw,'text/html').body.textContent||''}
 function cancel(){clearTimeout(timer);version++;active.forEach(c=>c.abort());active=[]}
 function sourceKeys(){return [...panel.querySelectorAll('input[type=checkbox]:checked')].map(n=>n.value)}
 function renderRows(box,key,rows){box.replaceChildren(el('h3',`${sources[key].name} · ${rows.length} 条`));if(!rows.length)box.append(el('p','该来源未找到匹配条目，可更换关键词或语言。'));rows.forEach(r=>{const article=el('article',null,'online-card');article.append(link(r.title+' ↗',r.url));article.append(el('p',r.html?textOnly(r.description):r.description));article.append(el('small',r.updated?`原条目更新：${r.updated.slice(0,10)}`:`实体编号：${r.id}`));box.append(article)});box.append(el('small',key==='wikidata'?'Wikidata 结构化数据：CC0；请检查属性所附参考文献。':'维基百科搜索摘要：CC BY-SA；作者及修订历史见原条目。'))}
 function directLinks(q){const nav=el('div',null,'source-links');nav.append(link('在中文维基百科搜索 ↗',`https://zh.wikipedia.org/w/index.php?search=${encodeURIComponent(q)}`),link('在英文维基百科搜索 ↗',`https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(q)}`),link('在 Wikidata 搜索 ↗',`https://www.wikidata.org/w/index.php?search=${encodeURIComponent(q)}`));return nav}
 async function run(force=false){cancel();const q=query.value.trim();const keys=sourceKeys();const identity=JSON.stringify([q,keys]);last=identity;
 result.replaceChildren();if(!q){result.append(el('p','输入关键词后，自动从所选来源检索。'));return}if(!keys.length){result.append(el('p','请至少选择一个在线来源。本地精选仍可正常检索。'));return}if(q.length<2&&!/^\d$/.test(q)){result.append(el('p','请输入至少两个字符。'));return}
 const ticket=version;result.append(directLinks(q));
 await Promise.allSettled(keys.map(async key=>{const box=el('section',null,'source-group');box.append(el('h3',sources[key].name),el('p','正在检索…'));result.append(box);const cacheKey=key+':'+q;const hit=cache.get(cacheKey);if(!force&&hit&&Date.now()-hit.time<300000){renderRows(box,key,hit.rows);return}const controller=new AbortController();active.push(controller);const timeout=setTimeout(()=>controller.abort(),12000);
 try{const response=await fetch(requestUrl(key,q),{signal:controller.signal,credentials:'omit',referrerPolicy:'no-referrer'});if(!response.ok)throw new Error(`HTTP ${response.status}`);const rows=records(key,await response.json());if(ticket!==version)return;cache.set(cacheKey,{time:Date.now(),rows});if(cache.size>60)cache.delete(cache.keys().next().value);renderRows(box,key,rows)}catch(error){if(ticket!==version)return;box.replaceChildren(el('h3',sources[key].name),el('p','暂时无法连接此来源，可能受网络、访问限制或服务限流影响。可使用上方原站搜索链接，或稍后重试。','online-error'))}finally{clearTimeout(timeout)}}));
 }
 function schedule(){cancel();const q=query.value.trim();if(!q){result.replaceChildren(el('p','输入关键词后，自动从所选来源检索。'));return}result.replaceChildren(el('p','准备检索在线来源…'));timer=setTimeout(()=>run(),600)}
 query.addEventListener('input',e=>{if(!e.isComposing)schedule()});query.addEventListener('compositionend',schedule);panel.querySelectorAll('input[type=checkbox]').forEach(n=>n.addEventListener('change',()=>run()));document.getElementById('online-retry').onclick=()=>run(true);
 document.getElementById('filters').addEventListener('submit',()=>run());document.addEventListener('click',e=>{if(e.target.closest('[data-query],[data-range],#reset'))schedule()});run();
})();
