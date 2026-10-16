(()=>{
 const $=id=>document.getElementById(id);
 function toggle(button,panel){$(button).onclick=()=>{const open=$(panel).hidden;$(panel).hidden=!open;$(button).setAttribute('aria-expanded',String(open));if(open)$(panel).scrollIntoView({behavior:'smooth',block:'start'})}}
 toggle('open-dates','date-search');toggle('open-relationships','relationship-search');
 document.addEventListener('history-query-start',e=>{const kind=e.detail.kind;$('event-search').hidden=kind==='dates'||kind==='slice';$('world-slice').hidden=kind!=='slice';$('date-search').hidden=kind!=='dates';$('map-stage').hidden=false});
 document.addEventListener('history-event-opened',()=>{$('detail').hidden=false;$('map-stage').hidden=false});
})();
