var Inferno = require('inferno') // eslint-disable-line
var createElement = require('inferno-create-element')
var InfernoComponent = require('inferno-component')

function extractDeps (deps, allDeps) {
  return Object.keys(deps).reduce(function (depsMap, key) {
    if (deps[key].getDepsMap) {
      return extractDeps(deps[key].getDepsMap(), allDeps)
    } else {
      var depsKey = Array.isArray(deps[key]) ? deps[key].join('.') : deps[key]
      depsMap[depsKey] = true
    }
    return depsMap
  }, allDeps)
}

function functionName (fun) {
  var ret = fun.toString()
  ret = ret.substr('function '.length)
  ret = ret.substr(0, ret.indexOf('('))
  return ret
}

module.exports = function (Component, paths) {
  class CerebralComponent extends InfernoComponent {
    componentWillMount () {
      this.signals = this.context.cerebral.controller.isServer ? {} : this.context.cerebral.controller.getSignals()
      this.modules = this.context.cerebral.controller.isServer ? {} : this.context.cerebral.controller.getModules()

      var statePaths = this.getStatePaths ? this.getStatePaths(this.props) : {}
      if (!Object.keys(statePaths).length) {
        return
      }
      this.context.cerebral.registerComponent(this, this.getDepsMap(this.props))
    }
    componentWillUnmount () {
      this._isUmounting = true
      this.context.cerebral.unregisterComponent(this)
    }
    shouldComponentUpdate () {
      return false
    }
    componentWillReceiveProps (nextProps) {
      var hasChange = false
      var oldPropKeys = Object.keys(this.props)
      var newPropKeys = Object.keys(nextProps)
      if (oldPropKeys.length !== newPropKeys.length) {
        hasChange = true
      } else {
        for (var i = 0; i < newPropKeys.length; i++) {
          if (this.props[newPropKeys[i]] !== nextProps[newPropKeys[i]]) {
            hasChange = true
            break
          }
        }
      }
      // If dynamic paths, we need to update them
      if (typeof paths === 'function') {
        this.context.cerebral.updateComponent(this, this.getDepsMap(nextProps))
      } else {
        hasChange && this._update()
      }
    }
    getProps () {
      var controller = this.context.cerebral.controller
      var props = this.props || {}
      var paths = this.getStatePaths ? this.getStatePaths(this.props) : {}

      var propsToPass = Object.keys(paths || {}).reduce(function (props, key) {
        props[key] = paths[key].getDepsMap ? paths[key].get(controller.get()) : controller.get(paths[key])
        return props
      }, {})

      propsToPass = Object.keys(props).reduce(function (propsToPass, key) {
        propsToPass[key] = props[key]
        return propsToPass
      }, propsToPass)

      propsToPass.signals = this.signals
      propsToPass.modules = this.modules

      return propsToPass
    }
    _update () {
      if (this._isUmounting) {
        return
      }
      this.forceUpdate()
    }
    getPropsWithModules (props) {
      return Object.keys(props).reduce(function (propsWithModules, key) {
        propsWithModules[key] = props[key]
        return propsWithModules
      }, {modules: this.modules})
    }
    getDepsMap (props) {
      if (!paths) {
        return {}
      }
      var propsWithModules = this.getPropsWithModules(props)
      var deps = typeof paths === 'function' ? paths(propsWithModules) : paths

      return extractDeps(deps, {})
    }
    getStatePaths (props) {
      if (!paths) {
        return {}
      }
      var propsWithModules = Object.keys(props).reduce(function (propsWithModules, key) {
        propsWithModules[key] = props[key]
        return propsWithModules
      }, {modules: this.modules})
      return typeof paths === 'function' ? paths(propsWithModules) : paths
    }
    render () {
      return createElement(Component, this.getProps())
    }
  }

  CerebralComponent.displayName = 'CerebralWrapping_' + functionName(Component)

  return CerebralComponent
}
