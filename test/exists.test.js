const
  should = require('should'),
  PluginOAuth = require('../lib'),
  sinon = require('sinon');

describe('#exists', () => {
  let pluginOauth;

  beforeEach(() => {
    sinon.restore();
    pluginOauth = new PluginOAuth();
    pluginOauth.getProviderRepository = sinon.stub();
  });

  it('should resolve true if user exists', () => {
    pluginOauth.getCredentialsFromKuid = sinon.stub().resolves({_id: '42'});
    return should(pluginOauth.exists()).be.fulfilledWith(true);
  });

  it('should resolve false if user doesn\'t exists', () => {
    pluginOauth.getCredentialsFromKuid = sinon.stub().resolves(null);
    return should(pluginOauth.exists()).be.fulfilledWith(false);
  });
});
