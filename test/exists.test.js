const
  should = require('should'),
  PluginOAuth = require('../lib'),
  sinon = require('sinon');

describe('#exists', () => {
  let pluginOauth;
  let pluginContext = require('./mock/pluginContext.mock.js');

  beforeEach(() => {
    sinon.restore();
    pluginOauth = new PluginOAuth();
    pluginOauth.getProviderRepository = sinon.stub();
    pluginOauth.context = pluginContext;
  });

  it('should resolve true if user exists', () => {
    pluginOauth.getCredentialsFromKuid = sinon.stub().resolves({_id: '42'});

    return should(pluginOauth.exists()).be.fulfilledWith(true);
  });

  it('should resolve false if user doesn\'t exists', () => {
    pluginOauth.getCredentialsFromKuid = sinon.stub().rejects(new pluginContext.errors.NotFoundError('not found'));

    return should(pluginOauth.exists()).be.fulfilledWith(false);
  });
});
