import _ from 'lodash';
import Charts from '../../index';
import '../../src/tableRenderer/tableRenderer.directive';
import app from '../app';

@app.inject(Charts.Data.GraphData).controller
export class ChartController {
  // Arbitrary list of time spans
  timeSpans = {
    '20s': 20000,
    '10s': 10000,
    '5s': 5000
  };

  startingPoints = {
    'now': 0,
    '5s ago': 5000,
    '10s ago': 10000
  };

  // Options passed to the Chart component
  chartOptions: Charts.Chart.ChartOptions = {
    span: 10000,
    from: 0,
    metricIds: []
  };

  // Used by the view to render the list of metrics as checkboxes
  availableMetrics: Charts.Data.Metric[];

  constructor(
    graphData: Charts.Data.GraphData
  ) {
    this.availableMetrics = graphData.getMetrics();
  }

  // Adds or removes a metric's id from the list in the chart options
  toggleMetric(metric: Charts.Data.Metric) {
    if (_.includes(this.chartOptions.metricIds, metric.id)) {
      _.remove(this.chartOptions.metricIds, id => id === metric.id);
    }
    else {
      this.chartOptions.metricIds.push(metric.id);
    }
  }

}
