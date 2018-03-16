const
  should = require('should'),
  PluginOAuth = require('../lib'),
  sandbox = require('sinon').sandbox.create();

describe('#update', () => {
  let
    pluginOauth,
    pluginContext = require('./mock/pluginContext.mock.js');

  beforeEach(() => {
    sandbox.reset();
    pluginOauth = new PluginOAuth();
    pluginOauth.getProviderRepository = sandbox.stub();
    pluginOauth.context = pluginContext;
  });

  it('should reject if the user doesn\'t exists', () => {
    pluginOauth.getCredentialsFromKuid = sandbox.stub().returns(Promise.resolve(null));
    return should(pluginOauth.update()).be.rejectedWith('A strategy does not exist for this user.');
  });

  it('should update a user', () => {
    const update = sandbox.stub();

    pluginOauth.getProviderRepository = sandbox.stub().returns({update});
    pluginOauth.getCredentialsFromKuid = sandbox.stub().returns(Promise.resolve({_id: 'foo'}));
    return pluginOauth.update()
      .then(() => {
        should(update.calledOnce).be.true();
      });
  });
});
