var
  should = require('should'),
  pipes = require('../lib/config/pipes'),
  rewire = require('rewire'),
  PluginOAuth = rewire('../lib');

describe('pipes definition', function() {
  var pluginOAuth;

  before(function () {
    pluginOAuth = new PluginOAuth();
    pluginOAuth.init({persist: true, strategies: {facebook: {clientID: "id", clientSecret: "secret", callbackUrl: "http://callback.url", scope: ['test']}}});
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
});