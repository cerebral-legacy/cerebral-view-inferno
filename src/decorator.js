var Hoc = require('./hoc.js')

module.exports = function (paths, Component) {
  if (Component) {
    return Hoc(Component, paths)
  }
  return function (Component) {
    return Hoc(Component, paths)
  }
}
