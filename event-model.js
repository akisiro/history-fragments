(function(root){
 const normalize=s=>String(s||'').normalize('NFKC').toLowerCase().replace(/[\s《》「」“”"'·_—–-]/g,'');
 function remember(list,event){return [event,...list.filter(x=>x.id!==event.id&&normalize(x.title)!==normalize(event.title))].slice(0,9)}
 function timeValue(value){const m=/^([+-])(\d+)-(\d{2})-(\d{2})T/.exec(value?.time||'');if(!m)return null;const y=Number(m[2])*(m[1]==='-'?-1:1);if(!y||!Number.isSafeInteger(y))return null;const precision=Number(value.precision);if(precision<9)return null;const mo=Number(m[3]),d=Number(m[4]);return {year:y,iso:precision>=11&&mo&&d&&y>0?`${String(y).padStart(4,'0')}-${m[3]}-${m[4]}`:null,label:`${y<0?'公元前 '+(-y):y}年${precision>=10&&mo?mo+'月':''}${precision>=11&&d?d+'日':''}`,precision,calendar:value.calendarmodel||'',approx:!!(value.before||value.after)};}
 function notFuture(event,now=new Date()){const currentYear=Number(new Intl.DateTimeFormat('en',{timeZone:'Asia/Shanghai',year:'numeric'}).format(now));if(Number.isFinite(event.start)&&event.start>currentYear)return false;if(event.iso&&event.iso>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(now))return false;return true;}
 const api={normalize,remember,timeValue,notFuture};if(typeof module!=='undefined')module.exports=api;else root.HistoryModel=api;
})(typeof window!=='undefined'?window:this);
