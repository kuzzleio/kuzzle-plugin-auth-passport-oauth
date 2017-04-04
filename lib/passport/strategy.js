const refresh = require('passport-oauth2-refresh');

/**
 * Interface to passportjs
 *
 * @param {Object} context - Kuzzle Plugin context
 * @param {Object} config - this plugin's current configuration
 * @class Strategy
 */
class Strategy {
  /**
   * @param context
   * @param config
   * @constructor
   */
  constructor (context, config) {
    this.config = config;
    this.context = context;
  }

  /**
   * Initializes the configured strategies and load them to passportjs
   */
  init () {
    Object.keys(this.config.strategies).forEach(key => {
      let
        strategy,
        StrategyConstructor;

      if (!this.config.strategies[key].credentials) {
        return console.error(`Error loading strategy [${key}]: no credentials provided`);
      }

      try {
        StrategyConstructor = require('passport-' + key).Strategy;
      } catch (err) {
        /*eslint no-console: 0*/
        return console.error(`Error loading strategy [${key}]: ${err.message}`);
      }

      this.context.accessors.registerStrategy(StrategyConstructor, key, this, this.verify, this.config.strategies[key].credentials);

      try {
        refresh.use(strategy);
      } catch (err) {
        /*eslint no-console: 0*/
        console.error(`Error refreshing strategy [${key}]: ${err.message}`);
      }
    });
  }

  verify (request, accessToken, refreshToken, profile, done) {
    const
      userProfile = this.config.defaultProfile ? this.config.defaultProfile : null,
      user = {};

    this.context.accessors.users.load(profile._json.name)
      .then(userObject => {
        let userCreation;

        if (userObject !== null) {
          return done(null, userObject);
        }

        if (this.config.strategies[profile.provider].persist.length !== 0) {
          Object.keys(profile._json).forEach(attr => {
            if (this.config.strategies[profile.provider].persist.indexOf(attr) > -1) {
              user[attr] = profile._json[attr];
            }
          });

          if (!userProfile) {
            userCreation = this.context.accessors.users.create(profile._json.name, userProfile, user);
          }
          else {
            userCreation = this.context.accessors.users.create(profile._json.name, user);
          }

          return userCreation
            .then(() => done(null, user));
        }

        done(new this.context.errors.UnauthorizedError('Login failed'));
      })
      .catch(err => done(err));
  }
}

module.exports = Strategy;
