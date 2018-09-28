!function(n,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):n["swipe-core"]=e()}(this,function(){"use strict";var U=function(n,e,t){n.addEventListener(e,t,!1)},Z=function(n,e,t){n.removeEventListener(e,t,!1)},$=function(n){return"function"==typeof n},_={cubic:function(n){return--n*n*n+1},circ:function(n){return Math.sqrt(1-Math.pow(n-1,2))}},nn="touchstart",en="touchmove",tn="touchend",rn=function(n,e){return window.getComputedStyle(n,null).getPropertyValue(e)},on={root:null,rootMargin:"0px",threshold:[0,.01]},un=!!window.IntersectionObserver;function an(n,t){var i=this;this.list=[],n.forEach(function(n,e){n.index=Number(t?t[e]:e),i.append(n)})}an.prototype.append=function(n){var e,t=(e=n).next=e.prev=e;return this.list.push(t),this.tail?(t.prev=this.tail,t.next=this.tail.next,(this.tail.next=t).next.prev=t,this.tail=t):this.head=this.tail=t};var n=["webkit","moz","ms","o"],sn=n.reduce(function(n,e){return n||window[e+"RequestAnimationFrame"]},window.requestAnimationFrame),cn=n.reduce(function(n,e){return n||window[e+"CancelAnimationFrame"]},window.cancelAnimationFrame);if(!sn||!cn){var t=0;sn=function(n){var e=+new Date;return t=Math.max(e,t+16),setTimeout(n,t-e)},cn=clearTimeout}var fn=120,dn=250,ln=1e3,hn=2*ln/3,vn=3e3,pn=(function(n){function e(){}var t=Object.defineProperty({},"passive",{get:function(){!0}});window.addEventListener("testPassive",e,t),window.removeEventListener("testPassive",e,t)}(),{auto:!1,cycle:!0,expose:!1,root:null,elms:[],index:0,width:window.screen.width,height:200,css:!1,ease:"cubic",plugins:[],initHandlers:[],startHandlers:[],moveHandlers:[],endHandlers:[],endAnimationHandlers:[]}),xn=document.createElement("div");return xn.style.display="none",document.body.appendChild(xn),function(n){var i=Object.assign({},pn,n),r=i.index,o=i.root,f=i.elms,u=i.width,a=i.height,s=i.cycle,c=(i.expose,i.auto),d=i.css,l=i.ease;i.plugins.forEach(function(e){return Object.keys(e).forEach(function(n){return i[n+"Handlers"].push(e[n])})});var e=function(t){return function(){for(var e=[],n=arguments.length;n--;)e[n]=arguments[n];return i[t+"Handlers"].forEach(function(n){return n.apply(null,e)})}},h=e("init"),t=e("start"),v=e("move"),p=e("end"),x=e("endAnimation");if(o){d&&(u=Number(rn(o,"width").slice(0,-2)),a=Number(rn(o,"height").slice(0,-2)));var w=o.children[0],m={main:-1,auto:-1},b=u/3,y=0,g=0,E=0,M=0,H=0,D=0,A=0,C=0,O=0,T=[],N=!1;c=s&&c;var j=f[r],k=function(n,e){var t,i;i=n.x=e,(t=n)&&(t.style.transition=t.style.webkitTransition="",t.style.transform=t.style.webkitTransform="translate3d("+i+"px, 0, 0)",v(j.index,j,w,f))},F=function(n){return xn.appendChild(n)},L=function(n){return w.appendChild(n)},P=function(n){return!s&&A<C&&j===T.head},q=function(n){return!s&&C<=A&&j===T.tail},R=function(n){return clearTimeout(m.auto)},X=function(n){R(),cn(m.main)};return function(){if(0===f.length)return h(-1);o.style.position="relative",d||(o.style.width=u+"px",o.style.height=a+"px");var n=2===f.length&&s;n&&(f.push(f[0].cloneNode(!0)),L(f[2]),f.push(f[1].cloneNode(!0)),L(f[3]));var e=1===f.length;if(N=2===f.length,T=new an(f,n?"0101":null),k(j,0),e||N||k(j.prev,-u),e||k(j.next,u),f.forEach(function(n){n.style.position="absolute",d||(n.style.width=u+"px",n.style.height=a+"px"),N||e||n===j||n===j.prev||n===j.next||F(n)}),e)return h(j.index,j,w,f);if(N||s||0!==r||F(j.prev),N||s||r!==f.length-1||F(j.next),Q(),U(o,nn,I),U(o,en,Y),U(o,tn,J),c)if(un)sn(function(){i.unobserve=function(n,e){if(!un)return e();var t=new IntersectionObserver(e,on);return t.observe(n),function(){t.unobserve(n)}}(o,function(n){n&&0===n[0].intersectionRatio?R(y=16):G()})});else{var t=function(){return(n=o.getBoundingClientRect()).top<window.innerHeight&&0<n.bottom&&n.left<window.innerWidth&&0<n.right?V():R(y=16);var n};U(window,"touchmove",function(){return R(y=16)}),U(window,"touchend",t),t()}w.x=0,h(j.index,j,w,f)}(),{destroy:Q,index:function(n){return j.index},on:function(n,e){var t=i[n+"Handlers"];return t.push(e),function(){return t.splice(t.indexOf(e),1)}}}}function I(n){X(),M=y=0;var e=n.touches[0];D=Date.now(),E=C=A=e.pageX,O=e.clientY,t(j.index,j,w,f)}function Y(n){if(2!==y&&4!==y){var e=n.touches[0],t=e.pageX-C;if(0===y&&2*Math.abs(t)<Math.abs(e.clientY-O))y=4;else{var i=0<t?1:-1;M!==i&&(E=C,D=Date.now(),M=i),y=1,C=e.pageX,k(w,H+=t),n.preventDefault()}}}function z(){N||F(j.next),j=j.prev,P()||(k(j.prev,j.x-u),L(j.prev))}function B(){N||F(j.prev),j=j.next,q()||(k(j.next,j.x+u),L(j.next))}function S(){0===g&&-j.x-H>u/2&&(g=1,B())}function V(){R(),m.auto=setTimeout(function(){W()},vn)}function W(){g=0,y=8,K(w,H,-j.x-u,hn,S,V),p(j.next.index,j.next,w,f)}function G(){3<Math.abs(H+j.x)?W():V()}function J(n){if(4!==y){y=2;var e=E<C,t=Date.now()-D<fn;if(!P()&&!q()){var i=j.x+H;t?e&&0<i?z():!e&&i<0&&B():b<i?z():i<-b&&B()}var r=-1*j.x,o=Math.min(Math.max(ln*Math.abs(r-H)/u,dn),hn);K(w,H,r,t?dn:o,null,c?function(){return G()}:null),p(j.index,j,w,f)}}function K(i,r,o,u,a,s){var c=Date.now();!function n(){$(a)&&a();var e=Date.now()-c;if(u<=e)return k(i,o),16!==y&&$(s)&&s(),x(j.index,j,w,f);var t=(o-r)*_[l](e/u)+r;k(i,H=t),m.main=sn(n)}()}function Q(){X(),$(i.unobserve)&&i.unobserve(),Z(o,nn,I),Z(o,en,Y),Z(o,tn,J)}}});