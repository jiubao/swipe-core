// import vue from 'rollup-plugin-vue'
// import json from 'rollup-plugin-json'
import buble from 'rollup-plugin-buble'
import resolve from 'rollup-plugin-node-resolve'
// import commonjs from 'rollup-plugin-commonjs'
// import nodeResolve from 'rollup-plugin-node-resolve'
import cfg from './package.json'

export default [{
  input: 'src/index.js',
  output: [{
    file: cfg.module,
    format: 'es'
  }, {
    file: cfg.cjs,
    format: 'cjs'
  }],
  external: [
    '@jiubao/raf',
    '@jiubao/passive',
    '@jiubao/link'
  ],
  plugins: [
    buble({
      objectAssign: 'Object.assign'
    }),
    resolve({
      module: true
    })
  ]
}, {
  input: 'src/index.js',
  output: [{
    file: cfg.browser,
    format: 'umd',
    name: 'swipe-core'
  }],
  plugins: [
    buble({
      objectAssign: 'Object.assign'
    }),
    resolve({
      module: true
    })
  ]
}, {
  input: 'src/plugins/3d.js',
  output: [{
    file: "dist/plugins/swipe-core-plugin-3d.umd.js",
    format: 'umd',
    name: 'swipeCorePlugin3d'
  }, {
    file: "dist/plugins/swipe-core-plugin-3d.es.js",
    format: 'es'
  }]
}, {
  input: 'src/plugins/transparent.js',
  output: [{
    file: "dist/plugins/swipe-core-plugin-transparent.umd.js",
    format: 'umd',
    name: 'swipeCorePluginTransparent'
  }, {
    file: "dist/plugins/swipe-core-plugin-transparent.es.js",
    format: 'es'
  }]
}]
