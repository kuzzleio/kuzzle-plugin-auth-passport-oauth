var
  hooks = require('./config/hooks'),
  Strategy = require('./passport/strategy');

module.exports = function () {

  this.isDummy = false;
  this.context = {};

  this.init = function (config, context, isDummy) {
    if (!config) {
      /*eslint no-console: 0*/
      console.error(new Error('auth-github: A configuration is required for plugin kuzzle-plugin-auth-github'));
      return false;
    }

    this.context = context;
    this.isDummy = isDummy;

    if (!config.level) {
      config.level = 'error';
    }

    return this;
  };

  this.hooks = hooks;

  this.loadStrategy = function(passport, event) {
    var strategy = new Strategy(this.context);
    strategy.load(passport);
  };

};
