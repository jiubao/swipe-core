const options = { root: null, rootMargin: '0px', threshold: [0, 0.01] }

function observe (el, fn) {
  if (!window.IntersectionObserver) return fn()
  var observer = new IntersectionObserver (fn, options)
  observer.observe(el)
  return function () { observer.unobserve(el) }
}

export default observe
