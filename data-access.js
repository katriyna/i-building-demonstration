var request = require('request-promise');

var HUB_SERVICE_SECRET = '7IrG9NGM8ljJ';
var HUB_SERVICE_ID = 'a58bafcf-bf95-450f-80d5-490c0e2fdfce';
var HUB_API_URL = 'https://ibuilding-challenge.myjetbrains.com/hub/api/rest';

function toBase64(str) {
  return new Buffer(str).toString('base64');
}

/**
 * See https://www.jetbrains.com/help/hub/2.0/Client-Credentials.html
 */
function loadAccessToken() {
  var tokenRequestOptions = {
    uri: HUB_API_URL + '/oauth2/token',
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + toBase64(HUB_SERVICE_ID + ':' + HUB_SERVICE_SECRET)
    },
    qs: {
      'grant_type': 'client_credentials',
      'scope': '0-0-0-0-0'
    },
    json: true
  };

  return request(tokenRequestOptions)
    .then(function(response) {
      return response['access_token'];
    })
    .catch(function(err) {
      console.log('err', err);
    });
}

function wrapRequest(request, accessToken) {
  return function(options) {
    options = options || {};
    options.headers = {
      Authorization: 'Bearer ' + accessToken,
      Accept: 'application/json'
    };
    options.json = true;
    return request(options);
  }
}

/**
 * See https://www.jetbrains.com/help/hub/2.0/HUB-REST-API_Users_Get-All-Users.html
 */
function getUsers(wrappedRequest) {
  var inviteUserOptions = {
    uri: HUB_API_URL + '/users',
    method: 'GET',
    qs: {
      /**
       * fields - is a comma-separated list of properties, which server will return for each object
       */
      fields: 'id,email,name,login'
    },
    json: true
  };

  return wrappedRequest(inviteUserOptions)
    .then(function(response) {
      return response.users;
    })
    .catch(function(err) {
      console.log('err', err);
    });
}

/**
 * See https://www.jetbrains.com/help/hub/2.0/HUB-REST-API_Users_Post-Invite.html
 */
function inviteUser(wrappedRequest, user) {
  var inviteUserOptions = {
    uri: HUB_API_URL + '/users/invite',
    method: 'POST',
    qs: user,
    json: true
  };

  return wrappedRequest(inviteUserOptions)
    .then(function(response) {
      console.log('invite response', response);
      return response.users;
    })
    .catch(function(err) {
      console.log('err', err);
    });
}

loadAccessToken().then(function(accessToken) {
  console.log('accessToken', accessToken);

  /**
   * Now we have accessToken. Let's add it to headers. Add all requests will make with access token in headers
   */
  var wrappedRequest = wrapRequest(request, accessToken);

  return getUsers(wrappedRequest)
    .then(function(users) {
      console.log('users', users);
    })
    .then(function() {
      /**
       * "email" is obligatory property. Other properties are not obligatory
       */
      var user = {
        email: 'user6@user.ru',
        login: 'ip6'
      };
      return inviteUser(wrappedRequest, user);
    });
});
