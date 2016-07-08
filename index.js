var mixin = require('./src/mixin.js')
var decorator = require('./src/decorator.js')
var hoc = require('./src/hoc.js')
var container = require('./src/container.js')
// var link = require('./src/link.js')

module.exports = {
  Mixin: mixin,
  Decorator: decorator,
  connect: decorator,
  HOC: hoc,
  Container: container,
  // Link: link
}
