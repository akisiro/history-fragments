(function(root){
 const groups=['中国地区','日本地区','亚洲其他地区','欧洲','非洲','北美洲','南美洲','大洋洲','地点待确认'];
 const continents={Q48:'亚洲',Q46:'欧洲',Q15:'非洲',Q49:'北美洲',Q18:'南美洲',Q538:'大洋洲'};
 function chineseNumber(s){if(/^\d+$/.test(s))return Number(s);const digits={'零':0,'〇':0,'一':1,'二':2,'两':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9};if(/^[零〇一二两三四五六七八九]+$/.test(s))return Number([...s].map(c=>digits[c]).join(''));let total=0,n=0;for(const c of s){if(c in digits)n=digits[c];else if(c==='十'||c==='百'||c==='千'){total+=(n||1)*({'十':10,'百':100,'千':1000}[c]);n=0}else return NaN}return total+n;}
 function atom(text,inherit=false){let s=text.trim(),negative=/^(公元前|前|-)/.test(s)||/\s*(BCE|BC)$/i.test(s),positive=/^(公元(?!前)|CE|AD|\+)/i.test(s)||/\s*(CE|AD)$/i.test(s);s=s.replace(/^(公元前|公元|前|BCE|BC|CE|AD|[+-])/i,'').replace(/年|\s*(BCE|BC|CE|AD)$/gi,'').trim();const n=chineseNumber(s);if(!Number.isInteger(n)||n<1||n>9999)return null;return (negative||inherit&&!positive?-1:1)*n;}
 const yearLabel=y=>y<0?`公元前 ${-y} 年`:`公元 ${y} 年`;
 function parse(text,now=new Date()){
  const s=String(text||'').normalize('NFKC').trim().replace(/\s+/g,' '),today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(now),current=Number(today.slice(0,4));if(!s)return null;
  const date=/^(\d{1,4})[-年/](\d{1,2})[-月/](\d{1,2})日?$/.exec(s);if(date){const[y,m,d]=date.slice(1).map(Number);const days=[31,y%4===0&&(y%100!==0||y%400===0)?29:28,31,30,31,30,31,31,30,31,30,31];const iso=String(y).padStart(4,'0')+'-'+String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0');if(y<1||m<1||m>12||d<1||d>days[m-1])return {error:'请输入有效日期，2月29日需选择闰年。'};if(iso>today)return {error:'日期不能晚于今天。'};return {kind:'date',iso,start:y,end:y,label:yearLabel(y)+m+'月'+d+'日'};}
  const century=/^(公元前|前|公元)?\s*(?:第)?\s*([\d零〇一二两三四五六七八九十百]+)\s*世纪$/.exec(s);let start,end,kind='year';
  if(century){const n=chineseNumber(century[2]);if(!Number.isInteger(n)||n<1||n>99)return {error:'请输入1至99之间的世纪，无第0世纪。'};const bc=century[1]==='公元前'||century[1]==='前';start=bc?-n*100:(n-1)*100+1;end=bc?-((n-1)*100+1):n*100;kind='century';}
  else {const token='(?:公元前|公元|前|BCE|BC|CE|AD)?\\s*[+-]?[\\d零〇一二两三四五六七八九十百千]+\\s*年?\\s*(?:BCE|BC|CE|AD)?';const range=new RegExp('^('+token+')\\s*(?:至|到|[~～—–-])\\s*('+token+')$','i').exec(s);if(range){start=atom(range[1]);end=atom(range[2],start<0);kind='range';if(start===null||end===null)return {error:'年份需为1至9999的整数，负数或“公元前”表示公元前，无公元0年。'};}else{if(!new RegExp('^'+token+'$','i').test(s))return null;start=end=atom(s);if(start===null)return {error:'请输入有效年份，无公元0年。'};}}
  if(start>end)return {error:'起始时间应早于结束时间；例如公元前221年至前206年。'};if(start>current)return {error:'历史检索不能从未来年份开始。'};const clipped=end>current;end=Math.min(end,current);return {kind,start,end,today,clipped,label:start===end?yearLabel(start):`${yearLabel(start)}—${yearLabel(end)}`,reference:start};
 }
 function intersects(e,range){return Number.isFinite(e.start)&&Number.isFinite(e.end)&&e.start<=range.end&&e.end>=range.start;}
 function group(e){if(e.sliceGroup&&groups.includes(e.sliceGroup))return e.sliceGroup;if(e.countryId==='Q148')return '中国地区';if(e.countryId==='Q17')return '日本地区';if(e.region==='亚洲')return /中国|中國|敦煌|咸阳|虎门/.test([e.modern,e.place].join(' '))?'中国地区':/日本/.test([e.modern,e.place].join(' '))?'日本地区':'亚洲其他地区';return groups.includes(e.region)?e.region:'地点待确认';}
 const isoYear=y=>(y<0?'-':'')+String(Math.abs(y)).padStart(4,'0');
 function query(range,continent){if(!Number.isInteger(range.start)||!Number.isInteger(range.end)||range.start===0||range.end===0||range.start>range.end||!continents[continent])throw Error('Invalid time range or continent');return `SELECT DISTINCT ?event ?eventLabel ?eventDescription ?time ?precision ?calendar ?endTime ?endPrecision ?place ?placeLabel ?country ?countryLabel ?lat ?lon WHERE {
 ?event (p:P585/psv:P585|p:P580/psv:P580) ?timeNode . ?timeNode wikibase:timeValue ?time; wikibase:timePrecision ?precision; wikibase:timeCalendarModel ?calendar . FILTER(?precision >= 9)
 OPTIONAL { ?event p:P582/psv:P582 ?endNode . ?endNode wikibase:timeValue ?endTime; wikibase:timePrecision ?endPrecision . FILTER(?endPrecision >= 9) }
 FILTER(?time <= "${isoYear(range.end)}-12-31T23:59:59Z"^^xsd:dateTime && COALESCE(?endTime,?time) >= "${isoYear(range.start)}-01-01T00:00:00Z"^^xsd:dateTime)
 ?event wdt:P31/wdt:P279* wd:Q1656682; (wdt:P276|wdt:P17) ?place .
 ?place (wdt:P17|wdt:P131)*/wdt:P30 wd:${continent} . OPTIONAL { ?place wdt:P17 ?country }
 OPTIONAL { ?place p:P625/psv:P625 ?coord . ?coord wikibase:geoGlobe wd:Q2; wikibase:geoLatitude ?lat; wikibase:geoLongitude ?lon . }
 SERVICE wikibase:label { bd:serviceParam wikibase:language "zh,en". }
 } ORDER BY ?time LIMIT 24`;}
 const api={groups,continents,chineseNumber,parse,yearLabel,intersects,group,query};if(typeof module!=='undefined')module.exports=api;else root.WorldSliceModel=api;
})(typeof window!=='undefined'?window:this);
