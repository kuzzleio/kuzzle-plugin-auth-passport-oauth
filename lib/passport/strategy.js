var
  q = require('q'),
  GithubStrategy = require('passport-github').Strategy;

module.exports = function(context){

    this.clientID = 'b3a0b66b2e4512d90037';
    this.clientSecret = 'a3c3ad74f5b38377a9ef062d5f57f2b57a04a4c7';
    this.callbackUrl = 'http://kuzzle:7512/api/1.0/_login/github';

    this.verify = function(accessToken, refreshToken, profile, done) {
      var deferred = q.defer(),
        repositories = context.repositories();

      console.log('Access Token => ');
      console.log(accessToken);
      console.log('Refresh Token => ');
      console.log(refreshToken);
      console.log('Profile => ');
      console.log(profile);

      deferred.resolve(profile.id);

      deferred.promise.nodeify(done);
      return deferred.promise;
    };

    this.load = function(passport) {
      var strategy = new GithubStrategy({
          clientID: this.clientID,
          clientSecret: this.clientSecret,
          callbackURL: this.callbackUrl
        }, this.verify);

      passport.use(strategy);

    };
};
