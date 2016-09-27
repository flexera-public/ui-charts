//jshint strict: false
exports.config = {

  allScriptsTimeout: 11000,

  specs: [
    '*.js'
  ],

  capabilities: {
    'browserName': 'chrome'
  },

  baseUrl: 'http://localhost:3000/',


  onPrepare: function () {
    global.Home   = require('./home');
    global.Server = require('./server');
    global.Login  = require('./login');
    global.EC     = protractor.ExpectedConditions;

    global.ChildProcess = require('child_process');
  },

  framework: 'jasmine2',

  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000
  }

};
