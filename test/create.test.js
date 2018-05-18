const
  should = require('should'),
  PluginOAuth = require('../lib'),
  sinon = require('sinon');

describe('#create', () => {
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

  it('should reject if the user already exists', () => {
    pluginOauth.exists = sinon.stub().resolves(true);
    return should(pluginOauth.create()).be.rejectedWith('A strategy already exists for this user.');
  });

  it('should create a user', () => {
    const create = sinon.stub();

    pluginOauth.getProviderRepository = sinon.stub().returns({create});
    pluginOauth.exists = sinon.stub().resolves(false);
    return pluginOauth.create(null, {local: {identifierAttribute: '_id'}}, '42', 'local')
      .then(() => {
        should(create.calledOnce).be.true();
      });
  });
});
