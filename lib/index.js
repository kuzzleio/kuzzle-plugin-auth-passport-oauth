const
  refresh = require('passport-oauth2-refresh'),
  semver = require('semver'),
  defaultConfig = {},
  storageMapping = {
    configuration: {
      properties: {
        configurationValue: {
          type: 'keyword'
        }
      }
    },
    users: {
      properties: {
        kuid: {
          type: 'keyword'
        }
      }
    }
  };

/**
 * @class PluginPassportOAuth
 */
class PluginPassportOAuth {
  /**
   * @constructor
   */
  constructor() {
    this.context = null;
    this.scope = {};
    this.config = null;
    this.authenticators = {};
    this.strategies = null;
  }

  /**
   * Initialize the plugin
   * Requires the right passport strategies to use according to the configuration
   *
   * @param customConfig
   * @param context
   * @returns {Promise|Promise.<TResult>}
   */
  init(customConfig, context) {
    this.config = Object.assign(defaultConfig, customConfig);

    if (!this.config.strategies || Object.keys(this.config.strategies).length === 0) {
      /*eslint no-console: 0*/
      console.warn('[kuzzle-plugin-auth-passport-oauth] No strategies specified.');
      return Promise.resolve();
    }

    this.context = context;

    Object.keys(this.config.strategies).forEach(key => {
      this.scope[key] = this.config.strategies[key].scope;
    });

    return this.context.accessors.storage.bootstrap(storageMapping)
      .then(() => {
        this.strategies = {};
        Object.keys(this.config.strategies).forEach(strategy => {
          if (!this.config.strategies[strategy].credentials) {
            throw new this.context.errors.BadRequestError(`Error loading strategy [${strategy}]: no credentials provided`);
          }

          try {
            this.authenticators[strategy] = require('passport-' + strategy).Strategy;
          } catch (err) {
            throw new this.context.errors.BadRequestError(`Error loading strategy [${strategy}]: ${err.message}`);
          }

          this.strategies[strategy] = {
            config: {
              strategyOptions: this.config.strategies[strategy].credentials,
              authenticateOptions: {
                scope: this.config.strategies[strategy].scope
              },
              fields: this.config.strategies[strategy].persist
            },
            methods: {
              create: 'create',
              delete: 'delete',
              exists: 'exists',
              getInfo: 'getInfo',
              update: 'update',
              validate: 'validate',
              verify: 'verify',
              afterRegister: 'afterRegister',
              getById: 'getById'
            }
          };

          // This snippet simply suppresses a warning emitted by Kuzzle during
          // plugin initialization.
          // See https://github.com/kuzzleio/kuzzle/pull/1145
          if (semver.lt(this.context.config.version, '1.4.0')) {
            this.strategies[strategy].config.constructor = this.authenticators[strategy];
          } else {
            this.strategies[strategy].config.authenticator = strategy;
          }
        });
      });
  }

  afterRegister(strategyInstance) {
    try {
      refresh.use(strategyInstance);
    } catch (err) {
      /*eslint no-console: 0*/
      console.error(`Error refreshing strategy: ${err.message}`);
    }
  }

  /**
   * Get the repository according to the strategy
   *
   * @param provider
   * @returns {module.exports.constructors.Repository|*}
   */
  getProviderRepository(provider) {
    if (!this.providerRepository) {
      this.providerRepository = new this.context.constructors.Repository(provider);
    }

    return this.providerRepository;
  }

  /**
   * Get the credentials of a given kuid from the repository of the corresponding strategy
   *
   * @param kuid
   * @param provider
   * @returns {Promise|Promise.<TResult>}
   */
  getCredentialsFromKuid(kuid, provider) {
    return this.getProviderRepository(provider).search({
      query: {
        term: {
          kuid
        }
      }
    })
      .then(result => {
        if (result.total === 0) {
          return Promise.resolve(null);
        }

        return Promise.resolve(result.hits[0]);
      });
  }

  /**
   * Verify function called by passport to log the user.
   * If a persist option is in the configuration of the strategy then every field present in this configuration will be persisted in the repository.
   *
   * @param request
   * @param accessToken
   * @param refreshToken
   * @param profile
   * @returns {Promise.<T>}
   */
  verify(request, accessToken, refreshToken, profile) {
    const
      user = {};

    return this.getProviderRepository(profile.provider)
      .get(profile._json[this.config.strategies[profile.provider].identifierAttribute])
      .then(userObject => {
        let req = null;

        if (userObject !== null) {
          return Promise.resolve({kuid: userObject.kuid, message: null});
        }

        if (this.config.strategies[profile.provider].persist.length !== 0) {
          Object.keys(profile._json).forEach(attr => {
            if (this.config.strategies[profile.provider].persist.indexOf(attr) > -1) {
              user[attr] = profile._json[attr];
            }
          });

          req = {
            controller: 'security',
            action: 'createUser',
            body: {
              content: {
                profileIds: this.config.defaultProfiles ? this.config.defaultProfiles : ['default']
              }, // content will be persisted in Kuzzle
              credentials: {} // credentials will be persisted in the repository
            }
          };

          req.body.credentials[profile.provider] = user;

          return this.context.accessors.execute(new this.context.constructors.Request(request.original, req, {refresh: 'wait_for'}))
            .then(res => Promise.resolve({kuid: res.result._id, message: null}));
        }
        return Promise.resolve({kuid: null, message: `Could not login with strategy "${profile.provider}"`});
      })
      .catch(err => Promise.reject(err));
  }

