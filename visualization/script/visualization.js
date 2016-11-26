require('./../style/visuzlization.scss');

var $ = require('jquery');
require('whatwg-fetch');

var renderGraph = require('./graphs.jsx');

var USERNAME = 'junction_hackathon@720.fi';
var PASSWORD = 'i<3python';

var CLIMATE_SENSOR_NODES_BASE_URL = 'https://hackathon.720.fi/nodes';

var NODES = [{
    'node_id': '0e34909f-f07f-417c-a667-bf7b12757eef',
    'node_name': 'Avotila Itä'
  }, {
    'node_id': '373c0f3d-71b8-4925-b13d-0d80ffb9f701',
    'node_name': 'Avotila länsi'
  }, {
    'node_id': 'ccecc389-73e7-493b-b6bb-1570ad93fd75',
    'node_name': 'Neuvotteluhuone 7GM08'
  }];

$(function() {
  $('body').append(require('./../template/visualization.html'));

  var nodes = NODES;

  nodes.forEach(function(node) {
    $('.placeholder').append(node.node_id);
    $('.placeholder').append('&nbsp;');
    $('.placeholder').append(node.node_name);
    $('.placeholder').append('<br/>');
  });


  var requestDataForNodes = function() {
    var lineData = [];
    var currentDate = new Date(new Date().setDate(new Date().getDate()));
    var threeDaysAgo = new Date(new Date().setDate(currentDate.getDate() - 5));

    var myDataFrom = formatData(threeDaysAgo);
    var myDataTo = formatData(currentDate);

    var makeRequestForClimateNode = function(nodeIdx) {
      return doRequest(makeNodeMesurementsRequestUrl(nodes[nodeIdx].node_id, myDataFrom, myDataTo));
    };

    var addToData = function(idx, response) {
      if (response && response.measurements) {
        lineData.push({
          name: nodes[idx].node_name,
          values: response.measurements
        });
      }
    };

    return makeRequestForClimateNode(0).then(function(response) {
      return addToData(0, response);
    }).then(function() {
      return makeRequestForClimateNode(1).then(function(response) {
        return addToData(1, response);
      });
    }).then(function() {
      return makeRequestForClimateNode(2).then(function(response) {
        return addToData(2, response);
      });
    }).then(function() {
      return lineData;
    });
  };

  requestDataForNodes().then(function(lineData) {
    console.log('lineData', lineData);

    var dataToGraphData = function(lineData, key) {
      var extractKeyFromValues = function(values) {
        return (values || []).map(function(item, idx) {
          return {
            x: idx,
            y: item.sensors[key]['value_avg']
          }
        });
      };

      var result = (lineData || []).map(function(dataItem) {
        return {
          name: dataItem.name,
          values: extractKeyFromValues(dataItem.values, key)
        }
      });
      console.log(key, result);
      return result;
    };

    var temperature = dataToGraphData(lineData, 'temperature_celsius');
    renderGraph(temperature, 'temperature');

    var co2 = dataToGraphData(lineData, 'co2');
    renderGraph(co2, 'co2');

    var relativeHumidityPercent = dataToGraphData(lineData, 'relative_humidity_percent');
    renderGraph(relativeHumidityPercent, 'relative-humidity-percent');

    var vocCh2oEquiv = dataToGraphData(lineData, 'voc_ch2o_equiv');
    renderGraph(vocCh2oEquiv, 'voc-ch2o-equiv');
  });

});


function makeNodeMesurementsRequestUrl(nodeId, from, to) {
  var result = CLIMATE_SENSOR_NODES_BASE_URL + '/';
  result += nodeId;
  result += '/measurements?from=';
  result += from;
  result += '&until=';
  result += to;
  result += '&aggregate=6h';
  return result;
}

function doRequest(url) {
  function toBase64(str) {
    return new Buffer(str).toString('base64');
  }

  var tokenRequestOptions = {
    method: 'GET',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + toBase64(USERNAME + ':' + PASSWORD)
    },
    json: true
  };

  return fetch(url, tokenRequestOptions)
    .then(function(response) {
      return response.json();
    })
    .then(function(response) {
      return response.data;
    })
    .catch(function(err) {
      console.log('err', err);
    });
}

function formatData(d) {
  var normaliseNumber = function(number) {
    var strNumber = number + '';
    return strNumber.length === 1 ? '0' + strNumber : strNumber;
  };

  var minutes = normaliseNumber(d.getUTCMinutes());
  var hours = normaliseNumber(d.getUTCHours());
  var month = normaliseNumber(d.getMonth() + 1);
  return d.getFullYear() + '-' + month + '-' + d.getDate() + 'T' + hours + ':' + minutes + ':00';
}


