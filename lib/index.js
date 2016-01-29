var
  hooks = require('./config/hooks'),
  pipes = require('./config/pipes'),
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
    this.config = config;
    this.isDummy = isDummy;
    this.context = context;

    if (!config.level) {
      config.level = 'error';
    }
    return this;
  };

  this.hooks = hooks;
  this.pipes = pipes;

  this.loadStrategy = function(passport) {
    var strategy = new Strategy(this.context);
    strategy.load(passport, this.config);
  };

  this.loadScope = function(requestObject, callback) {
    requestObject.scope.github = this.config.scope;
    callback(null, requestObject.scope);
  };

};
