const options = { root: null, rootMargin: '0px', threshold: [0, 0.01] }

const observable = !!window.IntersectionObserver

function observe (el, fn) {
  if (observable) return fn()
  var observer = new IntersectionObserver (fn, options)
  observer.observe(el)
  return function () { observer.unobserve(el) }
}

export {observable}

export default observe
