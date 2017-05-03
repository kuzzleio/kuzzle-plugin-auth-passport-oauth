[![Build Status](https://travis-ci.org/kuzzleio/kuzzle-plugin-auth-passport-oauth.svg?branch=master)](https://travis-ci.org/kuzzleio/kuzzle-plugin-auth-passport-oauth)

# Kuzzle compatibility

Versions 4.x of this plugin are compatible with Kuzzle v1.0.0-RC10 and upper.

For older versions of Kuzzle, install v1.x or v2.x versions of this plugin instead.

# Plugin Passport OAUTH Authentication

This plugin provides an authentication with [passportjs strategies](http://passportjs.org/docs).

# Configuration

To edit the configuration of a plugin see [custom plugin configuration](http://docs.kuzzle.io/plugin-reference/#custom-plugin-configuration).

List of available configurations:

| Name | Default value | Type | Description                 |
|------|---------------|-----------|-----------------------------|
| ``strategies`` | ``[]`` | Array | List of the providers you want to use with passport |
| ``credentials`` | ``{}`` | Object | Credentials provided by the provider |
| ``persist`` | ``{}`` | Object | Attributes you want to persist if the user doesn't exist |
| ``scope`` | ``[]`` | Array | List of fields in the OAUTH 2.0 scope of access |
| ``useAdId`` | | String | Attribute from the profile of the provider to use as Id if you want to persist the user in Kuzzle |
| ``defaultProfile`` | ``"default"`` | Array | Profiles of the new persisted user |
| ``mapToKuzzle`` | ```` | Object | Mapping of attributes to persist in the user persisted in Kuzzle |

Here is an example of a configuration:

```json
{
    "strategies": {
        "facebook": {
            "credentials": {
                "clientID": "<your-client-id>",
                "clientSecret": "<your-client-secret>",
                "callbackURL": "http://localhost:8080/_login/facebook"
            },
            "persist": [
                "login",
                "avatar_url",
                "name",
                "email"
            ],
            "scope": [
                "email",
                "public_profile"
            ],
            "mapToKuzzle": {
              "userMail": "email"
            },
            "useAsId": "id"
        }
    },
    "defaultProfiles": [
        "default"
    ]
}
```

# Usage

The easiest way to implement an oauth authentication in your front-end is to use the [sdk login oauth popup module](https://github.com/kuzzleio/kuzzle-sdk-login-oauth-popup)

See [Kuzzle API Documentation](http://kuzzleio.github.io/kuzzle-api-documentation/#auth-controller) for more details about Kuzzle authentication mechanism.

# How to create a plugin

See [Kuzzle documentation](http://docs.kuzzle.io/plugin-reference/#plugin-creation-prerequisites) about plugin for more information about how to create your own plugin.

# About Kuzzle

For UI and linked objects developers, [Kuzzle](https://github.com/kuzzleio/kuzzle) is an open-source solution that handles all the data management
(CRUD, real-time storage, search, high-level features, etc).

[Kuzzle](https://github.com/kuzzleio/kuzzle) features are accessible through a secured API. It can be used through a large choice of protocols such as REST, Websocket or Message Queuing protocols.
