const assert = require('assert');
const get = require('lodash.get');
const set = require('lodash.set');
const refresh = require('passport-oauth2-refresh');

/**
 * @class PluginPassportOAuth
 */
class PluginPassportOAuth {
  /**
   * @constructor
   */
  constructor() {
    this.context = null;
    this.config = null;
    this.authenticators = {};
    this.strategies = {};

    this.defaultConfig = {};

    this.storageMappings = {
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
  }

  /**
   * Initialize the plugin
   * Requires the right passport strategies to use according to the configuration
   *
   * @param config
   * @param context
   * @returns {Promise|Promise.<TResult>}
   */
  async init (config, context) {
    this.config = Object.assign({}, this.defaultConfig, config);
    this.context = context;

    if (!this.config.strategies || Object.keys(this.config.strategies).length === 0) {
      this.context.log.warn('No strategies specified.');
      return;
    }

    await this.context.accessors.storage.bootstrap(this.storageMappings);

    await this._initStrategies();
  }

  async _initStrategies () {
    const promises = [];

    for (const [name, strategy] of Object.entries(this.config.strategies)) {
      assert(
        Boolean(strategy.credentials),
        `Error loading strategy [${name}]: no credentials provided`);

      try {
        this.authenticators[name] = require('passport-' + (strategy.passportStrategy || name)).Strategy;
      }
      catch (error) {
        throw new this.context.errors.BadRequestError(`Error loading strategy [${name}]: ${error.message}`);
      }

      this.strategies[name] = {
        config: {
          authenticator: name,
          strategyOptions: strategy.credentials,
          authenticateOptions: {
            scope: strategy.scope
          },
          fields: strategy.persist
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

      const collectionMappings = {
        [name]: {
          properties: {
            kuid: { type: 'keyword' }
          }
        }
      };
      promises.push(this.context.accessors.storage.bootstrap(collectionMappings));
    }

    return Promise.all(promises);
  }

  afterRegister(strategyInstance) {
    try {
      refresh.use(strategyInstance);
    }
    catch (err) {
      this.context.log.error(`Error refreshing strategy: ${err.message}`);
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
      this.providerRepository = {};
    }

    if (!this.providerRepository[provider]) {
      this.providerRepository[provider] = new this.context.constructors.Repository(provider);
    }

    return this.providerRepository[provider];
  }

  /**
   * Get the credentials of a given kuid from the repository of the corresponding strategy
   *
   * @param kuid
   * @param provider
   * @returns {Promise|Promise.<TResult>}
   */
  async getCredentialsFromKuid(kuid, provider) {
    const query = {
      term: { kuid }
    };

    const result = await this.getProviderRepository(provider).search({ query });

    if (result.total === 0) {
      throw new this.context.errors.NotFoundError(`A strategy does not exist for the user "${kuid}".`);
    }

    return result.hits[0];
  }

  /**
   * Verify function called by passport to log the user.
   * If a persist option is in the configuration of the strategy then every field
   * present in this configuration will be persisted in the repository.
   *
   * @param request
   * @param accessToken
   * @param refreshToken
   * @param profile
   * @returns {Promise.<T>}
   */
  async verify(request, accessToken, refreshToken, profile) {
    const strategy = this.config.strategies[profile.provider];

    if (strategy.persist.length === 0) {
      throw new this.context.errors.NotFoundError(`There is nothing to persist for strategy "${profile.provider}".`);
    }

    try {
      const user = await this.getProviderRepository(profile.provider).get(profile._json[strategy.identifierAttribute]);

      return { kuid: user.kuid };
    }
    catch (error) {
      if (error.id !== 'services.storage.not_found') {
        throw error;
      }
    }

    // Use an object with flattened key because the "kuzzleAttributesMapping" object
    // use lodash style path
    const flattenedObject = flatObject(profile._json);

    const userCredentials = {};

    for (const [attribute, value] of Object.entries(flattenedObject)) {
      if (! strategy.persist.includes(attribute)) {
        continue;
      }

      const mappedAttributeName = get(strategy.kuzzleAttributesMapping, attribute);

      if (mappedAttributeName) {
        set(userCredentials, mappedAttributeName, value);
      }
      else {
        set(userCredentials, attribute, value);
      }
    }

    const userBody = {
      content: {
        profileIds: this.config.defaultProfiles || ['default']
      },
      credentials: {
        [profile.provider]: userCredentials
      }
    };

    const user = await this.context.accessors.sdk.security.createUser(null, userBody);

    return { kuid: user._id };
  }

  /**
   * Check if a given user exists
   *
   * @param request
   * @param kuid
   * @param provider
   * @returns {Promise|Promise.<boolean>}
   */
  async exists(request, kuid, provider) {
    try {
      await this.getCredentialsFromKuid(kuid, provider);

      return true;
    }
    catch (error) {
      if (!(error instanceof this.context.errors.NotFoundError)) {
        throw error;
      }

      return false;
    }
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
  async create(request, credentials, kuid, provider) {
    const user = {};

    const exists = await this.exists(request, kuid, provider);

    if (exists) {
      throw new this.context.errors.BadRequestError(`A strategy already exists for the user "${kuid}".`);
    }

    for (const [attribute, value] of Object.entries(credentials)) {
      user[attribute] = value;
    }

    user.kuid = kuid;
    user._id = credentials[this.config.strategies[provider].identifierAttribute];

    return this.getProviderRepository(provider).create(user);
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
  async update(request, credentials, kuid, provider) {
    const credentialsObject = await this.getCredentialsFromKuid(kuid, provider);

    return this.getProviderRepository(provider).update({
      _id: credentialsObject._id,
      ...credentials
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
  async delete(request, kuid, provider) {
    const credentials = await this.getCredentialsFromKuid(kuid, provider);

    return this.getProviderRepository(provider).delete(
      credentials._id,
      { refresh: 'wait_for' });
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
  async validate(request, credentials, kuid, provider, isUpdate) {
    const identifierAttribute = this.config.strategies[provider].identifierAttribute;

    const credentialsIdentifier = credentials[identifierAttribute];

    if (!isUpdate && !credentialsIdentifier) {
      throw new this.context.errors.BadRequestError(`Missing "${identifierAttribute}" attribute value. This attribute must be present in the "persist" array.`);
    }

    try {
      const result = await this.getProviderRepository(provider).get(credentialsIdentifier);

      if (result.kuid !== kuid) {
        throw new this.context.errors.BadRequestError(`IdentifierAttribute "${credentialsIdentifier}" is already used.`);
      }
    }
    catch (error) {
      // If the user already exists, when cannot create it
      if (error.id !== 'services.storage.not_found') {
        throw error;
      }
    }

    return true;
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
  async getInfo(request, kuid, provider) {
    const credentials = await this.getCredentialsFromKuid(kuid, provider);

    delete credentials._id;
    delete credentials.kuid;

    return credentials;
  }

  /**
   * Get the credentials of the user from id
   *
   * @param request
   * @param id
   * @param provider
   * @returns {Promise|Promise.<TResult>}
   */
  async getById(request, id, provider) {
    try {
      return await this.getProviderRepository(provider).get(id);
    }
    catch (error) {
      if (error.id === 'services.storage.not_found') {
        throw new this.context.errors.BadRequestError(`A strategy does not exist for the user "${id}".`);
      }

      throw error;
    }
  }
}

/**
 * Returns an object with flattened keys
 *
 * Example!
 * {
 *   nested: {
 *     value: 'aschen'
 *   }
 * }
 * will return
 * {
 *   'nested.value': 'aschen'
 * }
 * @param {Object} object
 *
 * @returns {Object}
 */
function flatObject(object) {
  const flattenedObject = {};

  function walkObject(obj, path = '') {
    for (const [key, value] of Object.entries(obj)) {
      let currentPath;
      if (Array.isArray(obj)) {
        currentPath = path + `[${key}]`;
      }
      else if (path === '') {
        currentPath = key;
      }
      else {
        currentPath = `${path}.${key}`;
      }

      if (typeof value === 'object' && value !== null) {
        walkObject(value, currentPath);
      }
      else {
        flattenedObject[currentPath] = value;
      }
    }
  }

  walkObject(object);

  return flattenedObject;
}

module.exports = PluginPassportOAuth;