  /**
   * Check if a given user exists
   *
   * @param request
   * @param kuid
   * @param provider
   * @returns {Promise|Promise.<boolean>}
   */
  exists(request, kuid, provider) {
    return this.getCredentialsFromKuid(kuid, provider)
      .then(credentials => Promise.resolve(credentials !== null));
  }

  /**
   * Create a user in the repository of the corresponding strategy
   *
   * @param request
   * @param credentials
   * @param kuid user id in Kuzzle
   * @param provider
   * @returns {Promise|Promise.<TResult>}
   */
  create(request, credentials, kuid, provider) {
    let user = {};

    return this.exists(request, kuid, provider)
      .then(exists => {
        if (exists) {
          return Promise.reject(new this.context.errors.BadRequestError('A strategy already exists for this user.'));
        }
        Object.keys(credentials).forEach(attr => {
          user[attr] = credentials[attr];
        });
        user.kuid = kuid;
        user._id = credentials[this.config.strategies[provider].identifierAttribute];

        return this.getProviderRepository(provider).create(user);
      });
  }

  /**
   * Update a user in the repository of the corresponding strategy
   *
   * @param request
   * @param credentials
   * @param kuid
   * @param provider
   * @returns {Promise|Promise.<TResult>}
   */
  update(request, credentials, kuid, provider) {
    return this.getCredentialsFromKuid(kuid, provider)
      .then(document => {
        if (document === null) {
          return Promise.reject(new this.context.errors.BadRequestError('A strategy does not exist for this user.'));
        }

        return this.getProviderRepository(provider).update(
          Object.assign({_id: document._id}, credentials)
        );
      });
  }

  /**
   * Delete a user in the repository of the corresponding strategy
   *
   * @param request
   * @param kuid
   * @param provider
   * @returns {Promise|Promise.<TResult>}
   */
  delete(request, kuid, provider) {
    return this.getCredentialsFromKuid(kuid, provider)
      .then(document => {
        if (document === null) {
          return Promise.reject(new this.context.errors.BadRequestError('A strategy does not exist for this user.'));
        }

        return this.getProviderRepository(provider).delete(document._id, {refresh: 'wait_for'});
      });
  }

  /**
   * Check if a kuid already exists
   *
   * @param request
   * @param credentials
   * @param kuid
   * @param provider
   * @returns {Promise|Promise.<TResult>}
   */
  validate(request, credentials, kuid, provider, isUpdate) {
    if (!isUpdate && !credentials[this.config.strategies[provider].identifierAttribute]) {
      return Promise.reject(new this.context.errors.BadRequestError(''));
    }
    return this.getProviderRepository(provider).get(credentials[this.config.strategies[provider].identifierAttribute])
      .then(result => {
        if (result === null) {
          return Promise.resolve(true);
        }

        if (kuid !== result.kuid) {
          return Promise.reject(new this.context.errors.BadRequestError(`Id '${credentials[this.config.strategies[provider].identifierAttribute]}' is already used.`));
        }
        return Promise.resolve(true);
      });
  }

  /**
   * Get the credentials of the user.
   * This do not return the kuid of the user
   *
   * @param request
   * @param kuid
   * @param provider
   * @returns {Promise|Promise.<TResult>}
   */
  getInfo(request, kuid, provider) {
    return this.getCredentialsFromKuid(kuid, provider)
      .then(info => {
        if (info === null) {
          return Promise.reject(new this.context.errors.BadRequestError('A strategy does not exist for this user.'));
        }

        delete info._id;
        delete info.kuid;
        return Promise.resolve(info);
      });
  }

  /**
   * Get the credentials of the user from id
   *
   * @param request
   * @param id
   * @param provider
   * @returns {Promise|Promise.<TResult>}
   */
  getById(request, id, provider) {
    return this.getProviderRepository(provider).get(id)
      .then(result => {
        if (result === null) {
          return Promise.reject(new this.context.errors.BadRequestError('A strategy does not exist for this user.'));
        }

        return Promise.resolve(result);
      });
  }
}

module.exports = PluginPassportOAuth;
