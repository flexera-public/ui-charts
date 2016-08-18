// 'use strict';

/* https://github.com/angular/protractor/blob/master/docs/toc.md */

describe('demo app', function() {
  beforeAll(function() {
    browser.get('http://localhost:3000/');
  });

  describe('Menu', function() {
    it('should verify chart directive is present', function() {
      expect(Chart.chart_directive().getText()).toEqual('Chart Directive');
    });

    it('should verify chart directive is present', function() {
      expect(Home.home().getText()).toEqual('Home');
    });
  });

  describe("Content", function() {
    beforeEach(function() {
      Home.home().click();
    });

    it('should verify header is valid', function() {
      Home.home().click()
      expect(Home.home_content_header().getText()).toEqual('Charts demo');
    });

    it('should verify description is valid', function() {
      expect(Home.home_content_header().getText()).toEqual('This application is a demonstration and testbed for the Charts library.');
    });    
  });

  // describe("Chart Directive", function() {
    
  // });  
});