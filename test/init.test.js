var
  should = require('should'),
  rewire = require('rewire'),
  PluginGithub = rewire('../lib');

describe('The plugin github initialization', function () {

  var pluginGithub;

  before(function () {
    pluginGithub = new PluginGithub();
  });

  it('should return an error if no config is provided', function () {
    should(pluginGithub.init()).be.false();
  });

  it('should return an error if a configuration without "persist" is provided', function () {
    should(pluginGithub.init({foo: 'bar'})).be.false();
  });

  it('should return an error if no clientID is provided', function () {
    should(pluginGithub.init({})).be.false();
  });

  it('should return an error if no clientSecret is provided', function () {
    should(pluginGithub.init({clientID: "id"})).be.false();
  });

  it('should return an error if no callbackURL is provided', function () {
    should(pluginGithub.init({clientID: "id", clientSecret: "secret"})).be.false();
  });

  it('should return pluginGithub object if everything is ok', function () {
    should(pluginGithub.init({persist: true, clientID: "id", clientSecret: "secret", callbackUrl: "http://callback.url"})).be.Object();
  });

});