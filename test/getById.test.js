const
  should = require('should'),
  PluginOAuth = require('../lib'),
  sinon = require('sinon');

describe('#getById', () => {
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
    pluginOauth.getProviderRepository = sinon.stub().returns({get: sinon.stub().resolves(null)});
    return should(pluginOauth.getById(null, '42')).be.rejectedWith('A strategy does not exist for this user.');
  });

  it('should resolve true', () => {
    const doc = {_id: '42'};

    pluginOauth.getProviderRepository = sinon.stub().returns({get: sinon.stub().resolves(doc)});
    return should(pluginOauth.getById(null, '42')).be.fulfilledWith(doc);
  });
});
