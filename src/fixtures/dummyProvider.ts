import Charts from '../../index'
import lib from '../lib'
import _ from 'lodash'

@lib.service
@lib.inject(['$q', '$interval'])
export class DummyMetricsProvider implements Charts.Data.MetricsProvider {
  name = 'Dummy Provider'
  description = 'dummy'

  private timerHandler: ng.IPromise<void>

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

  constructor(
    private $q: ng.IQService,
    private $interval: ng.IIntervalService
  ) {
  }

  metrics() {
    return this.$q.resolve(this.dummyMetrics)
  }

  subscribe = (metric: Charts.Data.MetricInfo, span: number, listener: Charts.Data.MetricCallback) => {
    _.find(this.dummyMetrics, m => m.name == metric.name).listener = listener
    if (!this.timerHandler) {
      this.timerHandler = this.$interval(() => {
        this.dummyMetrics.forEach(m => {
          if (m.listener) {

            m.listener({
              points: this.buildPoints()
            })
          }
        })
      }, 5)
    }
  }

  unsubscribe(metric: Charts.Data.MetricInfo) {
    _.find(this.dummyMetrics, m => m.name == metric.name).listener = null
  }

  getPoints(metric: Charts.Data.MetricInfo, start: number, finish: number): ng.IPromise<Charts.Data.SeriesData> {
    return this.$q.resolve({
      points: this.buildPoints()
    })
  }

  private buildPoints() {
    var points: Charts.Data.DataPoints = {}
    var now = Date.now()

    for (var i = 0; i < 20; i++) {
      points[now - i * 10000] = {
        avg: Math.random() * 10,
        max: Math.random() * 10,
        min: Math.random() * 10
      }
    }

    return points
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
