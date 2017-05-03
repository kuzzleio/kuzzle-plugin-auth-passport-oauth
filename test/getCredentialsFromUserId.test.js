const
  should = require('should'),
  PluginOAuth = require('../lib'),
  sandbox = require('sinon').sandbox.create();

describe('#getCredentialsFromUserId', () => {
  let
    pluginOauth;
  
  beforeEach(() => {
    sandbox.reset();
    pluginOauth = new PluginOAuth();
  });

  it('should resolve with a null result', () => {
    pluginOauth.getProviderRepository = sandbox.stub().returns({
      search: sandbox.stub().returns(Promise.resolve({total: 0}))
    });

    return should(pluginOauth.getCredentialsFromUserId(null, null)).be.fulfilledWith(null);
  });

  it('should resolve with a null result', () => {
    pluginOauth.getProviderRepository = sandbox.stub().returns({
      search: sandbox.stub().returns(Promise.resolve({total: 1, hits: [{id: 'foo'}]}))
    });

    return should(pluginOauth.getCredentialsFromUserId(null, null)).be.fulfilledWith({id: 'foo'});
  });
});
