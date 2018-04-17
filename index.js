var autoCirc = document.getElementById('autoCirc')
var autoCubic = document.getElementById('autoCubic')
var expose = document.getElementById('expose')
var two = document.getElementById('two');
var one = document.getElementById('one');
var uncycle = document.getElementById('uncycle');

var screenWidth = window.screen.width
window['swipe-core']({
  root: autoCirc,
  elms: Array.prototype.slice.apply(autoCirc.children[0].children),
  height: 200,
  auto: true,
  ease: 'circ'
  // onEnd: index => console.log(index)
  // width: window.screen.width
  // cycle: false,
  // index: 0
})

window['swipe-core']({
  root: autoCubic,
  elms: Array.prototype.slice.apply(autoCubic.children[0].children),
  height: 200,
  auto: true,
  ease: 'cubic'
})

window['swipe-core']({
  root: expose,
  elms: Array.prototype.slice.apply(expose.children[0].children),
  expose: true,
  css: true,
  auto: true
})

window['swipe-core']({
  root: two,
  elms: Array.prototype.slice.apply(two.children[0].children),
  width: 315,
  height: 230,
  expose: true,
  auto: true
})

window['swipe-core']({
  root: one,
  elms: Array.prototype.slice.apply(one.children[0].children),
  height: 200,
  auto: true
})

window['swipe-core']({
  root: uncycle,
  elms: Array.prototype.slice.apply(uncycle.children[0].children),
  height: 200,
  cycle: false,
  auto: true
})
