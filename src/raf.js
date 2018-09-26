// for a 60Hz monitor, requestAnimationFrame will trigger the callback every 16.67ms (1000 / 60 == 16.66...)
var vendorPrefixes = ['webkit','moz','ms','o']
var raf = vendorPrefixes.reduce((result, next) => result || window[`${next}RequestAnimationFrame`], window.requestAnimationFrame)
var caf = vendorPrefixes.reduce((result, next) => result || window[`${next}CancelAnimationFrame`], window.cancelAnimationFrame)
if (!raf || !caf) {
  var last = 0;
  raf = fn => {
    var now = +new Date();
    last = Math.max(now, last + 16);
    return setTimeout(fn, last - now)
  }
  caf = clearTimeout
}
// window.raf = raf
// window.caf = caf

export {raf, caf}

// export const requestFrame = fn => {
//   var ticking = false
//   return () => {
//     if (!ticking) {
//       raf(() => {
//         fn()
//         ticking = false
//       })
//       ticking = true
//     }
//   }
// }
