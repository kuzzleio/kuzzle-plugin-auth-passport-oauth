var
  hooks = require('./config/hooks'),
  Strategy = require('./passport/strategy');

module.exports = function () {

  this.context = {};
  this.isDummy = false;

  this.init = function (config, context, isDummy) {
    if (!config) {
      /*eslint no-console: 0*/
      console.error(new Error('auth-github: A configuration is required for plugin kuzzle-plugin-auth-github'));
      return false;
    }
    if (!config.clientID) {
      /*eslint no-console: 0*/
      console.error(new Error('auth-github: A clientID is required for plugin kuzzle-plugin-auth-github'));
      return false;
    }
    if (!config.clientSecret) {
      /*eslint no-console: 0*/
      console.error(new Error('auth-github: A clientSecret is required for plugin kuzzle-plugin-auth-github'));
      return false;
    }
    if (!config.callbackUrl) {
      /*eslint no-console: 0*/
      console.error(new Error('auth-github: A callbackUrl is required for plugin kuzzle-plugin-auth-github'));
      return false;
    }
    if (config.persist === undefined) {
      /*eslint no-console: 0*/
      console.error(new Error('auth-github: The \'persist\' attribute is required'));
      return false;
    }
    this.persist = config.persist;
    this.clientID = config.clientID;
    this.clientSecret = config.clientSecret;
    this.callbackUrl = config.callbackUrl;

    this.isDummy = isDummy;

    this.context = context;

    if (!config.level) {
      config.level = 'error';
    }

    return this;
  };

  this.hooks = hooks;

  this.loadStrategy = function(passport) {
    var strategy = new Strategy(this.context);
    strategy.load(passport, this.persist);
  };

};
