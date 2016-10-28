[![Build Status](https://travis-ci.org/kuzzleio/kuzzle-plugin-auth-passport-oauth.svg?branch=master)](https://travis-ci.org/kuzzleio/kuzzle-plugin-auth-passport-oauth)

# Kuzzle compatibility

Versions 2.x of this plugin are compatible with Kuzzle v1.0.0-RC.4 and upper.

For older versions of Kuzzle, install v1.x versions of this plugin instead.

# Plugin Passport OAUTH Authentication

This plugin provides an authentication with [passportjs strategies](http://passportjs.org/docs).

# Manifest

This plugin doesn't need any right.

# Configuration

You can override the provided default configuration using [Kuzzle command-line interface](http://kuzzle.io/guide/#managing-plugins-using-the-cli)

List of available configurations:

| Name | Default value | Type | Description                 |
|------|---------------|-----------|-----------------------------|
| ``strategies`` | ``[]`` | Array | List of the providers you want to use with passport |
| ``persist`` | ``{}`` | Object | Attributes you want to persist if the user doesn't exist |
| ``scope`` | ``[]`` | Array | List of fields in the OAUTH 2.0 scope of access |
| ``profile`` | ``"default"`` | Array | Profile of the new persisted user |

Here is an example of a configuration:

```json
  "kuzzle-plugin-auth-passport-oauth": {
    "version": "1.0.0",
    "activated": true,
    "name": "kuzzle-plugin-auth-passport-oauth",
    "defaultConfig": {
      "persist": {}
    },
    "customConfig": {
      "strategies": {
        "facebook": {
            "credentials": {
              "clientID": "<your-client-id>",
              "clientSecret": "<your-client-secret>",
              "callbackUrl": "http://host:7511/api/1.0/_login/facebook"
            },
            "persist": [
              "login",
              "avatar_url",
              "name",
              "email"
            ],
            "scope": [
              "user:email",
              "user:avatar_url"
            ]
        },
        "twitter": {
            "credentials": {
              "consumerKey": "<your-client-id>",
              "consumerSecret": "<your-client-secret>",
              "callbackUrl": "http://host:7511/api/1.0/_login/twitter"
            },
            "persist": [
              "login",
              "avatar_url",
              "name",
              "email"
            ],
            "scope": [
              "user:email",
              "user:avatar_url"
            ]
        },
        "google-oauth": {
            "credentials": {
              "consumerKey": "<your-client-id>",
              "consumerSecret": "<your-client-secret>",
              "callbackUrl": "http://host:7511/api/1.0/_login/google-plus"
            },
            "persist": [
              "login",
              "avatar_url",
              "name",
              "email"
            ],
            "scope": [
              "user:email",
              "user:avatar_url"
            ]
        },
        "github": {
            "credentials": {
              "clientID": "<your-client-id>",
              "clientSecret": "<your-client-secret>",
              "callbackUrl": "http://host:7511/api/1.0/_login/github"
            },
            "persist": [
              "login",
              "avatar_url",
              "name",
              "email"
            ],
            "scope": [
              "user:email",
              "user:avatar_url"
            ]
        }
      },
      "defaultProfile": "default"
    }
  }
```

# Usage

Just send following data to the auth controller:

```json
{
 "body": {
  "strategy": "facebook",
  "username": "<username>"
 }
}
```

See [Kuzzle API Documentation](http://kuzzleio.github.io/kuzzle-api-documentation/#auth-controller) for more details about Kuzzle authentication mechanism.

# How to create a plugin

See [Kuzzle documentation](https://github.com/kuzzleio/kuzzle/blob/master/docs/plugins.md) about plugin for more information about how to create your own plugin.

# About Kuzzle

For UI and linked objects developers, [Kuzzle](https://github.com/kuzzleio/kuzzle) is an open-source solution that handles all the data management
(CRUD, real-time storage, search, high-level features, etc).

[Kuzzle](https://github.com/kuzzleio/kuzzle) features are accessible through a secured API. It can be used through a large choice of protocols such as REST, Websocket or Message Queuing protocols.
