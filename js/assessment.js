/**
 * Namespace.
 *
 * @type {Object}
 */
var assessment = {};

/**
 * Send an API call to the FDA and execute a callback with the results.
 *
 * @param {string} url The API endpoint to call
 * @param {Function} callback Function to call upon successful execution of
 * the API call.
 */
assessment.fda_api = function(url, callback) {
  var callback_ = function() {
    var json = JSON.parse(this.responseText);
    callback(json.results);
  };

  var request = new XMLHttpRequest();
  request.addEventListener('load', callback_);
  request.open('GET', url);
  request.send();
};

/**
 * Runs when the document is fully loaded and ready to go.
 */
assessment.ready = function() {
  var header = new component.header();
  header.render(document.body);

  var visualization = new component.visualization();
  visualization.render(document.body);
};

/**
 * Extends one class with another.
 *
 * @link https://oli.me.uk/2013/06/01/prototypical-inheritance-done-right/
 *
 * @param {Function} destination The class that should be inheriting things.
 * @param {Function} source The parent class that should be inherited from.
 *
 * @return {Object} The prototype of the parent.
 */
assessment.extend = function(destination, source) {
  destination.prototype = Object.create(source.prototype);
  destination.prototype.constructor = destination;

  return source.prototype;
};
