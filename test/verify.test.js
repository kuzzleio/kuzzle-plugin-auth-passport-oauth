var
  should = require('should'),
  pipes = require('../lib/config/pipes'),
  rewire = require('rewire'),
  PluginOAuth = rewire('../lib'),
  Strategy = require('../lib/passport/strategy'),
  proxyquire = require('proxyquire'),
  q = require('q');

describe('passport verify', function() {
  var
    pluginOAuth,
    Passport,
    isCalled = false,
    config = {
      "strategies": [
        {
          name: "facebook",
          "credentials": {
            "clientID": "<your-client-id>",
            "clientSecret": "<your-client-secret>",
            "callbackUrl": "http://host:7511/api/1.0/_login/facebook",
          },
          "persist": [
            "login"
          ],
          "scope": [
            "user:email"
          ]
        },
        {
          name: "twitter",
          "credentials": {
            "consumerKey": "<your-client-id>",
            "consumerSecret": "<your-client-secret>",
            "callbackUrl": "http://host:7511/api/1.0/_login/twitter"
          },
          "persist": [
            "login"
          ],
          "scope": [
            "user:email"
          ]
        },
        {
          name: "google-oauth",
          "credentials": {
            "consumerKey": "<your-client-id>",
            "consumerSecret": "<your-client-secret>",
            "callbackUrl": "http://host:7511/api/1.0/_login/google-plus"
          },
          "persist": [
            "login"
          ],
          "scope": [
            "user:email"
          ]
        },
        {
          name: "github",
          "credentials": {
            "clientID": "<your-client-id>",
            "clientSecret": "<your-client-secret>",
            "callbackUrl": "http://host:7511/api/1.0/_login/github"
          },
          "persist": [
            "login"
          ],
          "scope": [
            "user:email"
          ]
        }
      ]
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
    pluginOAuth = new PluginOAuth();
    pluginOAuth.init({persist: true, strategies: [{name: "facebook", clientID: "id", clientSecret: "secret", callbackUrl: "http://callback.url", scope: ["test"]}]});
  });

  it('should link kuzzle pipe correctly', function() {
    should(pipes).be.an.Object();
    should(pipes["passport:loadScope"]).be.a.String().and.be.eql('loadScope');
  });

  it('should trigger loadScope pipe', function(done) {
    pluginOAuth.loadScope({scope: {}}, function(err, object) {
      should(object.facebook[0]).equal('test');
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