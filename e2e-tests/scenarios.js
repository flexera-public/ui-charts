// 'use strict';

/* https://github.com/angular/protractor/blob/master/docs/toc.md */

describe('Charts App', function() {
  beforeAll(function() {
    browser.get('http://tss-ui.rightscale.local:3000/');
    Login.email().sendKeys('resat-premium@rightscale.com');
    Login.password().sendKeys('ec2Instances');
    Login.account().sendKeys('60073');
    Login.login().click();
    // var ret = ChildProcess.execSync('ruby e2e-tests/setup_metrics.rb -e get_access_token');
    // console.log(ret)
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
    beforeAll(function() {
      Server.server_page().click();
      Server.instance_box().sendKeys('BR27CADED1C2V');
      Server.instance_button().click();
      browser.sleep(5000);
    });

    beforeEach(function() {
      Server.iframe();
    });

    it('should have quick filters', function() {
      expect(Server.quick_filters_bar().getText()).toContain('Quick Filters');
    });

    it('should have see all option', function() {
      expect(Server.quick_filters_show_more().getText()).toContain('...See all');
    });

    describe("clicking see all", function() {
      it('should show more filters', function() {
        Server.quick_filters_show_more().click();
        expect(Server.multi_select_filters().isPresent()).toBeTruthy();
      });
    });

    describe("clicking close", function() {
      it('should close multi select filters', function() {
        Server.multi_select_filters_close().click();
        expect(Server.multi_select_filters().isPresent()).toBeFalsy();
      });
    });

    describe("clicking filters", function() {
      beforeEach(function() {
        Server.active_filters().each(function(element, index) {
          element.click();
        });
      });

      it('should show the right thumbnails with single filter', function() {
        Server.quick_filter_select("cpu-0").click();
        expect(Server.thumbnails().count()).toEqual(1);
      });

      it('should show the right thumbnails with multiple filter', function() {
        Server.quick_filter_select("cpu-0").click();
        Server.quick_filter_select("cpu-1").click();
        expect(Server.thumbnails().count()).toEqual(2);
      });

      it('should show the right thumbnails with filter is deselcted', function() {
        Server.quick_filter_select("cpu-1").click();
        expect(Server.thumbnails().count()).toEqual(1);
      });
    });

    describe("clicking on the thumbnail", function() {
      beforeAll(function() {
        Server.active_filters().each(function(element, index) {
          element.click();
        });
      });

      it('should open full graph view', function() {
        Server.quick_filter_select("cpu-0").click();
        Server.thumbnail_text("cpu-idle").click();
        expect(Server.full_graph().isPresent()).toEqual(true);
      });
      
      it('should close the full view when close is clicked', function() {
        expect(Server.full_graph_close().isPresent()).toEqual(true);
        Server.full_graph_close().click();
        expect(Server.full_graph().isPresent()).toEqual(false);
      });      
    });

    describe("multi select filters", function() {

      beforeEach(function() {
        Server.active_filters().each(function(element, index) {
          element.click();
        });
        Server.quick_filters_show_more().click();
      });

      it('should show all filters when input is empty', function() {
        Server.multi_select_filters_input().clear();
        expect(Server.multi_select_filters_available().count()).toBeGreaterThan(5);
      });

      it('should show only filters which match the search', function() {
        Server.multi_select_filters_input().sendKeys('cpu');
        Server.multi_select_filters_available().each(function(element, index) {
          expect(element.getText()).toMatch(/cpu/);
        });
      });

      it('should select apache filter', function() {
        Server.multi_select_filters_input().sendKeys('apache');
        Server.multi_select_filters_available().first().click();
        expect(Server.active_filters().count()).toBe(1);
      });

      afterEach(function() {
        Server.multi_select_filters_close().click();
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