const
  should = require('should'),
  PluginOAuth = require('../lib'),
  sinon = require('sinon');

describe('#getCredentialsFromKuid', () => {
  let pluginOauth;
  let pluginContext = require('./mock/pluginContext.mock.js');

  beforeEach(() => {
    sinon.restore();
    pluginOauth = new PluginOAuth();
    pluginOauth.context = pluginContext;
  });

  it('should rejects if no credentials can be found', () => {
    pluginOauth.getProviderRepository = sinon.stub().returns({
      search: sinon.stub().resolves({total: 0})
    });

    return should(pluginOauth.getCredentialsFromKuid(null, null)).be.rejected();
  });

  it('should resolve with the credentials', () => {
    pluginOauth.getProviderRepository = sinon.stub().returns({
      search: sinon.stub().resolves({total: 1, hits: [{id: 'foo'}]})
    });

    return should(pluginOauth.getCredentialsFromKuid(null, null)).be.fulfilledWith({id: 'foo'});
  });
});
