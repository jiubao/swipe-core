var expose = document.getElementById('expose')

var screenWidth = window.screen.width

window['swipe-core']({
  root: expose,
  elms: Array.prototype.slice.apply(expose.children[0].children),
  expose: true,
  css: true,
  // auto: true
  onEnd: (index, main) => {
    console.log(index)
  },
  onMove: (current, main, all) => {
    // var cs = main.children
    // for (var i = 0; i < cs.length; i++) {
    //   c = cs[i]
    //   var s = main.x
    //   var x = c.x
    //
    //   var gap = Math.abs(x + s)
    //   // console.log(gap)
    //   c.style.transform = `translate3d(${x}px, 0px, 0px) translateZ(-${gap / 3}px)`
    // }

    main.style.webkitPerspectiveOriginX = -main.x + 315 / 2 + 'px'
    var cs = main.children
    var s = main.x
    var x = current.x
    var gap = Math.abs(x + s)
    current.style.transform = `translate3d(${x}px, 0px, -${gap / 3}px)`

    for (var i = 0; i < cs.length; i++) {
      c = cs[i]
      var x = c.x
      if (c !== current) {
        c.style.transform = `translate3d(${x}px, 0px, -${130 - gap / 3}px)`
      }
    }
  }
})
