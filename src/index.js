var defaultOptions = {
  interval: 500,
  cycle: true,
  expose: false
}
function swipeIt (options) {
  var opts = {
    ...defaultOptions,
    ...options
  }

  return {
    init
  }

  function onTouchStart () {}

  function onTouchMove () {}

  function onTouchEnd () {}

  function moveX () {}

  function animateX () {}

  function shouldCancel () {}

  function next () {}
  function prev () {}
  function current () {}

  function init () {
    console.log('init...')
  }
}

export default swipeIt()
