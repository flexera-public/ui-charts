// 'use strict';

/* https://github.com/angular/protractor/blob/master/docs/toc.md */

describe('Charts App', function() {
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

    it('should have quick filters', function() {
      expect(Server.quick_filters_bar().getText()).toContain('Quick Filters');
    });

    it('should have show more option', function() {
      expect(Server.quick_filters_show_more().getText()).toContain('...Show more');
    });

    describe("clicking show more", function() {
      it('should show more filters', function() {
        var initial_list = Server.filters().count();
        browser.sleep(5000);
        Server.quick_filters_show_more().click();
        var extended_list = Server.filters().count();
        expect(extended_list).toBeGreaterThan(initial_list);
      });

      it('should show link to show fewer filters', function() {
        expect(Server.quick_filters_bar().getText()).toContain('...Show fewer');
      });
    });

    describe("clicking show fewer", function() {
      it('should show fewer filters', function() {
        var initial_list = Server.filters().count();
        Server.quick_filters_show_fewer().click();
        var collapsed_list = Server.filters().count();
        expect(collapsed_list).toBeLessThan(initial_list);
      });

      it('should show link to show fewer filters', function() {
        expect(Server.quick_filters_bar().getText()).toContain('...Show more');
      });
    });

    describe("clicking filters", function() {
      beforeAll(function() {
        Server.active_filters().each(function(element, index) {
          element.click();
        });
      });
      
      it('should show the right thumbnails with single filter', function() {
        browser.pause();
        Server.quick_filter_select("cpu-0").click();
        expect(Server.thumbnails().count()).toEqual(2);
      });

      it('should show the right thumbnails with multiple filter', function() {
        Server.quick_filter_select("cpu-1").click();
        expect(Server.thumbnails().count()).toEqual(4);
      });

      it('should show the right thumbnails with filter is deselcted', function() {
        Server.quick_filter_select("cpu-1").click();
        expect(Server.thumbnails().count()).toEqual(2);
      });
    });

    describe("clicking on the thumbnail", function() {
      it('should open full graph view', function() {
        Server.thumbnail_text("foo").click();
        expect(Server.full_graph().isPresent()).toEqual(true);
      });
    });

    describe("full graph", function() {
      it('should close the full view when close is clicked', function() {
        expect(Server.full_graph_close().isPresent()).toEqual(true);
        Server.full_graph_close().click();
        expect(Server.full_graph().isPresent()).toEqual(false);
      });
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