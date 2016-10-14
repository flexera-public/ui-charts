var Server = {

  // chart directive element
  server_page: function() {
    return element(by.xpath('//a[@data-rs-id="menu-link-server"]'));
  },

  instance_box: function() {
    return element(by.xpath('//input[@data-rs-id="instance-id-input"]'));
  },

  instance_button: function() {
    return element(by.xpath('//button[@data-rs-id="view-instance-charts"]'));
  },

  quick_filters_bar: function() {
    return element(by.className('tag-selector'));
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
      return e.$('a').getText().then(function(text) {
        return text === plugin;
      });
    }).first();
  },

  thumbnail_text: function(plugin) {
    return this.thumbnail_select(plugin).$('a');
  },

  timerange: function() {
    return element(by.xpath('//button[@data-rs-id="time-range-dropdown"]'));
  },

  timerange_menu: function() {
    return element.all(by.repeater('span in $ctrl.spans'));
  },

  timerange_selector: function(range) {
    return this.timerange_menu().filter(function(e, i) {
      return e.getText().then(function(text) {
        return text === range;
      });
    }).first();
  },

  full_graph: function() {
    return element(by.className('cf chart-details active'));
  },

  full_graph_close: function() {
    return this.full_graph().element(by.xpath('//a[@data-rs-id="close-preview"]'));
  },

  all_graph_tab: function() {
    return element(by.xpath('//a[@data-rs-id="tab-all"]'));
  },

  thumbnail_preview_select: function() {
    return element(by.xpath('//label[@data-rs-id="thumbnail-preview-select"]'));
  },

  iframe: function() {
    browser.switchTo().frame(element(by.id('instanceFrame')).getWebElement());
  },

  iframe_out: function() {
    browser.driver.switchTo().defaultContent();
  },
};

module.exports = Server;