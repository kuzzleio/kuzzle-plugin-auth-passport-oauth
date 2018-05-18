const
  should = require('should'),
  PluginOAuth = require('../lib'),
  sinon = require('sinon');

describe('#getInfo', () => {
  let
    pluginOauth,
    pluginContext = require('./mock/pluginContext.mock.js');

  beforeEach(() => {
    sinon.restore();
    pluginOauth = new PluginOAuth();
    pluginOauth.getProviderRepository = sinon.stub();
    pluginOauth.context = pluginContext;
  });

  it('should reject because the user doesn\'t exist', () => {
    pluginOauth.getCredentialsFromKuid = sinon.stub().resolves(null);
    return should(pluginOauth.getInfo(null, {_id: 'foo'})).be.rejectedWith('A strategy does not exist for this user.');
  });

  it('should resolve the info without _id', () => {
    pluginOauth.getCredentialsFromKuid = sinon.stub().resolves({foo: 'bar'});
    return should(pluginOauth.getInfo(null, {_id: 'foo'})).be.fulfilledWith({foo: 'bar'});
  });
});
