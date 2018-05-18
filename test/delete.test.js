const
  should = require('should'),
  PluginOAuth = require('../lib'),
  sinon = require('sinon');

describe('#delete', () => {
  let
    pluginOauth,
    pluginContext = require('./mock/pluginContext.mock.js');

  beforeEach(() => {
    sinon.restore();
    pluginOauth = new PluginOAuth();
    pluginOauth.getProviderRepository = sinon.stub();
    pluginOauth.context = pluginContext;
  });

  it('should reject if the user doesn\'t exists', () => {
    pluginOauth.getCredentialsFromKuid = sinon.stub().resolves(null);
    return should(pluginOauth.delete()).be.rejectedWith('A strategy does not exist for this user.');
  });

  it('should delete a user', () => {
    const del = sinon.stub();

    pluginOauth.getProviderRepository = sinon.stub().returns({delete: del});
    pluginOauth.getCredentialsFromKuid = sinon.stub().resolves({_id: 'foo'});
    return pluginOauth.delete()
      .then(() => should(del.calledOnce).be.true());
  });
});
