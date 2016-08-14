// 'use strict';

/* https://github.com/angular/protractor/blob/master/docs/toc.md */

describe('demo app', function() {
  beforeEach(function() {
    browser.get('http://localhost:3000/');
  });

  it('should verify chart directive is present', function() {
    expect(Chart.chart_directive().getText()).toEqual('Chart Directive');
  });

  it('should verify chart directive is present', function() {
    expect(Chart.home().getText()).toEqual('Home');
  });
});