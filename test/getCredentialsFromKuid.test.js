const
  should = require('should'),
  PluginOAuth = require('../lib'),
  sinon = require('sinon');

describe('#getCredentialsFromKuid', () => {
  let
    pluginOauth;
  
  beforeEach(() => {
    sinon.restore();
    pluginOauth = new PluginOAuth();
  });

  it('should resolve with a null result', () => {
    pluginOauth.getProviderRepository = sinon.stub().returns({
      search: sinon.stub().resolves({total: 0})
    });

    return should(pluginOauth.getCredentialsFromKuid(null, null)).be.fulfilledWith(null);
  });

  it('should resolve with a null result', () => {
    pluginOauth.getProviderRepository = sinon.stub().returns({
      search: sinon.stub().resolves({total: 1, hits: [{id: 'foo'}]})
    });

    return should(pluginOauth.getCredentialsFromKuid(null, null)).be.fulfilledWith({id: 'foo'});
  });
});
