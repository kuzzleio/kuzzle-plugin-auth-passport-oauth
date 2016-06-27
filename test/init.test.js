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
    pluginOAuth.init();
    should(pluginOAuth.isDummy).be.true();
  });

  it('should return an error if strategies config is empty', function() {
    pluginOAuth.init({strategies: []});
    should(pluginOAuth.isDummy).be.true();
  });

  it('should return an error if a configuration without "persist" is provided', function () {
    pluginOAuth.init({strategies: ['facebook'], foo: 'bar'});
    should(pluginOAuth.isDummy).be.true();
  });

  it('should return pluginOauth object if everything is ok', function () {
    should(pluginOAuth.init({persist: true, strategies: [{name: "facebook", clientID: "id", clientSecret: "secret", callbackUrl: "http://callback.url"}]})).be.Object();
  });

});
