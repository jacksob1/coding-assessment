var component = function() {};

/**
 * Render a component.
 *
 * @param {HTMLElement} parent
 */
component.prototype.render = function(parent) {
  var container = document.createElement('div');
  this.decorate(container);
  parent.appendChild(container);
}
