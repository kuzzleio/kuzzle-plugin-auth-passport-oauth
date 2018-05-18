const
  should = require('should'),
  PluginOAuth = require('../lib'),
  sinon = require('sinon');

describe('#update', () => {
  let
    pluginOauth,
    pluginContext = require('./mock/pluginContext.mock.js');

  beforeEach(() => {
    sinon.restore();
    pluginOauth = new PluginOAuth();
    pluginOauth.getProviderRepository = sinon.stub();
    pluginOauth.context = pluginContext;
  });

  it('should reject if the user doesn\'t exists', () => {
    pluginOauth.getCredentialsFromKuid = sinon.stub().resolves(null);
    return should(pluginOauth.update()).be.rejectedWith('A strategy does not exist for this user.');
  });

  it('should update a user', () => {
    const update = sinon.stub();

    pluginOauth.getProviderRepository = sinon.stub().returns({update});
    pluginOauth.getCredentialsFromKuid = sinon.stub().resolves({_id: 'foo'});
    return pluginOauth.update()
      .then(() => {
        should(update.calledOnce).be.true();
      });
  });
});
