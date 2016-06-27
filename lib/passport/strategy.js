var
  refresh = require('passport-oauth2-refresh');

module.exports = function(context) {
  this.verify = (accessToken, refreshToken, profile, done) => {
    var
      userProfile = this.config.defaultProfile || 'default',
      user = {};

    context.accessors.users.load(profile._json.name)
      .then(userObject => {
        if (userObject !== null) {
          return done(null, userObject);
        }

        Object.keys(profile._json).forEach(attr => {
          if (this.config.strategies[profile.provider].persist.indexOf(attr) > -1) {
            user[attr] = profile._json[attr];
          }
        });

        if (this.config.strategies[profile.provider].persist.length !== 0) {
          context.accessors.users.create(profile._json.name, userProfile, user)
            .then(() => done(null, user))
            .catch(err => done(err));
        }
        else {
          done(null, user);
        }
      })
      .catch(err => done(err));
  };

  this.load = function (passport, config) {
    var strategy,
      Strategy,
      key;

    this.config = config;

    for (key in this.config.strategies) {
      try {
        Strategy = require('passport-' + key).Strategy;
      } catch (err) {
        /*eslint no-console: 0*/
        console.error(`Error loading strategy [${key}]: ${err.message}`);
      }
      strategy = new Strategy(this.config.strategies[key].credentials, this.verify);
      passport.use(strategy);
      try {
        refresh.use(strategy);
      } catch (err) {
        /*eslint no-console: 0*/
        console.error(`Error refreshing strategy [${key}]: ${err.message}`);
      }
    }
  };
};
