var
  Strategy = require('./passport/strategy');

module.exports = function () {
  this.context = {};
  this.isDummy = true;
  this.scope = {};

  this.init = function (config, context, isDummy) {
    var strategy;

    if (!config) {
      return console.error(new Error('auth-oauth: A configuration is required for plugin kuzzle-plugin-auth-passport-oauth'));
    }
    if (!config.strategies) {
      return console.error(new Error('auth-oauth: at least one strategy is required for plugin kuzzle-plugin-auth-passport-oauth'));
    }

    this.config = config;
    this.isDummy = isDummy;
    this.context = context;

    Object.keys(this.config.strategies).forEach(key => {
      this.scope[key] = this.config.strategies[key].scope;
    });

    if (!config.level) {
      config.level = 'error';
    }

    if (!this.isDummy) {
      strategy = new Strategy(this.context, this.config);
      strategy.init();
    }

    return this;
  };
};
