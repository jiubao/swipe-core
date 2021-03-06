[![npm][npm]][npm-url]

# swipe-core
* 6k before gzip

## Demo
* https://jiubao.github.io/swipe-core/
* https://jiubao.github.io/swipe-core/3d/

## Features
Designed for mobile: compact, smooth and efficient
* animation: css animation has limitations, use js to simulate animation
  - use requestAnimationFrame and have a compact polyfill
  - use cubic bezier to simulate ease out
* always move one element which contain current 3 slides
* a compact link implementation to loop slides
* stop auto swipe when out of screen
  - android: IntersectionObserver
  - ios: throttle(requestAnimationFrame)
* listen visibilitychange to stop auto swipe when page invisible

## Install
```sh
$ npm install --save swipe-core
```
```sh
$ yarn add swipe-core
```
```javascript
// using ES6 modules
import swiper from 'swipe-core/dist/swipe-core.es'
```

The [UMD](https://github.com/umdjs/umd) build is available on [unpkg](https://unpkg.com):
```html
<script src="https://unpkg.com/swipe-core"></script>
```

## Usage
basic: `auto` `cycle`
```html
<div id="auto">
  <div>
    <div><img src="./imgs/1.jpg" /> </div>
    <div><img src="./imgs/2.jpg" /> </div>
    <div><img src="./imgs/3.jpg" /> </div>
    <div><img src="./imgs/4.jpg" /> </div>
    <div><img src="./imgs/5.jpg" /> </div>
  </div>
</div>
```

```js
import swiper from 'swipe-core/dist/swipe-core.es'
var auto = document.getElementById('auto')
swiper({
  root: auto,
  elms: Array.prototype.slice.apply(auto.children[0].children),
  auto: true,
  onEnd: index => console.log(index)
})
```

expose: `expose` `css` `cycle` `two slides`
```html
<div id="expose" class="swipe-core-wh">
  <div>
    <div class="swipe-core-wh">
      <div class="box"> <img src="./imgs/1.jpg" /> </div>
    </div>
    <div class="swipe-core-wh">
      <div class="box"> <img src="./imgs/2.jpg" /> </div>
    </div>
  </div>
</div>
```

```js
import swiper from 'swipe-core/dist/swipe-core.es'
var expose = document.getElementById('expose')
swiper({
  root: expose,
  elms: Array.prototype.slice.apply(expose.children[0].children),
  expose: true,
  css: true
})
```

```css
#expose { margin-left: 30px; }
.box { padding: 0 5px; }
.swipe-core-wh { width: 315px; height: 200px; }
```

## Options
| Attribute | Description | Type | Default | Values |
| ----- | :-: | :-: | :-: | :-: |
| auto | auto swipe | Boolean | false | `true` `false` |
| cycle | cycle swipe | Boolean | true | `true` `false` |
| expose | expose mode | Boolean | false | `true` `false` |
| root | root element | Dom element | | |
| elms | slides elements | Array | [] | |
| index | initial slide index | Number | 0 | |
| width | slide width | Number | window.screen.width | |
| height | slide height | Number | 200 | |
| css | use css to control w/h | Boolean | false | `true` `false` |
| ease | easing | String | cubic | `circ` `cubic` |
| plugins | plugins | Array | [] | |

## Methods
| Name | Description | Parameters | Return |
| ----- | :-: | :-: | :-: |
| destroy | destroy swipe | | |
| index | get current index | | current index |
| on | add a event handler | event name, event handler | unregister function |

## Events

| Name | Description | trigger | Parameters |
| ----- | :-: | :-: | :-: |
| init | initial | - | index, current, main, elms |
| start | start move | - | index, current, main, elms |
| move | slides moving | - | index, current, main, elms |
| end | after animation | - | index, current, main, elms |
| ~~animationEnd~~ | after animation | - | index, current, main, elms |

## Event handler arguments
| Name | Description |
| ----- | :-: |
| index | current index |
| current | current slide |
| main | main dom element |
| elms | all elements' array |

## element interface
| Name | Description |
| ----- | :-: |
| $index | current index |
| $prev | previous element |
| $next | next element |

examples:
```javascript
// bind 'move'
var off = swiperInstance.on('move', (index, current, main, elms) => {
  // next slide
  console.log(current.$next)
})
// unbind 'move'
off()
```

## Todos
* ~~performance~~
* ~~link list~~
* ~~vertical scroll on page~~
* ~~group current 3 slides~~
* ~~use js to simulate animation~~
* ~~ease animating~~
* ~~fast drag~~
* ~~fast touch~~
* ~~swipe left & right~~
* ~~disable cycle~~
* ~~expose mode~~
* ~~support one / two slides~~
* ~~dynamic interval~~
* ~~auto swipe~~
* ~~polyfill requestAnimationFrame~~
* ~~polyfill cloneNode deep~~
* ~~vendor prefix for transition/transform/translate3d~~
* ~~current index interface~~
* ~~css width height~~
* ~~stop auto swipe when out of screen (android & ios)~~
* ~~onEnd~~
* ~~onStart | onMove | onEnd~~
* dynamic slides
* init animation
* desktop
* inject version info into dist files


[npm]: https://img.shields.io/npm/v/swipe-core.svg
[npm-url]: https://npmjs.com/package/swipe-core
