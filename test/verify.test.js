const
  should = require('should'),
  PluginOAuth = require('../lib'),
  sinon = require('sinon');

describe('#verify', () => {
  let pluginOauth;
  let pluginContext = require('./mock/pluginContext.mock.js');

  beforeEach(() => {
    sinon.restore();
    pluginOauth = new PluginOAuth();
    pluginOauth.getProviderRepository = sinon.stub();
    pluginOauth.getCredentialsFromKuid = sinon.stub().resolves({foo: 'bar'});
    pluginOauth.context = pluginContext;

    pluginOauth.config = {
      strategies: {
        facebook: {
          persist: ['name'],
          identifierAttribute: 'id'
        }
      }
    };

    pluginContext.accessors.sdk.security.createUser.resolves({ _id: '42' });
  });

  it('should resolve an existing user', () => {
    pluginOauth.getProviderRepository = sinon.stub()
      .returns({get: sinon.stub().resolves({kuid: '24'})});

    return should(
      pluginOauth.verify(null, null, null, {provider: 'facebook', _json: {id: '42'}})
    ).be.fulfilledWith({kuid: '24'});
  });

  it('should resolve with the new user id and persist it', () => {
    const oauthPayload = {
      id: '42',
      name: 'foo'
    };
    pluginOauth.getProviderRepository = sinon.stub()
      .returns({get: sinon.stub().rejects({ id: 'services.storage.not_found'})});

    pluginOauth.config.strategies.facebook.persist = ['name'];

    return pluginOauth.verify(
      {}, null, null, {provider: 'facebook', _json: oauthPayload}
    )
      .then(result => {
        should(result).match({kuid: '42'});
        should(pluginContext.accessors.sdk.security.createUser).be.called();
      });
  });

  it('should resolve with the new user id and persist attributes with provided mapping', () => {
    const oauthPayload = {
      id: '42',
      profile: {
        picture: 'http://picture.url'
      },
      first_name: 'gordon'
    };

    pluginOauth.getProviderRepository = sinon.stub()
      .returns({get: sinon.stub().rejects({ id: 'services.storage.not_found'})});

    pluginOauth.config.defaultProfiles = ['oauth-default'];
    pluginOauth.config.strategies.facebook.persist = ['profile.picture', 'first_name'];
    pluginOauth.config.strategies.facebook.kuzzleAttributesMapping = { first_name: 'fb.first_name' };

    return pluginOauth.verify(
      {}, null, null, { provider: 'facebook', _json: oauthPayload }
    )
      .then(result => {
        should(result).match({ kuid: '42' });
        should(pluginContext.accessors.sdk.security.createUser).be.calledWithMatch(null, {
          content: {
            profileIds: ['oauth-default']
          },
          credentials: {
            facebook: {
              fb: {
                first_name: 'gordon'
              },
              profile: {
                picture: 'http://picture.url'
              }
            }
          }
        });
      });
  });
});
