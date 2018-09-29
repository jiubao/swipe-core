!function(n,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):n["swipe-core"]=e()}(this,function(){"use strict";var Q=function(n,e,t){n.addEventListener(e,t,!1)},U=function(n,e,t){n.removeEventListener(e,t,!1)},Z=function(n){return"function"==typeof n},_={cubic:function(n){return--n*n*n+1},circ:function(n){return Math.sqrt(1-Math.pow(n-1,2))}},nn="touchstart",en="touchmove",tn="touchend",rn=function(n,e){return window.getComputedStyle(n,null).getPropertyValue(e)},on={root:null,rootMargin:"0px",threshold:[0,.01]},un=!!window.IntersectionObserver;function an(n){var e=this;n.forEach(function(n){return e.append(n)})}an.prototype.append=function(n){var e=n.$next=n.$prev=n;return this.$tail?(e.$prev=this.$tail,e.$next=this.$tail.$next,(this.$tail.$next=e).$next.$prev=e,this.$tail=e):this.$head=this.$tail=e};var n=["webkit","moz","ms","o"],cn=n.reduce(function(n,e){return n||window[e+"RequestAnimationFrame"]},window.requestAnimationFrame).bind(window),sn=n.reduce(function(n,e){return n||window[e+"CancelAnimationFrame"]},window.cancelAnimationFrame).bind(window);if(!cn||!sn){var t=0;cn=function(n){var e=+new Date;return t=Math.max(e,t+16),setTimeout(n,t-e)},sn=clearTimeout}var dn=120,fn=250,ln=1e3,hn=2*ln/3,vn=3e3,pn=(function(n){function e(){}var t=Object.defineProperty({},"passive",{get:function(){!0}});window.addEventListener("testPassive",e,t),window.removeEventListener("testPassive",e,t)}(),{auto:!1,cycle:!0,expose:!1,root:null,elms:[],index:0,width:window.screen.width,height:200,css:!1,ease:"cubic",plugins:[],initHandlers:[],startHandlers:[],moveHandlers:[],endHandlers:[],endAnimationHandlers:[]}),xn=document.createElement("div");return xn.style.display="none",document.body.appendChild(xn),function(n){var i=Object.assign({},pn,n),r=i.index,o=i.root,d=i.elms,u=i.width,a=i.height,c=i.cycle,s=(i.expose,i.auto),f=i.css,l=i.ease;i.plugins.forEach(function(e){return Object.keys(e).forEach(function(n){return i[n+"Handlers"].push(e[n])})});var e=function(t){return function(){for(var e=[],n=arguments.length;n--;)e[n]=arguments[n];return i[t+"Handlers"].forEach(function(n){return n.apply(null,e)})}},h=e("init"),t=e("start"),v=e("move"),p=e("end"),x=e("endAnimation");if(o){f&&(u=Number(rn(o,"width").slice(0,-2)),a=Number(rn(o,"height").slice(0,-2)));var w=o.children[0],$={main:-1,auto:-1},m=u/3,b=0,y=0,g=0,E=0,M=0,H=0,D=0,A=0,C=0,O=[],T=!1;s=c&&s;var j=d[r],k=function(n,e){var t,i;i=n.x=e,(t=n)&&(t.style.transition=t.style.webkitTransition="",t.style.transform=t.style.webkitTransform="translate3d("+i+"px, 0, 0)",v(j.$index,j,w,d))},F=function(n){return xn.appendChild(n)},L=function(n){return w.appendChild(n)},N=function(n){return!c&&D<A&&j===O.$head},P=function(n){return!c&&A<=D&&j===O.$tail},q=function(n){return clearTimeout($.auto)},R=function(n){q(),sn($.main)};return function(){if(0===d.length)return h(-1);o.style.position="relative",f||(o.style.width=u+"px",o.style.height=a+"px");var n=2===d.length&&c;n&&(d.push(d[0].cloneNode(!0)),L(d[2]),d.push(d[1].cloneNode(!0)),L(d[3]),d[0].$index=d[2].$index=0,d[1].$index=d[3].$index=1);var e=1===d.length;if(T=2===d.length,O=new an(d),n||d.forEach(function(n,e){return n.$index=e}),k(j,0),e||T||k(j.$prev,-u),e||k(j.$next,u),d.forEach(function(n){n.style.position="absolute",f||(n.style.width=u+"px",n.style.height=a+"px"),T||e||n===j||n===j.$prev||n===j.$next||F(n)}),e)return h(j.$index,j,w,d);if(T||c||0!==r||F(j.$prev),T||c||r!==d.length-1||F(j.$next),K(),Q(o,nn,X),Q(o,en,I),Q(o,tn,G),s)if(un)cn(function(){i.unobserve=function(n,e){if(!un)return e();var t=new IntersectionObserver(e,on);return t.observe(n),function(){t.unobserve(n)}}(o,function(n){n&&0===n[0].intersectionRatio?q(b=16):W()})});else{var t=function(){return(n=o.getBoundingClientRect()).top<window.innerHeight&&0<n.bottom&&n.left<window.innerWidth&&0<n.right?S():q(b=16);var n};Q(window,"touchmove",function(){return q(b=16)}),Q(window,"touchend",t),t()}w.x=0,h(j.$index,j,w,d)}(),{destroy:K,index:function(n){return j.$index},on:function(n,e){var t=i[n+"Handlers"];return t.push(e),function(){return t.splice(t.indexOf(e),1)}}}}function X(n){R(),E=b=0;var e=n.touches[0];H=Date.now(),g=A=D=e.pageX,C=e.clientY,t(j.$index,j,w,d)}function I(n){if(2!==b&&4!==b){var e=n.touches[0],t=e.pageX-A;if(0===b&&2*Math.abs(t)<Math.abs(e.clientY-C))b=4;else{var i=0<t?1:-1;E!==i&&(g=A,H=Date.now(),E=i),b=1,A=e.pageX,k(w,M+=t),n.preventDefault()}}}function Y(){T||F(j.$next),j=j.$prev,N()||(k(j.$prev,j.x-u),L(j.$prev))}function z(){T||F(j.$prev),j=j.$next,P()||(k(j.$next,j.x+u),L(j.$next))}function B(){0===y&&-j.x-M>u/2&&(y=1,z())}function S(){q(),$.auto=setTimeout(function(){V()},vn)}function V(){y=0,b=8,J(w,M,-j.x-u,hn,B,S),p(j.$next.$index,j.$next,w,d)}function W(){3<Math.abs(M+j.x)?V():S()}function G(n){if(4!==b){b=2;var e=g<A,t=Date.now()-H<dn;if(!N()&&!P()){var i=j.x+M;t?e&&0<i?Y():!e&&i<0&&z():m<i?Y():i<-m&&z()}var r=-1*j.x,o=Math.min(Math.max(ln*Math.abs(r-M)/u,fn),hn);J(w,M,r,t?fn:o,null,s?function(){return W()}:null),p(j.$index,j,w,d)}}function J(i,r,o,u,a,c){var s=Date.now();!function n(){Z(a)&&a();var e=Date.now()-s;if(u<=e)return k(i,o),16!==b&&Z(c)&&c(),x(j.$index,j,w,d);var t=(o-r)*_[l](e/u)+r;k(i,M=t),$.main=cn(n)}()}function K(){R(),Z(i.unobserve)&&i.unobserve(),U(o,nn,X),U(o,en,I),U(o,tn,G)}}});