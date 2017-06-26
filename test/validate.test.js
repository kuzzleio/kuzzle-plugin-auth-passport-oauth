const
  should = require('should'),
  PluginOAuth = require('../lib'),
  sandbox = require('sinon').sandbox.create();

describe('#validate', () => {
  let
    pluginOauth,
    pluginContext = require('./mock/pluginContext.mock.js');

  beforeEach(() => {
    sandbox.reset();
    pluginOauth = new PluginOAuth();
    pluginOauth.getProviderRepository = sandbox.stub();
    pluginOauth.context = pluginContext;
    pluginOauth.config = {strategies: {local: {identifierAttribute: '_id'}}};
  });

  it('should resolve true if the user doesn\'t exists', () => {
    const get = sandbox.stub().returns(Promise.resolve(null));

    pluginOauth.getProviderRepository = sandbox.stub().returns({get});
    return should(pluginOauth.validate(null, {_id: 'foo'}, '42', 'local')).be.fulfilledWith(true);
  });

  it('should reject a promise if the kuid is not equal to the fetched user', () => {
    const get = sandbox.stub().returns(Promise.resolve({kuid: '42'}));

    pluginOauth.getProviderRepository = sandbox.stub().returns({get});
    return should(pluginOauth.validate(null, {_id: '0'}, '0', 'local')).be.rejectedWith(`Id '0' is already used.`);
  });

  it('should resolve true', () => {
    const get = sandbox.stub().returns(Promise.resolve({kuid: '42'}));

    pluginOauth.getProviderRepository = sandbox.stub().returns({get});
    return should(pluginOauth.validate(null, {_id: '42'}, '42', 'local')).be.fulfilledWith(true);
  });
});
