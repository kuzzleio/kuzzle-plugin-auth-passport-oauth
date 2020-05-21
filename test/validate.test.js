const
  should = require('should'),
  PluginOAuth = require('../lib'),
  sinon = require('sinon');

describe('#validate', () => {
  let
    pluginOauth,
    pluginContext = require('./mock/pluginContext.mock.js');

  beforeEach(() => {
    sinon.restore();
    pluginOauth = new PluginOAuth();
    pluginOauth.getProviderRepository = sinon.stub();
    pluginOauth.context = pluginContext;
    pluginOauth.config = {strategies: {local: {identifierAttribute: '_id'}}};
  });

  it('should resolve with true if the user doesn\'t exists', () => {
    const get = sinon.stub().resolves({ kuid: '42' });

    pluginOauth.getProviderRepository = sinon.stub().returns({get});

    return should(pluginOauth.validate(null, {_id: 'foo'}, '42', 'local'))
      .be.fulfilledWith(true);
  });

  it('should rejects if the kuid is not equal to the fetched user', () => {
    const get = sinon.stub().resolves({kuid: '42'});

    pluginOauth.getProviderRepository = sinon.stub().returns({get});

    return should(pluginOauth.validate(null, {_id: '0'}, '0', 'local'))
      .be.rejected();
  });

  it('should resolve true', () => {
    const get = sinon.stub().resolves({kuid: '42'});

    pluginOauth.getProviderRepository = sinon.stub().returns({get});

    return should(pluginOauth.validate(null, {_id: '42'}, '42', 'local'))
      .be.fulfilledWith(true);
  });
});
