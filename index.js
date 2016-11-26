var request = require('request-promise');

// For temperature
var USERNAME = 'junction_hackathon@720.fi';
var PASSWORD = 'i<3python';

var CLIMATE_SENSOR_NODES_BASE_URL = 'https://hackathon.720.fi/nodes/';
var TEST_URL = 'https://tieto.iottc.tieto.com/measurement/measurements?pageSize=1&dateFrom=2016-10-21&dateTo=2016-11-30&revert=true&source=12191';


doRequest(CLIMATE_SENSOR_NODES_BASE_URL);

function doRequestToClimateSensor(nodeId, paramsters) {
  return doRequest(CLIMATE_SENSOR_NODES_BASE_URL + nodeId);
}

function doRequest(url) {
  var tokenRequestOptions = {
    uri: url,
    method: 'GET',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + toBase64(USERNAME + ':' + PASSWORD)
    },
    json: true
  };

  return request(tokenRequestOptions)
    .then(function(response) {
      console.log(JSON.stringify(response.data.nodes));
    })
    .catch(function(err) {
      console.log('err', err);
    });
}

function toBase64(str) {
  return new Buffer(str).toString('base64');
}

