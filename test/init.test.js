const
  should = require('should'),
  proxyquire = require('proxyquire'),
  sandbox = require('sinon').sandbox.create(),
  PluginOAuth = proxyquire('../lib', {
    'passport-oauth2-refresh': {
      use: sandbox.stub()
    }
  });

describe('#init', function () {
  let
    pluginOauth,
    pluginContext = require('./mock/pluginContext.mock.js');

  beforeEach(function () {
    sandbox.reset();
    pluginOauth = new PluginOAuth();
  });

  it('should return a Promise', function () {
    should(pluginOauth.init(null, pluginContext)).be.a.Promise();
  });

  it('should initialize all strategies', function (done) {
    should(pluginOauth.strategies).not.be.ok();

    pluginOauth.init(null, pluginContext)
      .then(() => {
        should(pluginOauth.strategies).be.Object();
        done();
      });
  });

  it('should have a getUserRepository method returning an object', function() {
    pluginOauth.init(null, pluginContext);

    should(pluginOauth.getProviderRepository('provider')).be.an.Object();
  });
});
