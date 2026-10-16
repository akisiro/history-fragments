const assert=require('node:assert/strict');const {requestUrl,records}=require('./online.js');
const url=new URL(requestUrl('zhwiki','秦始皇 & Egypt'));assert.equal(url.hostname,'zh.wikipedia.org');assert.equal(url.searchParams.get('srsearch'),'秦始皇 & Egypt');assert.equal(url.searchParams.get('origin'),'*');assert.equal(url.searchParams.get('srlimit'),'5');
assert.equal(new URL(requestUrl('wikidata','拿破仑')).searchParams.get('action'),'wbsearchentities');
assert.deepEqual(records('zhwiki',{query:{search:[{title:'秦始皇',pageid:123,snippet:'<span>秦</span>',timestamp:'2026-10-16T00:00:00Z'}]}})[0],{title:'秦始皇',description:'<span>秦</span>',url:'https://zh.wikipedia.org/?curid=123',updated:'2026-10-16T00:00:00Z',html:true});
assert.equal(records('wikidata',{search:[{id:'Q517',label:'拿破仑',description:'法国皇帝'}]})[0].url,'https://www.wikidata.org/wiki/Q517');
assert.equal(records('zhwiki',{query:{search:[]}}).length,0);assert.throws(()=>records('zhwiki',{error:{code:'ratelimited'}}));assert.throws(()=>records('wikidata',{}));
console.log('PASS: external source URL encoding, response adapters, empty results and source error handling.');
