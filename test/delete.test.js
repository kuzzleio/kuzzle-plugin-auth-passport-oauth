const
  should = require('should'),
  PluginOAuth = require('../lib'),
  sandbox = require('sinon').sandbox.create();

describe('#delete', () => {
  let
    pluginOauth,
    pluginContext = require('./mock/pluginContext.mock.js');

  beforeEach(() => {
    sandbox.reset();
    pluginOauth = new PluginOAuth();
    pluginOauth.getProviderRepository = sandbox.stub();
    pluginOauth.context = pluginContext;
  });

  it('should reject if the user doesn\'t exists', () => {
    pluginOauth.getCredentialsFromKuid = sandbox.stub().returns(Promise.resolve(null));
    return should(pluginOauth.delete()).be.rejectedWith('A strategy does not exist for this user.');
  });

  it('should delete a user', () => {
    const del = sandbox.stub();

    pluginOauth.getProviderRepository = sandbox.stub().returns({delete: del});
    pluginOauth.getCredentialsFromKuid = sandbox.stub().returns(Promise.resolve({_id: 'foo'}));
    return pluginOauth.delete()
      .then(() => should(del.calledOnce).be.true());
  });
});
