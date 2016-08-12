import app from '../app'
import Charts from '../../index'
import { DummyMetricsProvider } from '../../src/fixtures/dummyProvider'
import '../../src/tableRenderer/tableRenderer.directive'
import _ from 'lodash'

@app.controller
@app.inject([Charts.Data.GraphData, DummyMetricsProvider, '$scope', '$timeout'])
export class ChartController {

  timeSpans = {
    '20s': 20000,
    '10s': 10000,
    '5s': 5000
  }

  chartOptions: Charts.Chart.ChartOptions = {
    span: 10000,
    metricIds: []
  }

  availableMetrics: Charts.Data.Metric[]

  constructor(
    graphData: Charts.Data.GraphData,
    dummyProvider: DummyMetricsProvider,
    scope: ng.IScope,
    timeout: ng.ITimeoutService
  ) {
    graphData.addProvider(dummyProvider)
    timeout(() => {
      this.availableMetrics = graphData.getMetrics()
    });
  }

  toggleMetric(metric: Charts.Data.Metric) {
    if (_.includes(this.chartOptions.metricIds, metric.id)) {
      _.remove(this.chartOptions.metricIds, id => id == metric.id)
    }
    else {
      this.chartOptions.metricIds.push(metric.id)
    }
  }

}
