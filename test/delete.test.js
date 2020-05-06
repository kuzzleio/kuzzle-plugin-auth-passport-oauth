const
  should = require('should'),
  PluginOAuth = require('../lib'),
  sinon = require('sinon');

describe('#delete', () => {
  let pluginOauth;
  let pluginContext = require('./mock/pluginContext.mock.js');

  beforeEach(() => {
    sinon.restore();
    pluginOauth = new PluginOAuth();
    pluginOauth.getProviderRepository = sinon.stub();
    pluginOauth.context = pluginContext;
  });

  it('should reject if the user doesn\'t exists', () => {
    pluginOauth.getCredentialsFromKuid = sinon.stub().resolves(null);

    return should(pluginOauth.delete()).be.rejected();
  });

  it('should delete a user', () => {
    const del = sinon.stub();

    pluginOauth.getProviderRepository = sinon.stub().returns({delete: del});
    pluginOauth.getCredentialsFromKuid = sinon.stub().resolves({_id: 'foo'});

    return pluginOauth.delete()
      .then(() => should(del.calledOnce).be.true());
  });
});
