var SavedGraph = {
  save_graph_button: function() {
    return element(by.xpath('//button[@data-rs-id="save-graphs"]'));
  },

  select_all: function() {
    return element(by.xpath('//button[@data-rs-id="select-all-thumbnails"]'));
  },

  deselect_all: function() {
    return element(by.xpath('//button[@data-rs-id="deselect-all-thumbnails"]'));
  },

  save_graph_tab: function() {
    return element(by.xpath('//a[@data-rs-id="tab-saved"]'));
  },

  chart_name: function() {
    return element(by.xpath('//div[@data-rs-id="chart-name"]'));
  },

  chart_category: function() {
    return element(by.xpath('//div[@data-rs-id="chart-category"]'));
  },

  time_range: function() {
    return element(by.xpath('//button[@data-rs-id="time-range-dropdown"]'));
  },

  delete: function() {
    return element(by.xpath('//button[@data-rs-id="delete"]'));
  },
};

module.exports = SavedGraph;