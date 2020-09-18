exports.id=0,exports.modules={"./src/server/server.js":function(e,r,t){"use strict";t.r(r);var n=t("./build/contracts/FlightSuretyApp.json"),s=t("./src/server/config.json"),a=t("web3"),o=t.n(a),u=t("express"),c=t.n(u);t("babel-polyfill");function i(e,r,t,n,s,a,o){try{var u=e[a](o),c=u.value}catch(e){return void t(e)}u.done?r(c):Promise.resolve(c).then(n,s)}function l(e){return function(){var r=this,t=arguments;return new Promise((function(n,s){var a=e.apply(r,t);function o(e){i(a,n,s,o,u,"next",e)}function u(e){i(a,n,s,o,u,"throw",e)}o(void 0)}))}}var f=s.localhost,h=new o.a(new o.a.providers.WebsocketProvider(f.url.replace("http","ws")));h.eth.defaultAccount=h.eth.accounts[0];var p=new h.eth.Contract(n.abi,f.appAddress),d=[],v=[];function m(){return(m=l(regeneratorRuntime.mark((function e(){var r,t,n,s;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,h.eth.getAccounts();case 2:return r=e.sent,e.next=5,p.methods.REGISTRATION_FEE().call({from:r[0]});case 5:t=e.sent,n=0;case 7:if(!(n<20)){e.next=18;break}return d.push(r[n]),e.next=11,p.methods.registerOracle().send({from:r[n],value:t});case 11:return e.next=13,p.methods.getMyIndexes().call({from:r[n]});case 13:s=e.sent,v.push(s);case 15:n++,e.next=7;break;case 18:case"end":return e.stop()}}),e)})))).apply(this,arguments)}!function(){m.apply(this,arguments)}(),p.events.OracleRequest({fromBlock:0},(function(e,r){var t=r.returnValues.airline,n=r.returnValues.flight,s=r.returnValues.timestamp,a=[0,10,20,30,40,50],o=a[Math.floor(Math.random()*a.length)];console.log("statuscode"+o);for(var u=0;u<d.length;u++)for(var c=0;c<v.length;c++)try{r.returnValues.index==d[u][1][c]&&p.methods.submitOracleResponse(r.returnValues.index,t,n,s,o).send({from:d[u][0],gas:3e5})}catch(e){}}));var g=c()();g.get("/api",(function(e,r){r.send({message:"An API for use with your Dapp!!"})})),r.default=g}};