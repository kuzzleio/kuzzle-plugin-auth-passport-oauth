const
  should = require('should'),
  PluginOAuth = require('../lib'),
  sinon = require('sinon');

describe('#getInfo', () => {
  let pluginOauth;
  let pluginContext = require('./mock/pluginContext.mock.js');

  beforeEach(() => {
    sinon.restore();
    pluginOauth = new PluginOAuth();
    pluginOauth.getProviderRepository = sinon.stub();
    pluginOauth.context = pluginContext;
  });

  it('should reject because the user doesn\'t exist', () => {
    pluginOauth.getCredentialsFromKuid = sinon.stub().rejects(new Error());

    return should(pluginOauth.getInfo(null, {_id: 'foo'})).be.rejected();
  });

  it('should resolve the info without _id', () => {
    pluginOauth.getCredentialsFromKuid = sinon.stub().resolves({foo: 'bar'});
    return should(pluginOauth.getInfo(null, {_id: 'foo'})).be.fulfilledWith({foo: 'bar'});
  });
});
