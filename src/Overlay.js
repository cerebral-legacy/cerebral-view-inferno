var Inferno = require('inferno');
var createElement = require('inferno-create-element');
var InfernoDOM = require('inferno-dom');
var Component = require('inferno-component');

class Overlay extends Component {
  render() {
    var overlay = this.props.overlay;

    return createElement('div', {
      style: {
        position: 'absolute',
        backgroundColor: 'green',
        left: overlay.bounds.left + 'px',
        top: (overlay.bounds.top + overlay.offset) + 'px',
        width: overlay.bounds.width + 'px',
        height: overlay.bounds.height + 'px'
      }
    });
  }
}

module.exports = Overlay;
