var
  should = require('should'),
  pipes = require('../lib/config/pipes'),
  rewire = require('rewire'),
  PluginGithub = rewire('../lib'),
  strategy = require('../lib/passport/strategy'),
  proxyquire = require('proxyquire');


describe('passport verify', function() {
  var
    pluginGithub,
    Passport;

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

  it('should load a new user', function() {
    Passport = proxyquire('passport', {});
    strategy.verify();
  });
});