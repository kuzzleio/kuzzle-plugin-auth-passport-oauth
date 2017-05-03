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
  });

  it('should resolve true if the user doesn\'t exists', () => {
    const get = sandbox.stub().returns(Promise.resolve(null));

    pluginOauth.getProviderRepository = sandbox.stub().returns({get});
    return should(pluginOauth.validate(null, {_id: 'foo'})).be.fulfilledWith(true);
  });

  it('should reject a promise if the userId is not equal to the fetched user', () => {
    const get = sandbox.stub().returns(Promise.resolve({userId: "42"}));

    pluginOauth.getProviderRepository = sandbox.stub().returns({get});
    return should(pluginOauth.validate(null, {_id: "0"}, "0")).be.rejectedWith(`Login '0' is already used.`);
  });

  it('should resolve true', () => {
    const get = sandbox.stub().returns(Promise.resolve({userId: '42'}));

    pluginOauth.getProviderRepository = sandbox.stub().returns({get});
    return should(pluginOauth.validate(null, {_id: '42'}, '42')).be.fulfilledWith(true);
  });
});
