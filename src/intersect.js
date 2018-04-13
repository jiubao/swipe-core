// TODO: check IntersectionObserver

var targets = []
const options = { root: null, rootMargin: '0px', threshold: [0, 1], func: null }
var observer = new IntersectionObserver (callback, options)
function callback (entries, observer) {
  // console.log('intersect:', entries)
  console.log('intersect:', entries[0].intersectionRatio)
  options.func(entries, observer)
}
export function observe (el, fn) {
  targets.push(el)
  observer.observe(el)
  options.func = fn
}

export function unobserve () {
  targets.forEach(t => observer.unobserve(t))
}
