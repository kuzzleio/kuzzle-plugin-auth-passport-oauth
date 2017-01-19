var
  Strategy = require('./passport/strategy');

module.exports = function () {
  this.context = {};
  this.isDummy = true;
  this.scope = {};

  this.init = function (customConfig, context, isDummy) {
    var strategy;
    const defaultConfig = {
      'strategies': {}
    };
    const config = Object.assign(defaultConfig, customConfig);

    if (Object.keys(config.strategies).length === 0) {
      console.warn('kuzzle-plugin-auth-passport-oauth: no strategies specified.');
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
