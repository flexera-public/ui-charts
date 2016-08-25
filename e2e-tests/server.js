var Server = {

  // chart directive element
  server_page: function() {
    return element.all(by.repeater('state in $ctrl.states')).filter(function(e, i) {
      return e.getText().then(function(text) {
        return text === "Server Page"});
    }).first();
  },

  quick_filters: function() {
    return element(by.className('chart-groups'));
  },

  iframe: function() {
    browser.switchTo().frame(element(by.css('iframe.ng-scope')).getWebElement());
  },

  iframe_out: function() {
    browser.driver.switchTo().defaultContent();
  },
};

module.exports = Server;