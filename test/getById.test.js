const
  should = require('should'),
  PluginOAuth = require('../lib'),
  sandbox = require('sinon').sandbox.create();

describe('#getById', () => {
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
    pluginOauth.getProviderRepository = sandbox.stub().returns({get: sandbox.stub().returns(Promise.resolve(null))});
    return should(pluginOauth.getById(null, '42')).be.rejectedWith('A strategy does not exist for this user.');
  });

  it('should resolve true', () => {
    const doc = {_id: '42'};

    pluginOauth.getProviderRepository = sandbox.stub().returns({get: sandbox.stub().returns(Promise.resolve(doc))});
    return should(pluginOauth.getById(null, '42')).be.fulfilledWith(doc);
  });
});
