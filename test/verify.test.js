const
  should = require('should'),
  PluginOAuth = require('../lib'),
  sinon = require('sinon');

describe('#verify', () => {
  let
    pluginOauth,
    pluginContext = require('./mock/pluginContext.mock.js');

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
  });

  it('should resolve an existing user', () => {
    pluginOauth.getProviderRepository = sinon.stub().returns({get: sinon.stub().resolves({kuid: '24'})});
    return should(pluginOauth.verify(null, null, null, {provider: 'facebook', _json: {id: '42'}})).be.fulfilledWith({kuid: '24', message: null});
  });

  it('should resolve with the new user id and persist it', () => {
    pluginOauth.getProviderRepository = sinon.stub().returns({get: sinon.stub().resolves(null)});
    pluginOauth.config.strategies.facebook.persist = ['name'];

    return pluginOauth.verify({}, null, null, {provider: 'facebook', _json: {id: '42', name: 'foo'}})
      .then(result => {
        should(result).match({kuid: '42', message: null});
        should(pluginOauth.context.accessors.execute.called).be.true();
      });
  });

  it('should resolve with the new user id and persist it with some mapping', (done) => {
    let status = 'pending';

    pluginOauth.getProviderRepository = sinon.stub().returns({get: sinon.stub().resolves(null)});
    pluginOauth.context.constructors.Request = sinon.stub().callsFake(() => {
      try {
        status = 'verified';
      }
      catch (e) {
        status = 'error: ' + e;
      }
    });

    pluginOauth.config.strategies.facebook.persist = ['name'];

    pluginOauth.verify({}, null, null, {provider: 'facebook', _json: {id: '42', name: 'foo', displayName: 'Displayed name'}})
      .then(() => {
        if (status === 'verified') {
          done();
        } else {
          done('Unexpected test result: ' + status);
        }
      })
      .catch(e => done(e));
  });
});
