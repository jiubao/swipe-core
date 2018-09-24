export const on = (element, evt, handler) => {
  element.addEventListener(evt, handler, false)
}

export const off = (element, evt, handler) => {
  element.removeEventListener(evt, handler, false)
}

export const isFunction = value => {
  return typeof value === 'function'
}

export const inViewport = item => {
  var rect = item.getBoundingClientRect()
  return (rect.top < window.innerHeight && rect.bottom > 0) &&
    (rect.left < window.innerWidth && rect.right > 0)
}

export const easing = {
  cubic: k => --k * k * k + 1,
  // quart: k => 1 - Math.pow(1 - k, 4), // 1 - --k * k * k * k,
  // quint: k => 1 - Math.pow(1 - k, 5),
  // expo: k => k === 1 ? 1 : 1 - Math.pow(2, -10 * k),
  circ: k => Math.sqrt(1 - Math.pow(k - 1, 2))
}

// TODO: desktop support, mouse / pointer events
// var touch = 'ontouchstart' in window
// export var pointerdown = touch ? 'touchstart' : 'mousedown'
// export var pointermove = touch ? 'touchmove' : 'mousemove'
// export var pointerup = touch ? 'touchend' : 'mouseup'
export const pointerdown = 'touchstart'
export const pointermove = 'touchmove'
export const pointerup = 'touchend'

export const computedProp = (el, prop) => window.getComputedStyle(el, null).getPropertyValue(prop)
