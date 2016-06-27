var
  refresh = require('passport-oauth2-refresh');

/**
 * Interface to passportjs
 *
 * @param {Object} context - Kuzzle Plugin context
 * @param {Object} config - this plugin's current configuration
 */
module.exports = function (context, config) {
  this.config = config;
  this.context = context;

  /**
   * Initializes the configured strategies and load them to passportjs
   */
  this.init = function () {
    Object.keys(this.config.strategies).forEach(key => {
      var
        strategy,
        Strategy;

      if (!this.config.strategies[key].credentials) {
        return console.error(`Error loading strategy [${key}]: no credentials provided`);
      }

      try {
        Strategy = require('passport-' + key).Strategy;
      } catch (err) {
        /*eslint no-console: 0*/
        return console.error(`Error loading strategy [${key}]: ${err.message}`);
      }

      strategy = new Strategy(this.config.strategies[key].credentials, this.verify);
      this.context.accessors.passport.use(strategy);

      try {
        refresh.use(strategy);
      } catch (err) {
        /*eslint no-console: 0*/
        console.error(`Error refreshing strategy [${key}]: ${err.message}`);
      }
    });
  };

  this.verify = (accessToken, refreshToken, profile, done) => {
    var
      userProfile = this.config.defaultProfile || 'default',
      user = {};

    this.context.accessors.users.load(profile._json.name)
      .then(userObject => {
        if (userObject !== null) {
          return done(null, userObject);
        }

        if (this.config.strategies[profile.provider].persist.length !== 0) {
          Object.keys(profile._json).forEach(attr => {
            if (this.config.strategies[profile.provider].persist.indexOf(attr) > -1) {
              user[attr] = profile._json[attr];
            }
          });

          return this.context.accessors.users.create(profile._json.name, userProfile, user)
            .then(() => done(null, user));
        }

        done(new this.context.errors.UnauthorizedError('Login failed'));
      })
      .catch(err => done(err));
  };
};
