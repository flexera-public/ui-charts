var Server = {

  // chart directive element
  server_page: function() {
    return element.all(by.repeater('state in $ctrl.states')).filter(function(e, i) {
      return e.getText().then(function(text) {
        return text === "Server Page"
      });
    }).first();
  },

  instance_box: function() {
    return element(by.id('instanceId'));
  },

  instance_button: function() {
    return element(by.buttonText('Go'));
  },

  quick_filters_bar: function() {
    return element(by.className('tag-selector'));
  },

  filters: function() {
    return element.all(by.repeater('group in $ctrl.groups'));
  },

  quick_filters: function() {
    return element.all(by.repeater('tag in $ctrl.tags'));
  },

  quick_filter_select: function(plugin) {
    return this.quick_filters().filter(function(e, i) {
      return e.getText().then(function(text) {
        return text === plugin
      });
    }).first();
  },

  quick_filters_show_more: function() {
    return element(by.className('tags-show-more'));
  },

  quick_filters_show_all: function() {
    return element(by.className('tags-show-more'));
  },

  active_filters: function() {
    return this.quick_filters().filter(function(e, i) {
      return e.$('a').getAttribute('class').then(function(text) {
        return text.includes("active");
      });
    });
  },

  multi_select_filters: function() {
    return element(by.className('cf tags-filter'));
  },

  multi_select_filters_available: function() {
    return element.all(by.repeater('filter:search:strict'))
  },

  multi_select_filters_close: function() {
    return element(by.xpath('//a[@data-rs-id="close-tags-search"]'));
  },

  // multi_select_filters_text_box: function() {
  //   return element(by.className('br1 pv1 pa2 ba b-grey f5 w5 sans color-text ng-valid ng-dirty ng-valid-parse ng-touched ng-not-empty'));
  // },

  multi_select_filters_input: function() {
    return element(by.xpath('//input[@data-rs-id="tag-search-input"]'));
  },

  multi_select_filter_select: function(plugin) {
    return this.multi_select_filters().filter(function(e, i) {
      return e.$('a').getText().then(function(text) {
        return text === plugin;
      });
    });
  },

  thumbnails: function() {
    return element.all(by.repeater('metric in row track by metric.id'));
  },

  thumbnail_select: function(plugin) {
    return this.thumbnails().filter(function(e, i) {
      return e.element(by.xpath('//a[@data-rs-id="thumbnail-preview"]')).getText().then(function(text) {
        return text === plugin
      });
    }).first();
  },

  thumbnail_text: function(plugin) {
    return this.thumbnail_select(plugin).element(by.xpath('//a[@data-rs-id="thumbnail-preview"]'));
  },

  full_graph: function() {
    return element(by.className('cf chart-details active'));
  },

  full_graph_close: function() {
    return this.full_graph().element(by.xpath('//a[@data-rs-id="close-preview"]'));
  },

  iframe: function() {
    browser.switchTo().frame(element(by.id('instanceFrame')).getWebElement());
  },

  iframe_out: function() {
    browser.driver.switchTo().defaultContent();
  },
};

module.exports = Server;