var Login = {
  // login email
  email: function() {
    return element(by.model('$ctrl.email'));
  },

  /// login password
  password: function() {
    return element(by.model('$ctrl.password'));
  },

  // login account
  account: function() {
    return element(by.model('$ctrl.accountId'));
  },

  // login button
  login: function() {
    return element(by.className('dev-login-btn'));
  },
};

module.exports = Login;