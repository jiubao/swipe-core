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

function transparentPlugin (width) {
  let threshold = 0.5
  const opacity = (el, val) => el.style.opacity = val
  const setTwo = (current, val) => {
    if (current.next !== current) opacity(current.next, val)
    if (current.prev !== current) opacity(current.prev, val)
  }
  const reset = current => {
    opacity(current, 1)
    setTwo(current, threshold)
  }

  return {
    init: (_, current) => {
      reset(current)
    },
    move: (_, current, main) => {
      var gap = Math.abs(main.x + current.x)
      opacity(current, 1 - (1 - threshold) * gap / width)
      setTwo(current, threshold + (1 - threshold) * gap / width)
    },
    endAnimation: (_, current) => {
      reset(current)
    }
  }
}


var expose = document.getElementById('expose')

var screenWidth = window.screen.width

// const perspectiveX = x => document.documentElement.clientWidth * x / 750

// alert('sf')

var screen = document.getElementById('screen')
// screen.innerHTML = '32sdfsdf'
var g = window.g = s => {
  screen.innerHTML += '.' + s
}
var g2 = window.g2 = s => {
  screen.innerHTML = s
}

// alert(screen)
g('ss')

var endIndex = 0
var startIndex = 0

window['swipe-core']({
  root: expose,
  elms: Array.prototype.slice.apply(expose.children[0].children),
  expose: true,
  css: true,
  auto: true,
  index: 3,
  plugins: [swipeCoreTreedPlugin(), transparentPlugin(384), {end: () => g2(startIndex + ' | ' + endIndex++), start: () => g2(startIndex++ + ' | ' + endIndex)}],
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
