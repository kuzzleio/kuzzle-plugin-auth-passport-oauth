const
  should = require('should'),
  rewire = require('rewire'),
  PluginOAuth = rewire('../lib'),
  Strategy = require('../lib/passport/strategy'),
  proxyquire = require('proxyquire');

describe('passport verify', function() {
  let
    pluginOAuth,
    Passport,
    isCalled = false;
  const
    config = {
      "strategies": {
        "facebook": {
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
        "twitter": {
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
        "google-oauth": {
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
        "github": {
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
      }
    },
    context = {
      accessors: {}
    };

  before(function () {
    Object.defineProperty(context.accessors, 'users', {
      enumerable: true,
      get: function () {
        return {
          load: function () {
            return Promise.resolve(null);
          },
          create: function() {
            isCalled = true;
            return Promise.resolve();
          }
        };
      }
    });

    Object.defineProperty(context.accessors, 'registerStrategy', {
      enumerable: true,
      get: () => () => {}
    });

    pluginOAuth = new PluginOAuth();
    pluginOAuth.init({persist: true, strategies: {facebook: {clientID: "id", clientSecret: "secret", callbackUrl: "http://callback.url", scope: ['test']}}});
  });

  it('should persist and load a new user', done => {
    let strategy;

    Passport = proxyquire('passport', {});
    strategy = new Strategy(context, config);
    strategy.init();

    strategy.verify(null, "accessToken", "refreshToken", {
      provider: 'facebook',
      _json: {
        login: "login"
      }
    }, function(err, response) {
      if (err) {
        done(err);
      }

      should(response.login).be.a.String().and.be.eql('login');
      should(isCalled).equal(true);
      done();
    });
  });
});
