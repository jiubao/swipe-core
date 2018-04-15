const options = { root: null, rootMargin: '0px', threshold: [0.99, 1] }

function observe (el, fn) {
  var observer = new IntersectionObserver (fn, options)
  observer.observe(el)
  return function () { observer.unobserve(el) }
}

export default observe

