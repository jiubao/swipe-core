function swipeCoreTreedPlugin (options) {
  var defaultOptions = {
    perspective: 500,
    ztuning: 140,
    width: 384,
    height: 160
  }
  var opts = {...defaultOptions, ...options}
  function setZ (current, main) {
    main.style.webkitPerspectiveOriginX = -main.x + opts.width / 2 + 'px'
    var cs = main.children
    var s = main.x
    var x = current.x
    var gap = Math.abs(x + s)
    current.style.transform = `translate3d(${x}px, 0px, -${gap / 3}px)`

    for (var i = 0; i < cs.length; i++) {
      c = cs[i]
      var x = c.x
      if (c !== current) {
        c.style.transform = `translate3d(${x}px, 0px, -${opts.ztuning - gap / 3}px)`
      }
    }
  }

  return {
    init: (_, current, main) => {
      main.style.perspective = opts.perspective + 'px'
      main.style.webkitPerspectiveOriginY = opts.height / 2 + 'px'
      setZ(current, main)
    },
    move: (_, current, main) => setZ(current, main)
  }
}
// var plugins = [swipeCoreTreedPlugin()]


var expose = document.getElementById('expose')

var screenWidth = window.screen.width

// const perspectiveX = x => document.documentElement.clientWidth * x / 750

window['swipe-core']({
  root: expose,
  elms: Array.prototype.slice.apply(expose.children[0].children),
  expose: true,
  css: true,
  index: 3,
  plugins: [swipeCoreTreedPlugin()]
  // cycle: false,
  // auto: true,
  // onEnd: (index, current, main, all) => {
  //   console.log(index)
  // },
  // onInit: (index, current, main, all) => {
  //   setZ(current, main)
  // },
  // onMove: (index, current, main, all) => {
  //   setZ(current, main)
  // }
})
