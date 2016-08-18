var Home = {
  // home element
  home: function() {
    return element.all(by.repeater('state in $ctrl.states')).filter(function(e, i) {
      return e.getText().then(function(text) {
        return text === "Home"});
    }).first();
  },

  // Home content header
  home_content_header: function() {
    return element.all(by.css('content-box ng-scope h1'));
  },

  // Home content text
  home_content_text: function() {
    return element.all(by.css('content-box ng-scope p'));
  },
};

module.exports = Chart;