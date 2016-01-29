var
  should = require('should'),
  pipes = require('../lib/config/pipes'),
  rewire = require('rewire'),
  PluginGithub = rewire('../lib');

describe('pipes definition', function() {
  var pluginGithub;

  before(function () {
    pluginGithub = new PluginGithub();
    pluginGithub.init({persist: true, clientID: 'id', clientSecret: 'secret', callbackUrl: 'http://callback.url', scope: ['test']});
  });

  it('should link kuzzle pipe correctly', function() {
    should(pipes).be.an.Object();
    should(pipes["event:loadScope"]).be.a.String().and.be.eql('loadScope');
  });

  it('should trigger loadScope pipe', function(done) {
    pluginGithub.loadScope({scope: {}}, function(err, object) {
      should(object.github[0]).equal('test');
      done();
    });
  });
});