import Charts from '../../index'
import lib from '../lib'
import _ from 'lodash'

@lib.service
@lib.inject(['$q', '$interval'])
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

  points: { [metric: string]: Charts.Data.Points } = {}

  constructor(
    private $q: ng.IQService,
    $interval: ng.IIntervalService
  ) {
    this.dummyMetrics.forEach(m => {
      this.points[m.name] = []
    })

    $interval(() => {
      this.dummyMetrics.forEach(m => { this.updateMetric(m, true) })
    }, 2000)
  }

  metrics() {
    return this.$q.resolve(this.dummyMetrics)
  }

  subscribe = (metric: Charts.Data.MetricInfo, span: number, listener: Charts.Data.MetricCallback) => {
    var dummyMetric = _.find(this.dummyMetrics, m => m.name == metric.name)
    dummyMetric.listener = listener
    this.updateMetric(dummyMetric, false)
  }

  unsubscribe(metric: Charts.Data.MetricInfo) {
    _.find(this.dummyMetrics, m => m.name == metric.name).listener = null
  }

  getPoints(metric: Charts.Data.MetricInfo, start: number, finish: number): ng.IPromise<Charts.Data.SeriesData> {
    return this.$q.resolve({
      points: { 'series': this.points[metric.name].length ? this.points[metric.name] : this.buildPoints() }
    })
  }

  private updateMetric(metric: any, addPoint: boolean) {
    if (!this.points[metric.name].length) {
      this.points[metric.name] = this.buildPoints()
    }
    else if (addPoint) {
      this.points[metric.name] = [{ timestamp: Date.now(), data: this.newPoint() }].concat(this.points[metric.name].slice(0, this.points[metric.name].length))
    }

    if (metric.listener) {
      metric.listener({ points: { 'series': this.points[metric.name] }})
    }
  }

  private newPoint(): Charts.Data.PointData {
    var avg = 1 + Math.random() * 3
    return {
      avg: avg,
      min: avg - Math.random(),
      max: avg + Math.random()
    }
  }

  private buildPoints() {
    var points: Charts.Data.Points = []
    var now = Date.now()

    for (var i = 0; i < 150; i++) {
      points.push({ timestamp: now - (i * 2000), data: this.newPoint() })
    }

    return points
  }
}

@lib.service
@lib.inject(['$q', '$interval'])
export class DummyMetricsProvider2 extends DummyMetricsProvider {
  dummyMetrics = [
    {
      name: 'baz',
      type: 'baz',
      listener: <Charts.Data.MetricCallback>null
    }
  ]
}
