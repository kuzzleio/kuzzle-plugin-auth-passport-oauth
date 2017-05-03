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
    pluginOauth.getCredentialsFromUserId = sandbox.stub().returns(Promise.resolve({foo: 'bar'}));
    pluginOauth.context = pluginContext;

    pluginOauth.config = {
      strategies: {
        facebook: {
          persist: [],
          useAsId: 'id'
        }
      }
    }
  });

  it('should resolve an existing user', () => {
    pluginOauth.getProviderRepository = sandbox.stub().returns({get: sandbox.stub().returns(Promise.resolve({userId: '24'}))});
    return should(pluginOauth.verify(null, null, null, {provider: 'facebook', _json: {id: '42'}})).be.fulfilledWith('24');
  });

  it('should resolve with the new user id and persist nothing', (done) => {
    pluginOauth.getProviderRepository = sandbox.stub().returns({get: sandbox.stub().returns(Promise.resolve(null))});
    const promise = pluginOauth.verify(null, null, null, {provider: 'facebook', _json: {id: '42'}});

    promise.then(() => {
      should(pluginOauth.context.accessors.execute.called).be.false();
      done();
    });
    return should(promise).be.fulfilledWith('42');
  });

  it('should resolve with the new user id and persist it', (done) => {
    pluginOauth.getProviderRepository = sandbox.stub().returns({get: sandbox.stub().returns(Promise.resolve(null))});
    pluginOauth.config.strategies.facebook.persist = ['name'];
    const promise = pluginOauth.verify({}, null, null, {provider: 'facebook', _json: {id: '42', name: 'foo'}});

    promise.then(() => {
      should(pluginOauth.context.accessors.execute.called).be.true();
      done();
    });
    return should(promise).be.fulfilledWith('42');
  });
});
