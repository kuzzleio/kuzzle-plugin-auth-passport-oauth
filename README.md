[![Build Status](https://travis-ci.org/kuzzleio/kuzzle-plugin-auth-github.svg?branch=master)](https://travis-ci.org/kuzzleio/kuzzle-plugin-auth-github)

![logo](https://raw.githubusercontent.com/kuzzleio/kuzzle/master/docs/images/logo.png)

# Plugin Github Authentication

This plugin provides a authentication with [passportjs github strategy](https://github.com/jaredhanson/passport-github).

# Manifest

This plugin doesn't need any right.

# Configuration

You can override the configuration in your `config/customPlugins.json` file in Kuzzle:

| Name | Default value | Type | Description                 |
|------|---------------|-----------|-----------------------------|
| ``persist`` | ``{}`` | Object | Attributes you want to persist if the user doesn't exist |
| ``scope`` | ``[]`` | Array | List of attributes which requires rights to get |
| ``profile`` | ``default`` | Array | Profile of the new persisted user |
| ``clientID`` |  | String | Github clientID |
| ``clientSecret`` |  | String | Github secret |
| ``callbackUrl`` |  | String | Github callback url |

Here is an example of a configuration:

```json
  "kuzzle-plugin-auth-github": {
    "version": "1.0.0",
    "activated": true,
    "name": "kuzzle-plugin-auth-github",
    "defaultConfig": {
      "persist": {}
    },
    "customConfig": {
      "persist": [
        "login",
        "avatar_url",
        "name",
        "email"
      ],
      "scope": [
        "user:email",
        "user:avatar_url"
      ],
      "defaultProfile": "default",
      "clientID": "<your-client-id>",
      "clientSecret": "<your-client-secret>",
      "callbackUrl": "http://host:7511/api/1.0/_login/github"
    }
  }
```

# Usage

Just send following data to the auth controller:

```json
{"body":{
  "strategy": "github",
  "username": "<username>"
}}
```

See [Kuzzle API Documentation](http://kuzzleio.github.io/kuzzle-api-documentation/#auth-controller) for more details about Kuzzle authentication mechanism.

# How to create a plugin

See [Kuzzle documentation](https://github.com/kuzzleio/kuzzle/blob/master/docs/plugins.md) about plugin for more information about how to create your own plugin.

# About Kuzzle

For UI and linked objects developers, [Kuzzle](https://github.com/kuzzleio/kuzzle) is an open-source solution that handles all the data management
(CRUD, real-time storage, search, high-level features, etc).

[Kuzzle](https://github.com/kuzzleio/kuzzle) features are accessible through a secured API. It can be used through a large choice of protocols such as REST, Websocket or Message Queuing protocols.
