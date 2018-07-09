const
  should = require('should'),
  proxyquire = require('proxyquire'),
  sinon = require('sinon'),
  PluginOAuth = proxyquire('../lib', {
    'passport-oauth2-refresh': {
      use: sinon.stub()
    }
  });

describe('#init', () => {
  let
    pluginOauth,
    pluginContext = require('./mock/pluginContext.mock.js'),
    config = {
      strategies: {
        facebook: {
          credentials: {
            clientId: 'clientId',
            secret: 'secret'
          }
        }
      }
    };

  beforeEach(() => {
    sinon.restore();
    pluginOauth = new PluginOAuth();
  });

  it('should reject if no credentials are specified', () => {
    return should(pluginOauth.init({strategies: {facebook: {}}}, pluginContext)).be.rejectedWith('Error loading strategy [facebook]: no credentials provided');
  });

  it('should reject if the strategy does not exists', () => {
    return should(pluginOauth.init({
      strategies: {
        fake: {
          credentials: {
            clientId: 'clientId',
            secret: 'secret'
          }
        }
      }
    }, pluginContext)).be.rejectedWith('Error loading strategy [fake]: Cannot find module \'passport-fake\'');
  });

  it('should initialize all strategies', () => {
    return pluginOauth.init(config, pluginContext)
      .then(() => {
        should(pluginOauth.strategies).be.Object().and.match({
          facebook: {
            config: {
              authenticator: 'facebook',
              strategyOptions: {
                clientId: 'clientId',
                secret: 'secret'
              },
              authenticateOptions: {}
            },
            methods: {
              afterRegister: 'afterRegister',
              create: 'create',
              delete: 'delete',
              exists: 'exists',
              getById: 'getById',
              getInfo: 'getInfo',
              update: 'update',
              validate: 'validate',
              verify: 'verify'
            }
          }
        });
      });
  });

  it('should expose a constructor property to Kuzzle pre-1.4.0', () => {
    pluginContext.config.version = '1.3.999';
    return pluginOauth.init(config, pluginContext)
      .then(() => {
        pluginContext.config.version = '1.4.0';
        should(pluginOauth.strategies).be.Object().and.match({
          facebook: {
            config: {
              constructor: () => {},
              strategyOptions: {
                clientId: 'clientId',
                secret: 'secret'
              },
              authenticateOptions: {}
            },
            methods: {
              afterRegister: 'afterRegister',
              create: 'create',
              delete: 'delete',
              exists: 'exists',
              getById: 'getById',
              getInfo: 'getInfo',
              update: 'update',
              validate: 'validate',
              verify: 'verify'
            }
          }
        });
      });
  });
});
