const
  should = require('should'),
  PluginOAuth = require('../lib'),
  sandbox = require('sinon').sandbox.create();

describe('#verify', () => {
  let
    pluginOauth,
    pluginContext = require('./mock/pluginContext.mock.js');

  beforeEach(() => {
    sandbox.reset();
    pluginOauth = new PluginOAuth();
    pluginOauth.getProviderRepository = sandbox.stub();
    pluginOauth.getCredentialsFromKuid = sandbox.stub().returns(Promise.resolve({foo: 'bar'}));
    pluginOauth.context = pluginContext;

    pluginOauth.config = {
      strategies: {
        facebook: {
          persist: ['name'],
          identifierAttribute: 'id'
        }
      }
    }
  });

  it('should resolve an existing user', () => {
    pluginOauth.getCredentialsFromKuid = sandbox.stub().returns(Promise.resolve({kuid: '24'}));
    return should(pluginOauth.verify(null, null, null, {provider: 'facebook', _json: {kuid: '42'}})).be.fulfilledWith('24');
  });

  it('should resolve with the new user id and persist it', (done) => {
    pluginOauth.getCredentialsFromKuid = sandbox.stub().returns(Promise.resolve(null));
    pluginOauth.config.strategies.facebook.persist = ['name'];
    const promise = pluginOauth.verify({}, null, null, {provider: 'facebook', _json: {id: '42', name: 'foo'}});

    promise.then(() => {
      should(pluginOauth.context.accessors.execute.called).be.true();
      done();
    });
    return should(promise).be.fulfilledWith('42');
  });

  it('should resolve with the new user id and persist it with some mapping', (done) => {
    pluginOauth.getCredentialsFromKuid = sandbox.stub().returns(Promise.resolve(null));
    pluginOauth.context.constructors.Request = sandbox.stub().callsFake((request, req) => {
      should(req.body.content.kuzzleAttributesMapping).be.equal('Displayed name');
      done();
    });
    pluginOauth.config.strategies.facebook.persist = ['name'];
    pluginOauth.config.strategies.facebook.kuzzleAttributesMapping = {
      kuzzleAttributesMapping: 'displayName'
    };
    const promise = pluginOauth.verify({}, null, null, {provider: 'facebook', _json: {id: '42', name: 'foo', displayName: 'Displayed name'}});

    return should(promise).be.fulfilledWith('42');
  });
});
