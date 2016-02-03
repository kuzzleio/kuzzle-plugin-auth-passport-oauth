var
  should = require('should'),
  pipes = require('../lib/config/pipes'),
  rewire = require('rewire'),
  PluginGithub = rewire('../lib'),
  Strategy = require('../lib/passport/strategy'),
  proxyquire = require('proxyquire'),
  q = require('q');

describe('passport verify', function() {
  var
    pluginGithub,
    Passport,
    isCalled = false,
    config = {
      "persist": [
        "login"
      ],
      "scope": [
        "user:email"
      ],
      "clientID": "<your-client-id>",
      "clientSecret": "<your-client-secret>",
      "callbackUrl": "http://host:7511/api/1.0/_login/github"
    },
    context = {
      repositories: function() {
        return {
          user: {
            ObjectConstructor: function () {
              return {};
            },
            load: function () {
              return q(null);
            },
            persist: function() {
              isCalled = true;
            },
            hydrate: function() {
              return q({});
            }
          }
        };
      }
    };

  before(function () {
    pluginGithub = new PluginGithub();
    pluginGithub.init({persist: true, clientID: 'id', clientSecret: 'secret', callbackUrl: 'http://callback.url', scope: ['test']});
  });

  it('should link kuzzle pipe correctly', function() {
    should(pipes).be.an.Object();
    should(pipes["passport:loadScope"]).be.a.String().and.be.eql('loadScope');
  });

  it('should trigger loadScope pipe', function(done) {
    pluginGithub.loadScope({scope: {}}, function(err, object) {
      should(object.github[0]).equal('test');
      done();
    });
  });

  it('should persist and load a new user', function() {
    Passport = proxyquire('passport', {});
    Strategy = new Strategy(context);
    Strategy.load(Passport, config);
    Strategy.verify("accessToken", "refreshToken", {
      _json: {
        login: "login"
      }
    }, function() {}).then(function(response) {
      should(response.login).be.a.String().and.be.eql('login');
      should(isCalled).equal(true);
    });
  });
});