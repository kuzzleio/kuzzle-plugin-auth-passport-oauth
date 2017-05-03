const
  refresh = require('passport-oauth2-refresh'),
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
        userId: {
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
  constructor () {
    this.context = null;
    this.scope = {};
    this.config = null;
    this.strategyConstructor = null;
  }

  /**
   * Initialize the plugin
   * Requires the right passport strategies to use according to the configuration
   *
   * @param customConfig
   * @param context
   * @returns {Promise|Promise.<TResult>}
   */
  init (customConfig, context) {
    this.config = Object.assign(defaultConfig, customConfig);

    if (Object.keys(this.config.strategies).length === 0) {
      /*eslint no-console: 0*/
      console.warn('kuzzle-plugin-auth-passport-oauth: no strategies specified.');
    }

    this.context = context;

    Object.keys(this.config.strategies).forEach(key => {
      this.scope[key] = this.config.strategies[key].scope;
    });

    return this.context.accessors.storage.bootstrap(storageMapping)
      .then(() => {
        return new Promise((resolve, reject) => {
          Object.keys(this.config.strategies).forEach(key => {
            if (!this.config.strategies[key].credentials) {
              return reject(new this.context.errors.BadRequestError(`Error loading strategy [${key}]: no credentials provided`));
            }

            try {
              this.strategyConstructor = require('passport-' + key).Strategy;
            } catch (err) {
              return reject(new this.context.errors.BadRequestError(`Error loading strategy [${key}]: ${err.message}`));
            }

            try {
              refresh.use(this.strategyConstructor);
            } catch (err) {
              /*eslint no-console: 0*/
              console.error(`Error refreshing strategy [${key}]: ${err.message}`);
            }
          });
          this.initStrategies();
          return resolve();
        });
      });
  }

  initStrategies () {
    this.strategies = {};
    Object.keys(this.config.strategies).forEach(strategy => {
      this.strategies[strategy] = {
        config: {
          constructor: this.strategyConstructor,
          strategyOptions: this.config.strategies[strategy].credentials,
          authenticateOptions: {
            scope: this.config.strategies[strategy].scope
          },
          fields: ['access_token', 'refresh_token'],
          verify: 'verify'
        },
        methods: {
          exists: 'exists',
          validate: 'validate',
          create: 'create',
          update: 'update',
          delete: 'delete',
          getInfo: 'getInfo'
        }
      };
    });
  }

  /**
   * Get the repository according to the strategy
   *
   * @param provider
   * @returns {module.exports.constructors.Repository|*}
   */
  getProviderRepository (provider) {
    if (!this.providerRepository) {
      this.providerRepository = new this.context.constructors.Repository(provider);
    }

    return this.providerRepository;
  }

  /**
   * Get the credentials of a given userId from the repository of the corresponding strategy
   *
   * @param userId
   * @param provider
   * @returns {Promise|Promise.<TResult>}
   */
  getCredentialsFromUserId (userId, provider) {
    return this.getProviderRepository(provider).search({
      query: {
        match: {
          userId
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
  verify (request, accessToken, refreshToken, profile) {
    const
      user = {};

    return this.getProviderRepository(profile.provider)
      .get(profile._json[this.config.strategies[profile.provider].useAsId])
      .then(userObject => {
        let req = null;

        if (userObject !== null) {
          return Promise.resolve(userObject.userId);
        }

        Object.keys(profile._json).forEach(attr => {
          if (this.config.strategies[profile.provider].persist.indexOf(attr) > -1) {
            user[attr] = profile._json[attr];
          }
        });

        if (this.config.strategies[profile.provider].persist.length !== 0) {
          req = {
            controller: 'security',
            action: 'createUser',
            _id: profile._json[this.config.strategies[profile.provider].useAsId],
            body: {
              content: {
                profileIds: this.config.defaultProfiles ? this.config.defaultProfiles : ['default']
              }, // content will be persisted in Kuzzle
              credentials: {} // credentials will be persisted in the repository
            }
          };

          if (this.config.strategies[profile.provider].mapToKuzzle) {
            Object.keys(this.config.strategies[profile.provider].mapToKuzzle)
              .forEach(attr => {
                req.body.content[attr] = profile._json[this.config.strategies[profile.provider].mapToKuzzle[attr]];
              });
          }

          user._id = profile._json[this.config.strategies[profile.provider].useAsId];
          req.body.credentials[profile.provider] = user;

          return this.context.accessors.execute(new this.context.constructors.Request(request.original, req))
            .then(() => {
              return Promise.resolve(profile._json[this.config.strategies[profile.provider].useAsId]);
            });
        }
        return Promise.resolve(profile._json[this.config.strategies[profile.provider].useAsId]);
      })
      .catch(err => Promise.reject(err));
  }

  /**
   * Check if a given user exists
   *
   * @param request
   * @param userId
   * @param provider
   * @returns {Promise|Promise.<boolean>}
   */
  exists (request, userId, provider) {
    return this.getCredentialsFromUserId(userId, provider)
      .then(credentials => Promise.resolve(credentials !== null));
  }

  /**
   * Create a user in the repository of the corresponding strategy
   *
   * @param request
   * @param credentials
   * @param userId user id in Kuzzle
   * @param provider
   * @returns {Promise|Promise.<TResult>}
   */
  create (request, credentials, userId, provider) {
    let user = {};

    return this.exists(request, userId, provider)
      .then(exists => {
        if (exists) {
          return Promise.reject(new this.context.errors.BadRequestError('A strategy already exists for this user.'));
        }
        Object.keys(credentials).forEach(attr => {
          user[attr] = credentials[attr];
        });
        user.userId = userId;

        return this.getProviderRepository(provider).create(user);
      });
  }

  /**
   * Update a user in the repository of the corresponding strategy
   *
   * @param request
   * @param credentials
   * @param userId
   * @param provider
   * @returns {Promise|Promise.<TResult>}
   */
  update (request, credentials, userId, provider) {
    return this.getCredentialsFromUserId(userId, provider)
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
   * @param userId
   * @param provider
   * @returns {Promise|Promise.<TResult>}
   */
  delete (request, userId, provider) {
    return this.getCredentialsFromUserId(userId, provider)
      .then(document => {
        if (document === null) {
          return Promise.reject(new this.context.errors.BadRequestError('A strategy does not exist for this user.'));
        }

        return this.getProviderRepository(provider).delete(document._id, {refresh: 'wait_for'});
      });
  }

  /**
   * Check if a userId already exists
   *
   * @param request
   * @param credentials
   * @param userId
   * @param provider
   * @returns {Promise|Promise.<TResult>}
   */
  validate (request, credentials, userId, provider) {
    return this.getProviderRepository(provider).get(credentials._id)
      .then(result => {
        if (result === null) {
          return Promise.resolve(true);
        }

        if (userId !== result.userId) {
          return Promise.reject(new this.context.errors.BadRequestError(`Login '${credentials._id}' is already used.`));
        }
        return Promise.resolve(true);
      });
  }

  /**
   * Get the credentials of the user.
   * This do not return the _id of the user
   *
   * @param request
   * @param userId
   * @param provider
   * @returns {Promise|Promise.<TResult>}
   */
  getInfo (request, userId, provider) {
    return this.getCredentialsFromUserId(userId, provider)
      .then(info => {
        if (info === null) {
          return Promise.reject(new this.context.errors.BadRequestError('A strategy does not exist for this user.'));
        }

        delete info._id;
        return Promise.resolve(info);
      });
  }
}

module.exports = PluginPassportOAuth;