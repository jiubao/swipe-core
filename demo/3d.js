var expose = document.getElementById('expose')

var screen = document.getElementById('screen')
var g = window.g = s => {
  screen.innerHTML += '.' + s
}
var g2 = window.g2 = s => {
  screen.innerHTML = s
}

g('ss')

var endIndex = 0
var startIndex = 0

window.s3d = window['swipe-core']({
  root: expose,
  elms: Array.prototype.slice.apply(expose.children[0].children),
  expose: true,
  css: true,
  auto: true,
  index: 3,
  plugins: [swipeCorePlugin3d(), swipeCorePluginTransparent(384), {end: () => g2(startIndex + ' | ' + endIndex++), start: () => g2(startIndex++ + ' | ' + endIndex)}],
  // cycle: false,
})
