import Charts from '../../index'
import lib from '../lib'
import _ from 'lodash'

@lib.service
@lib.inject(['$q'])
export class DummyMetricsProvider implements Charts.Data.MetricsProvider {
  name = 'Dummy Provider'
  description = 'dummy'

  dummyMetrics = [
    {
      name: 'foo',
      type: 'foo',
      listener: <Charts.Data.MetricCallback>null
    },
    {
      name: 'bar',
      type: 'bar',
      listener: <Charts.Data.MetricCallback>null
    }
  ]

  constructor(private $q: ng.IQService) {}

  metrics() {
    return this.$q.resolve(this.dummyMetrics)
  }

  subscribe(metric: Charts.Data.MetricInfo, span: number, listener: Charts.Data.MetricCallback) {
    _.find(this.dummyMetrics, m => m.name == metric.name).listener = listener
  }

  unsubscribe(metric: Charts.Data.MetricInfo) {
    _.find(this.dummyMetrics, m => m.name == metric.name).listener = null
  }

  getPoints(metric: Charts.Data.MetricInfo, start: number, finish: number) {
    return this.$q.resolve({ points: {
      1: 1,
      2: 2,
      3: 3,
      4: 4
    }})
  }
}

@lib.service
@lib.inject(['$q'])
export class DummyMetricsProvider2 extends DummyMetricsProvider {
  dummyMetrics = [
    {
      name: 'baz',
      type: 'baz',
      listener: <Charts.Data.MetricCallback>null
    }
  ]
}
