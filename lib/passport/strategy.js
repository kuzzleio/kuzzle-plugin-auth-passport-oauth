var
  q = require('q'),
  GithubStrategy = require('passport-github').Strategy,
  refresh = require('passport-oauth2-refresh');

module.exports = function(context) {

  this.verify = function (accessToken, refreshToken, profile, done) {
    var deferred = q.defer(),
      repositories = context.repositories(),
      user = new repositories.user.ObjectConstructor(),
      hydratedUser = {
        profile: 'admin',
        _id: profile._json.login
      };

    console.log('github verify: ', profile._json);

    repositories.user.load(profile._json.login)
      .then(userObject => {
        if (userObject !== null) {
          deferred.resolve(userObject);
        }
        else {
          Object.keys(profile._json).forEach(attr => {
            if (this.config.persist.indexOf(attr) > -1) {
              hydratedUser[attr] = profile._json[attr];
            }
          });
          if (this.config.persist.length !== 0) {
            repositories.user.hydrate(user, hydratedUser)
              .then(u => {
                console.log('hydrated user: ', u);
                repositories.user.persist(u, { database: {method: 'create'} });
              });
          }
          deferred.resolve(hydratedUser);
        }
      }).catch(err => deferred.reject(err));
    deferred.promise.nodeify(done);
    return deferred.promise;
  };

  this.load = function (passport, config) {
    var
      strategy = new GithubStrategy({
        clientID: config.clientID,
        clientSecret: config.clientSecret,
        callbackURL: config.callbackUrl
      }, this.verify.bind(this));
    this.config = config;
    passport.use(strategy);
    refresh.use(strategy);
  };
};
