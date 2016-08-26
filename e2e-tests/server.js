var Server = {

  // chart directive element
  server_page: function() {
    return element.all(by.repeater('state in $ctrl.states')).filter(function(e, i) {
      return e.getText().then(function(text) {
        return text === "Server Page"
      });
    }).first();
  },

  quick_filters_bar: function() {
    return element(by.className('chart-groups'));
  },

  filters: function() {
    return element.all(by.repeater('group in $ctrl.groups'));
  },

  quick_filter_select: function(plugin) {
    return this.filters().filter(function(e, i) {
      return e.getText().then(function(text) {
        return text === plugin
      });
    }).first();
  },

  quick_filters_show_more: function() {
    return element(by.className('chart-groups-show-more'));
  },

  quick_filters_show_fewer: function() {
    return element.all(by.className('chart-groups')).all(by.tagName('li')).filter(function(e, i) {
      return e.getText().then(function(text) {
        return text === "...Show fewer"
      });
    }).first();
  },

  active_filters: function() {
    return this.filters().all(by.className('chart-group ng-binding active'));
  },

  thumbnails: function() {
    return element.all(by.repeater('metric in $ctrl.metrics track by metric.id'));
  },

  thumbnail_select: function(plugin) {
    return this.thumbnails().filter(function(e, i) {
      return e.getText().then(function(text) {
        return text === plugin
      });
    }).first();
  },

  thumbnail_text: function(plugin) {
    return this.thumbnail_select(plugin).element(by.css('div.chart-thumbnail-name'));
  },

  full_graph: function() {
    return element(by.className('cf chart-details active'));
  },

  full_graph_close: function() {
    return this.full_graph().element(by.className('close'));
  },

  iframe: function() {
    browser.switchTo().frame(element(by.css('iframe.ng-scope')).getWebElement());
  },

  iframe_out: function() {
    browser.driver.switchTo().defaultContent();
  },
};

module.exports = Server;