// 'use strict';

/* https://github.com/angular/protractor/blob/master/docs/toc.md */

describe('demo app', function() {
  beforeAll(function() {
    browser.get('http://localhost:3000/');
  });


  describe('Menu', function() {
    it('should verify chart directive is present', function() {
      expect(Server.server_page().getText()).toEqual('Server Page');
    });

    it('should verify chart directive is present', function() {
      expect(Home.home().getText()).toEqual('Home');
    });
  });

  describe("Server Page", function() {
    beforeEach(function() {
      Server.server_page().click();
      Server.iframe();
    });

    it('should show quick filters', function() {
      expect(Server.quick_filters().getText()).toContain('Quick Filters');
    });

    afterEach(function() {
      Server.iframe_out();
    });   
  }); 

  describe("Home", function() {
    beforeEach(function() {
      Home.home().click();
    });

    it('should verify header is valid', function() {
      expect(Home.home_content_header().getText()).toEqual('Hello from TSS UI');
    });   
  });
});