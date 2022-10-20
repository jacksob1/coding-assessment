/**
 * Application header.
 */
component.header = function() {
  component.apply(this, arguments);
};
assessment.extend(component.header, component);

/**
 * Draw the header.
 *
 * @param {HTMLDivElement} parent
 */
component.header.prototype.decorate = function(parent) {
  var heading = document.createElement('h1');
  heading.innerText = 'myhELO Coding Assessment'
  parent.appendChild(heading);
};
