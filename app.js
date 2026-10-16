const $ = id => document.getElementById(id);
const year = n => n < 0 ? `前 ${-n}` : `${n}`;
function matches(e,q,from,to,region){
 const text=[e.title,e.place,e.modern,e.aliases,e.summary,e.date,e.source,e.type,...e.people].join(' ').normalize('NFKC').toLowerCase();
 const terms=q.normalize('NFKC').trim().toLowerCase().split(/\s+/).filter(Boolean);
 return terms.every(term=>text.includes(term)||(/^[-+]?\d{1,4}$/.test(term)&&Number(term)!==0&&Number(term)>=e.start&&Number(term)<=e.end))&&e.start<=to&&e.end>=from&&(!region||e.region===region);
}
if(typeof module!=='undefined') module.exports={matches};
else {
let visible=[...events],selected='gutenberg';
const feedback=document.createElement('section');feedback.id='search-feedback';feedback.setAttribute('aria-live','polite');$('validation').after(feedback);
function searchFeedback(){
 const q=$('query').value.trim();const from=$('from').value,to=$('to').value,region=$('region').value;
 const limits=[from||to?`年份：${from||'不限'} 至 ${to||'不限'}`:'',region?`地区：${region}`:''].filter(Boolean);
 feedback.replaceChildren();
 const status=document.createElement('p');status.textContent=`找到 ${visible.length} 条精选记录`+(limits.length?` · 当前限制：${limits.join('；')}`:' · 全部年份与地区');feedback.append(status);
 if(q&&visible.length){const row=document.createElement('div');row.className='quick-results';visible.forEach(e=>{const b=document.createElement('button');b.type='button';b.dataset.id=e.id;b.textContent=`${e.title} · ${e.date}`;row.append(b)});feedback.append(row)}
 if(!visible.length){const globalCount=events.filter(e=>matches(e,q,-Infinity,Infinity,'')).length;const hint=document.createElement('p');hint.textContent=globalCount?`这条线索在全部数据中有 ${globalCount} 条记录，被当前年份或地区限制排除了。`:'当前仅有 8 条精选记录，暂未收录匹配内容。可试试：秦始皇、敦煌、印刷、库克、1776。';feedback.append(hint);}
 if(limits.length){const clear=document.createElement('button');clear.type='button';clear.textContent='清除年份和地区限制';clear.onclick=()=>{$('from').value='';$('to').value='';$('region').value='';filter()};feedback.append(clear)}
}
const project=(lon,lat)=>[(lon+180)/360*1000,(90-lat)/180*500];
// Original coarse continent outlines: illustrative geography, no borders.
const outlines=[ [[-168,70],[-140,72],[-125,60],[-115,52],[-125,45],[-120,33],[-105,22],[-96,18],[-87,15],[-82,9],[-77,9],[-83,20],[-80,25],[-81,32],[-70,45],[-58,50],[-62,60],[-85,68],[-110,72]], [[-73,59],[-45,59],[-20,75],[-40,83],[-60,79]], [[-81,12],[-65,9],[-50,1],[-35,-7],[-40,-23],[-52,-35],[-66,-55],[-74,-47],[-74,-20],[-80,-3]], [[-10,36],[-10,44],[-4,49],[9,55],[6,60],[20,71],[30,70],[30,60],[45,65],[60,70],[100,77],[145,70],[178,65],[165,55],[142,48],[138,37],[125,25],[120,10],[108,0],[100,8],[98,20],[85,22],[78,7],[70,24],[55,26],[45,13],[35,31],[28,40],[15,37]], [[-17,35],[10,37],[32,31],[43,12],[51,12],[42,-10],[33,-27],[18,-35],[12,-20],[8,-3],[-6,5],[-16,15]], [[113,-22],[122,-14],[135,-12],[142,-10],[154,-25],[151,-36],[136,-38],[115,-34]], [[47,-13],[51,-16],[49,-25],[44,-25]], [[130,32],[140,42],[144,44],[142,35]], [[166,-35],[175,-40],[171,-47],[165,-45]] ];
$('land').innerHTML=outlines.map(poly=>`<polygon points="${poly.map(([lon,lat])=>project(lon,lat).join(',')).join(' ')}"/>`).join('');
function render(){
$('count').textContent=`${visible.length} / ${events.length} 条精选事件`;
$('results').innerHTML=visible.length?visible.map(e=>`<button class="event-card ${e.id===selected?'active':''}" data-id="${e.id}" aria-pressed="${e.id===selected}"><small>${e.date} · ${e.precision}</small><strong>${e.title}</strong><span class="meta">${e.region} / ${e.place}　↗</span></button>`).join(''):'<p class="empty">没有匹配的精选记录。试试扩大年份范围或重置筛选；这不代表该时期没有历史事件。</p>';
$('markers').innerHTML=visible.map(e=>{const [x,y]=project(e.lon,e.lat);return `<g class="marker ${selected===e.id?'selected':''}" data-id="${e.id}" tabindex="0" role="button" aria-label="${e.date}，${e.title}" aria-pressed="${selected===e.id}" transform="translate(${x},${y})"><title>${e.title} · ${e.place}</title><circle r="${selected===e.id?10:7}"/>${selected===e.id?`<text x="14" y="-12">${e.place}</text>`:''}</g>`}).join('');
const lo=visible.length?Math.min(...visible.map(e=>e.start)):0, hi=visible.length?Math.max(...visible.map(e=>e.end)):1;
const pos=n=>hi===lo?50:4+(n-lo)/(hi-lo)*92;
$('timeline').innerHTML=visible.map(e=>`${e.start!==e.end?`<div class="interval" style="left:${pos(e.start)}%;width:${Math.max(.5,pos(e.end)-pos(e.start))}%"></div>`:''}<button data-id="${e.id}" class="${e.id===selected?'active':''}" style="left:${pos(e.start)}%" aria-label="${e.title}，${e.date}"><span>${e.date}</span></button>`).join('');
const e=visible.find(e=>e.id===selected);
if(!e){$('detail').innerHTML='<div class="eyebrow">EVENT NOTES</div><h2>等待下一条历史线索</h2><p>调整检索条件后，选择事件查看详情和出处。</p>';return}
const peers=people.filter(p=>p.birth<=e.end&&p.death>=e.start&&!e.people.includes(p.name));
$('detail').innerHTML=`<div class="eyebrow">EVENT NOTES / 历史碎片</div><div class="detail-date">${e.date}</div><span class="badge">${e.precision}</span><span class="badge">${e.category}</span><h2>${e.title}</h2><p>${e.summary}</p><div class="detail-block"><h3>地点 · 古今对照</h3><p><b>${e.place}</b><br>${e.modern}</p></div><div class="detail-block"><h3>年代与解释边界</h3><p>${e.note}</p></div><div class="detail-block"><h3>事件相关人物</h3><p>${e.people.join('、')||'当前来源未明确列出个人，不推测补齐。'}</p></div><div class="detail-block"><h3>同时代人物 · 样本推算</h3><small>按生卒区间相交；不代表参与事件。生卒证据待补。</small>${peers.length?peers.map(p=>`<span class="peer">${p.name} <small>${p.approx?'约 ':''}${year(p.birth)}—${year(p.death)}</small></span>`).join(''):'<p>当前人物样本中没有额外匹配。</p>'}</div><div class="detail-block"><h3>史料与研究来源</h3><small>${e.type} · 事件已对照机构资料</small><p><a href="${e.url}" target="_blank" rel="noopener noreferrer">${e.source} ↗</a></p><small>人工摘要 · 2026-10-16 整理</small></div>`;
}
function filter(){const a=$('from').value.trim(),b=$('to').value.trim();const from=a===''?-Infinity:Number(a),to=b===''?Infinity:Number(b);if((a!==''&&(!Number.isInteger(from)||from===0||from< -5000||from>2100))||(b!==''&&(!Number.isInteger(to)||to===0||to< -5000||to>2100))||from>to){$('validation').textContent='请输入 -5000 到 2100 之间的整数年份（无公元 0 年），且起始年份不晚于结束年份。';return} $('validation').textContent='';visible=events.filter(e=>matches(e,$('query').value.trim(),from,to,$('region').value)).sort((a,b)=>a.start-b.start);if(!visible.some(e=>e.id===selected))selected=visible[0]?.id;render();searchFeedback()}
$('filters').addEventListener('submit',e=>{e.preventDefault();filter();if(!$('validation').textContent)feedback.scrollIntoView({behavior:'smooth',block:'nearest'})});$('query').addEventListener('input',filter);$('region').addEventListener('change',filter);$('from').addEventListener('input',filter);$('to').addEventListener('input',filter);$('query').addEventListener('compositionend',filter);
$('reset').onclick=()=>{HTMLFormElement.prototype.reset.call($('filters'));selected='gutenberg';filter()};
document.addEventListener('click',e=>{const target=e.target.closest('[data-id]');if(target){selected=target.dataset.id;render();if(innerWidth<740)$('detail').scrollIntoView({behavior:'smooth',block:'start'})}const chip=e.target.closest('[data-query],[data-range]');if(chip){HTMLFormElement.prototype.reset.call($('filters'));if(chip.dataset.query)$('query').value=chip.dataset.query;else [$('from').value,$('to').value]=chip.dataset.range.split(',');filter()}});
$('markers').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.target.closest('[data-id]')?.dispatchEvent(new MouseEvent('click',{bubbles:true}))}});
$('about').onclick=$('about2').onclick=()=>$('method').showModal();$('close').onclick=()=>$('method').close();filter();
}


