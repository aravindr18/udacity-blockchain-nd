exports.id=0,exports.modules={"./src/server/server.js":function(e,r,t){"use strict";t.r(r);var n=t("./build/contracts/FlightSuretyApp.json"),a=t("./src/server/config.json"),s=t("web3"),o=t.n(s),c=t("express"),u=t.n(c);t("babel-polyfill");function i(e,r,t,n,a,s,o){try{var c=e[s](o),u=c.value}catch(e){return void t(e)}c.done?r(u):Promise.resolve(u).then(n,a)}function l(e){return function(){var r=this,t=arguments;return new Promise((function(n,a){var s=e.apply(r,t);function o(e){i(s,n,a,o,c,"next",e)}function c(e){i(s,n,a,o,c,"throw",e)}o(void 0)}))}}var p=a.localhost,f=new o.a(new o.a.providers.WebsocketProvider(p.url.replace("http","ws")));f.eth.defaultAccount=f.eth.accounts[0];var h=new f.eth.Contract(n.abi,p.appAddress),v=[],g=[];function m(){return(m=l(regeneratorRuntime.mark((function e(){var r,t,n,a;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,f.eth.getAccounts();case 2:return r=e.sent,e.next=5,h.methods.REGISTRATION_FEE().call();case 5:t=e.sent,n=1;case 7:if(!(n<2)){e.next=18;break}return v.push(r[n]),e.next=11,h.methods.registerOracle().send({from:r[n],value:t,gas:1e8});case 11:return e.next=13,h.methods.getMyIndexes().call({from:r[n],gas:3e5});case 13:a=e.sent,g.push(a);case 15:n++,e.next=7;break;case 18:console.log(g),console.log(v);case 20:case"end":return e.stop()}}),e)})))).apply(this,arguments)}function d(e,r,t){return x.apply(this,arguments)}function x(){return(x=l(regeneratorRuntime.mark((function e(r,t,n){var a,s,o,c;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:console.log(g),a=0;case 2:if(!(a<v.length)){e.next=22;break}o=(s=[0,10,20,30,40,50])[Math.floor(Math.random()*s.length)],c=0;case 6:if(!(c<g.length)){e.next=19;break}return e.prev=7,console.log(g[c]),e.next=11,h.methods.submitOracleResponse(g[c],r,t,n,o).send({from:v[a],gas:3e5});case 11:e.next=16;break;case 13:e.prev=13,e.t0=e.catch(7),console.log(e.t0);case 16:c++,e.next=6;break;case 19:a++,e.next=2;break;case 22:case"end":return e.stop()}}),e,null,[[7,13]])})))).apply(this,arguments)}function b(){return(b=l(regeneratorRuntime.mark((function e(){return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:h.events.OracleRequest({fromBlock:0},function(){var e=l(regeneratorRuntime.mark((function e(r,t){var n,a,s;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(!r){e.next=4;break}console.log(r),e.next=9;break;case 4:return n=t.returnValues[1],a=t.returnValues[2],s=t.returnValues[3],e.next=9,d(n,a,s);case 9:case"end":return e.stop()}}),e)})));return function(r,t){return e.apply(this,arguments)}}());case 1:case"end":return e.stop()}}),e)})))).apply(this,arguments)}!function(){m.apply(this,arguments)}(),function(){b.apply(this,arguments)}();var w=u()();w.get("/api",(function(e,r){r.send({message:"An API for use with your Dapp!!"})})),r.default=w}};