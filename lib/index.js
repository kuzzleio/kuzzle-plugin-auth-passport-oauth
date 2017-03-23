const
  Strategy = require('./passport/strategy'),
  defaultConfig = {
    'strategies': {}
  };

/**
 * @class PluginPassportOAuth
 */
class PluginPassportOAuth {
  /**
   * @constructor
   */
  constructor () {
    this.context = {};
    this.scope = {};
    this.config = null;
  }

  init (customConfig, context) {
    let strategy;
    const config = Object.assign(defaultConfig, customConfig);

    if (Object.keys(config.strategies).length === 0) {
      console.warn('kuzzle-plugin-auth-passport-oauth: no strategies specified.');
    }

    this.config = config;
    this.context = context;

    Object.keys(this.config.strategies).forEach(key => {
      this.scope[key] = this.config.strategies[key].scope;
    });

    if (!config.level) {
      config.level = 'error';
    }

    strategy = new Strategy(this.context, this.config);
    strategy.init();

    return this;
  }
}

module.exports = PluginPassportOAuth;