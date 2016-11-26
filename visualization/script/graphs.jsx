var React = require('react');
var ReactDOM = require('react-dom');
var LineChart = require('react-d3').LineChart;

var Graph = React.createClass({

  propTypes: {
    lineData: React.PropTypes.array,
    title: React.PropTypes.string
  },

  getInitialState: function () {
    var lineData = this.props.lineData || [];
    
    lineData.forEach(function(data) {
      data.strokeWidth = 1;
      data.strokeDashArray = '5,5';
    });
    
    return {
      lineData: this.props.lineData,
      title: this.props.title
    };
  },

  render: function() {

    var viewBoxObject = {x: 0, y: 0, width: 900, height: 400};

    return (<LineChart
            legend={true}
            data={this.state.lineData}
            width={900}
            height={400}
            viewBoxObject={viewBoxObject}
            title={this.state.title}
            yAxisLabel="Altitude"
            xAxisLabel="Elapsed Time (sec)"
            gridHorizontal={true}/>);
  }
});


module.exports = function(lineData, graphNumber) {
  return ReactDOM.render(
    <Graph lineData={lineData} title={graphNumber} />,
    document.getElementById('graph-placeholder-' + graphNumber)
  );
};
