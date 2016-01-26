var
  q = require('q'),
  GithubStrategy = require('passport-github2').Strategy;

module.exports = function(context) {

  this.verify = function (accessToken, refreshToken, profile, done) {
    var deferred = q.defer(),
      repositories = context.repositories();

    repositories.user.load(profile.username)
      .then(userObject => {
        if (userObject !== null) {
          deferred.resolve(userObject);
        }
        else {
          if (this.persist) {
            var user = repositories.user.anonymous();
            Object.keys(profile).forEach(function (attr) {
              user[attr] = profile[attr];
            });
            repositories.user.persist(user);
          }
          deferred.resolve(profile);
        }
      })
      .catch(err => deferred.reject(err));

    deferred.promise.nodeify(done);
    return deferred.promise;
  };

  this.load = function (passport, config) {
    this.config = config;
    var strategy = new GithubStrategy({
      clientID: this.config.clientID,
      clientSecret: this.config.clientSecret,
      callbackURL: this.config.callbackUrl
    }, this.verify.bind(this));

    passport.use(strategy);
  };
};
