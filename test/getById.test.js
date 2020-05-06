const
  should = require('should'),
  PluginOAuth = require('../lib'),
  sinon = require('sinon');

describe('#getById', () => {
  let pluginOauth;
  let pluginContext = require('./mock/pluginContext.mock.js');

  beforeEach(() => {
    sinon.restore();
    pluginOauth = new PluginOAuth();
    pluginOauth.getProviderRepository = sinon.stub();
    pluginOauth.context = pluginContext;
  });

  it('should reject because the user doesn\'t exist', () => {
    pluginOauth.getProviderRepository = sinon.stub().returns({get: sinon.stub().rejects()});
    return should(pluginOauth.getById(null, '42')).be.rejected();
  });

  it('should resolve true', () => {
    const doc = {_id: '42'};

    pluginOauth.getProviderRepository = sinon.stub().returns({get: sinon.stub().resolves(doc)});
    return should(pluginOauth.getById(null, '42')).be.fulfilledWith(doc);
  });
});
