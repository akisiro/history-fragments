function matches(e,q,from,to,region){
 const text=[e.title,e.place,e.modern,e.aliases,e.summary,e.date,e.source,e.type,...e.people].join(' ').normalize('NFKC').toLowerCase();
 const terms=q.normalize('NFKC').trim().toLowerCase().split(/\s+/).filter(Boolean);
 return terms.every(term=>text.includes(term)||(/^[-+]?\d{1,4}$/.test(term)&&Number(term)!==0&&Number(term)>=e.start&&Number(term)<=e.end))&&e.start<=to&&e.end>=from&&(!region||e.region===region);
}
if(typeof module!=='undefined')module.exports={matches};
else {
 const $=id=>document.getElementById(id);
 $('about').onclick=$('about2').onclick=()=>$('method').showModal();$('close').onclick=()=>$('method').close();
 $('filters').onsubmit=e=>e.preventDefault();
 $('reset').onclick=()=>{$('query').value='';$('region').value='';$('query').dispatchEvent(new Event('input',{bubbles:true}))};
 document.addEventListener('click',e=>{const chip=e.target.closest('[data-query]');if(chip){$('query').value=chip.dataset.query;$('query').dispatchEvent(new Event('input',{bubbles:true}))}});
 $('history-date').max=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
}
