var
  q = require('q'),
  GithubStrategy = require('passport-github').Strategy,
  refresh = require('passport-oauth2-refresh');

module.exports = function(context) {

  this.verify = function (accessToken, refreshToken, profile, done) {
    var deferred = q.defer(),
      repositories = context.repositories(),
      user = new repositories.user.ObjectConstructor();
    repositories.user.load(profile._json.login)
      .then(userObject => {
        if (userObject !== null) {
          deferred.resolve(userObject);
        }
        else {
          if (this.config.persist.attrs.length !== 0) {
            repositories.user.hydrate(user, profile._json)
              .then(u => {
                Object.keys(profile._json).forEach(attr => {
                  if (this.config.persist.attrs.indexOf(attr) > -1 || attr === 'login') {
                    u[attr] = profile._json[attr];
                  }
                });
                u._id = null;
                return repositories.user.persist(u, { database: {method: 'create'} });
              });
          }
          deferred.resolve(profile);
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
