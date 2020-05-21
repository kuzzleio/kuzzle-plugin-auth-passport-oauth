[![Build Status](https://travis-ci.org/kuzzleio/kuzzle-plugin-auth-passport-oauth.svg?branch=master)](https://travis-ci.org/kuzzleio/kuzzle-plugin-auth-passport-oauth)

# Plugin Passport OAUTH Authentication

This plugin provides OAUTH2 authentication using [Passport.js strategies](http://passportjs.org/docs).

## Compatibility matrice

| Kuzzle Version | Plugin Version |
| -------------- | -------------- |
| 1.x.x          | 4.x.x          | 
| 2.x.x          | 5.x.x          | 

# Configuration

To edit the configuration of a plugin see [custom plugin configuration](https://docs.kuzzle.io/core/2/guides/essentials/configuration).

List of available configurations:

| Name | Default value | Type | Description                 |
|------|---------------|-----------|-----------------------------|
| ``strategies`` | ``{}`` | Object | List of the providers you want to use with passport |
| ``credentials`` | ``{}`` | Object | Credentials provided by the provider |
| ``persist`` | ``{}`` | Object | Attributes you want to persist in the user credentials object if the user doesn't exist |
| ``scope`` | ``[]`` | Array | List of fields in the OAUTH 2.0 scope of access |
| ``identifierAttribute`` | | String | Attribute from the profile of the provider to use as unique identifier if you want to persist the user in Kuzzle |
| ``defaultProfile`` | ``["default"]`` | Array | Profiles of the new persisted user |
| ``kuzzleAttributesMapping`` | ``{}`` | Object | Mapping of attributes to persist in the user persisted in Kuzzle |
| ``passportStrategy`` | ``''`` | String | Strategy name for passport (eg. google-oauth20 while the name of the provider is google)

Here is an example of a configuration:

```js
{
  "strategies": {
    "facebook": {
      "passportStrategy": "facebook",
      "credentials": {
        "clientID": "<your-client-id>",
        "clientSecret": "<your-client-secret>",
        "callbackURL": "http://localhost:8080/_login/facebook",
        "profileFields": ["id", "name", "picture", "email", "gender"]
      },
      "persist": [
        "picture.data.url",
        "last_name",
        "first_name",
        "email"
      ],
      "scope": [
        "email",
        "public_profile"
      ],
      "kuzzleAttributesMapping": {
        "userMail": "email" // will store the attribute "email" as "userEmail" into the user credentials object
      },
      "identifierAttribute": "email"
    }
  },
  "defaultProfiles": [
    "default"
  ]
}
```

## identifierAttribute

This attribute will be used to identify your users. It has to be unique.  

You need to choose an attribute declared in the `persist` array.

## Attribute persistence

Attributes declared in the `persist` array will be persisted in the credentials object and not in the user content.  

For example, if you have the following configuration:
```js
{
  "strategies": {
    "facebook": {
      "persist": ["email", "first_name", "picture.data.url"],
      "kuzzleAttributesMapping": {
        "picture.data.url": "avatar_url"
      }
    }
  }
}
```

And your OAuth provider will send you the following `_json` payload:
```js
{
  "email": "gfreeman@black-mesa.xen",
  "first_name": "gordon",
  "last_name": "freeman",
  "picture": {
    "data": {
      "url": "http://avatar.url"
    }
  }
}
```

The created user content will be:
```js
{
  "content": {
    "profileIds": ["default"]
  },
  "credentials": {
    "facebook": {
      "email": "gfreeman@black-mesa.xen",
      "first_name": "gordon",
      "avatar_url": "http://avatar.url"
    }
  }
}
```

# Usage

The easiest way to implement an oauth authentication in your front-end is to use the [sdk login oauth popup module](https://github.com/kuzzleio/kuzzle-sdk-login-oauth-popup)

See [Kuzzle API Documentation](https://docs.kuzzle.io/core/2/guides/essentials/user-authentication/) for more details about Kuzzle authentication mechanism.

# How to create a plugin

See [Kuzzle documentation](https://docs.kuzzle.io/core/2/plugins/essentials/introduction/) for more information about how to create your own plugin.
