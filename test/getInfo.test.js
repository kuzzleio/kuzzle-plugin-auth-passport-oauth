const
  should = require('should'),
  PluginOAuth = require('../lib'),
  sandbox = require('sinon').sandbox.create();

describe('#getInfo', () => {
  let
    pluginOauth,
    pluginContext = require('./mock/pluginContext.mock.js');

  beforeEach(() => {
    sandbox.reset();
    pluginOauth = new PluginOAuth();
    pluginOauth.getProviderRepository = sandbox.stub();
    pluginOauth.context = pluginContext;
  });

  it('should reject because the user doesn\'t exist', () => {
    pluginOauth.getCredentialsFromKuid = sandbox.stub().returns(Promise.resolve(null));
    return should(pluginOauth.getInfo(null, {_id: 'foo'})).be.rejectedWith('A strategy does not exist for this user.');
  });

  it('should resolve the info without _id', () => {
    pluginOauth.getCredentialsFromKuid = sandbox.stub().returns(Promise.resolve({foo: 'bar'}));
    return should(pluginOauth.getInfo(null, {_id: 'foo'})).be.fulfilledWith({foo: 'bar'});
  });
});
