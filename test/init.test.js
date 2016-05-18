var
  should = require('should'),
  rewire = require('rewire'),
  PluginOAuth = rewire('../lib');

describe('The plugin oauth initialization', function () {

  var pluginOAuth;

  before(function () {
    pluginOAuth = new PluginOAuth();
  });

  it('should return an error if no config is provided', function () {
    should(pluginOAuth.init()).be.false();
  });

  it('should return an error if strategies config is empty', function() {
    should(pluginOAuth.init({strategies: []})).be.false();
  });

  it('should return an error if a configuration without "persist" is provided', function () {
    should(pluginOAuth.init({strategies: ['facebook'], foo: 'bar'})).be.false();
  });

  it('should return pluginOauth object if everything is ok', function () {
    should(pluginOAuth.init({persist: true, strategies: [{name: "facebook", clientID: "id", clientSecret: "secret", callbackUrl: "http://callback.url"}]})).be.Object();
  });

});