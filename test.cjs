const assert=require('node:assert/strict');
const {events}=require('./data.js');const {matches}=require('./app.js');
assert.equal(events.length,8);assert.equal(new Set(events.map(e=>e.id)).size,8);
for(const e of events){assert(e.start<=e.end);assert(e.start!==0&&e.end!==0);assert(e.lat>=-90&&e.lat<=90);assert(e.lon>=-180&&e.lon<=180);assert(e.url.startsWith('https://'));}
assert(matches(events.find(e=>e.id==='qin'),'秦始皇',-221,-221,'亚洲'));
assert(matches(events.find(e=>e.id==='sutra'),'Dunhuang',-Infinity,Infinity,''));
assert(matches(events.find(e=>e.id==='machu'),'',1499,1510,''));
assert(matches(events.find(e=>e.id==='gutenberg'),'',1454,1454,''));
assert(!matches(events.find(e=>e.id==='qin'),'',1,1800,''));
assert(!events.some(e=>matches(e,'不存在的线索',-Infinity,Infinity,'')));
assert(!matches(events[0],'',-Infinity,Infinity,'欧洲'));
console.log('PASS: 8 records; BCE, interval overlap, uncertainty envelope, aliases, people, region and empty search.');

assert(matches(events.find(e=>e.id==='declaration'),'1776',-Infinity,Infinity,''));
assert(matches(events.find(e=>e.id==='gutenberg'),'1455',-Infinity,Infinity,''));
assert(matches(events.find(e=>e.id==='qin'),'秦始皇 中国',-Infinity,Infinity,''));
assert(!matches(events.find(e=>e.id==='cook'),'库克',1401,1500,''));
