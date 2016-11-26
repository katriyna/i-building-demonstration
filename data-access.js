var request = require('request-promise');

var HUB_SERVICE_SECRET = '7IrG9NGM8ljJ';
var HUB_SERVICE_ID = 'a58bafcf-bf95-450f-80d5-490c0e2fdfce';
var YOUTRACK_SERVICE_ID = '0b9e79bb-e5eb-4658-bd02-5025cda2f8ca';
var HUB_API_URL = 'https://ibuilding-challenge.myjetbrains.com/hub/api/rest';
var YOUTRACK_API_URL = 'https://ibuilding-challenge.myjetbrains.com/youtrack/api';

var ROOT_ACCESS_TOKEN = '1480194906037.0b9e79bb-e5eb-4658-bd02-5025cda2f8ca.555239a2-f9d5-46dc-a517-9d8fd85361c2.0b9e79bb-e5eb-4658-bd02-5025cda2f8ca 0-0-0-0-0;1.MC0CFEvmpnbfIFkN0bo3tz5DC3cqBj09AhUAiHC7hvpqzSxjFETAhqKhWWR7/8g=';

var PREDEFINED_ISSUES_ENUM = require('./issues-predefined-enum');

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
      'scope': '0-0-0-0-0 ' + YOUTRACK_SERVICE_ID
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

function createIssue(wrappedRequest, issue) {
  var createIssueOptions = {
    uri: YOUTRACK_API_URL + '/admin/projects/78-0/issues',
    method: 'POST',
    body: issue,
    json: true
  };

  return wrappedRequest(createIssueOptions)
    .then(function(response) {
      console.log('create issue response', response);
      return response.issue;
    })
    .catch(function(err) {
      console.log('err', err);
    });
}

loadAccessToken(YOUTRACK_SERVICE_ID).then(function(accessToken) {
  console.log('accessToken', accessToken);

  /**
   * Now we have accessToken. Let's add it to headers. Add all requests will make with access token in headers
   */
  var wrappedRequest = wrapRequest(request, ROOT_ACCESS_TOKEN);

  return createIssue(wrappedRequest, PREDEFINED_ISSUES_ENUM.OPEN_WINDOW_SECTION_1);
});
