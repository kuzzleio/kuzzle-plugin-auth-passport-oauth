const
  should = require('should'),
  PluginOAuth = require('../lib'),
  sandbox = require('sinon').sandbox.create();

describe('#create', () => {
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

  it('should reject if the user already exists', () => {
    pluginOauth.exists = sandbox.stub().returns(Promise.resolve(true));
    return should(pluginOauth.create()).be.rejectedWith('A strategy already exists for this user.');
  });

  it('should create a user', () => {
    const create = sandbox.stub();

    pluginOauth.getProviderRepository = sandbox.stub().returns({create});
    pluginOauth.exists = sandbox.stub().returns(Promise.resolve(false));
    return pluginOauth.create(null, {local: {identifierAttribute: '_id'}}, '42', 'local')
      .then(() => {
        should(create.calledOnce).be.true();
      });
  });
});
