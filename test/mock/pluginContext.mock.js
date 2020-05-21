const
  sinon = require('sinon'),
  defaultError = sinon.stub().callsFake(message => ({message}));

module.exports = {
  constructors: {
    Repository: sinon.stub(),
    Request: sinon.stub()
  },
  config: {
    version: '1.4.0'
  },
  accessors: {
    storage: {
      bootstrap: sinon.stub().resolves()
    },
    sdk: {
      security: {
        createUser: sinon.stub().resolves()
      }
    },
    execute: sinon.stub().resolves()
  },
  errors: {
    BadRequestError: defaultError,
    ForbiddenError: defaultError,
    NotFoundError: class NotFoundError extends Error {
      constructor (message) {
        super(message);
      }

      get name () {
        return 'NotFoundError';
      }
    }
  }
};
