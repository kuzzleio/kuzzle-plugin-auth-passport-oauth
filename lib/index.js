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
      console.error(new Error('auth-oauth: A configuration is required for plugin kuzzle-plugin-auth-passport-oauth'));
      return false;
    }
    if (!config.strategies) {
      /*eslint no-console: 0*/
      console.error(new Error('auth-oauth: at least one strategy is required for plugin kuzzle-plugin-auth-passport-oauth'));
      return false;
    }
    if (config.persist === undefined) {
      /*eslint no-console: 0*/
      console.error(new Error('auth-oauth: The \'persist\' attribute is required'));
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
    this.config.strategies.forEach(function(strategy) {
      requestObject.scope[strategy.name] = strategy.scope;
    });
    callback(null, requestObject.scope);
  };

};
