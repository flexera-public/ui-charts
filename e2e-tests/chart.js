var Chart = {

  // chart directive element
  chart_directive: function() {
    return element.all(by.repeater('state in $ctrl.states')).filter(function(e, i) {
      return e.getText().then(function(text) {
        return text === "Chart Directive"});
    }).first();
  },

  // home element
  home: function() {
    return element.all(by.repeater('state in $ctrl.states')).filter(function(e, i) {
      return e.getText().then(function(text) {
        return text === "Home"});
    }).first();
  },

};

module.exports = Chart;