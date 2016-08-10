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

  points: { [metric: string]: Charts.Data.DataPoints } = {}

  constructor(
    private $q: ng.IQService,
    private $interval: ng.IIntervalService
  ) {
    this.dummyMetrics.forEach(m => {
      this.points[m.name] = this.buildPoints()
    })
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
            console.log(`updating ${m.name}`)
            this.points[metric.name] = [_.merge({ timestamp: Date.now() }, this.newPoint())].concat(this.points[metric.name].slice(0, this.points[metric.name].length))
            m.listener({
              points: this.points[metric.name]
            })
          }
        })
      }, 2000)
    }
    listener({ points: this.points[metric.name] })
  }

  unsubscribe(metric: Charts.Data.MetricInfo) {
    _.find(this.dummyMetrics, m => m.name == metric.name).listener = null
  }

  getPoints(metric: Charts.Data.MetricInfo, start: number, finish: number): ng.IPromise<Charts.Data.SeriesData> {
    return this.$q.resolve({
      points: this.points[metric.name]
    })
  }

  private newPoint() {
    var avg = 1 + Math.random() * 10
    return {
      avg: avg,
      min: avg - Math.random(),
      max: avg + Math.random()
    }
  }

  private buildPoints() {
    var points: Charts.Data.DataPoints = []
    var now = Date.now()

    for (var i = 0; i < 20; i++) {
      points.push(_.merge({ timestamp: now - i * 2000 }, this.newPoint()))
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
