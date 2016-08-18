import lib from '../lib'
import _ from 'lodash'

type CallbackInfo = {
  span: number
  from: number
  callback: MetricCallback
}

type Subscription = {
  callbacks: CallbackInfo[]
  span: number
  metric: MetricInfo
  provider: MetricsProvider
}

export type MetricCallback = (data: SeriesData) => void

export type PointData = { min: number, avg: number, max: number } | number

export type Points = {
  timestamp: number
  data: PointData
}[]

export interface SeriesData {
  readonly error?: string
  readonly points?: { [seriesName: string]: Points }
}

export interface MetricInfo {
  readonly name: string
  readonly type: string
}

export interface MetricsProvider {
  readonly name: string
  readonly description: string

  metrics(): ng.IPromise<MetricInfo[]>
  subscribe(metric: MetricInfo, span: number, listener: MetricCallback): void
  unsubscribe(metric: MetricInfo): void
  getPoints(metric: MetricInfo, start: number, finish: number): ng.IPromise<Points>
}

export interface Metric extends MetricInfo {
  readonly id: number
}

@lib.service
/**
 * The GraphData service allows other services to register and provide time series data
 * to subscribers.
 */
export class GraphData {

  private providers: MetricsProvider[] = [];
  private allMetrics: { metric: MetricInfo, provider: MetricsProvider }[] = []

  private subscriptions: Subscription[] = []

  /**
   * Registers a metrics provider with the service and makes its metrics availble forEach
   * subscription
   */
  addProvider(provider: MetricsProvider) {
    if (this.providers.indexOf(provider) >= 0) {
      throw `The [${provider.name}] metrics provider has already been added`
    }
    this.providers.push(provider)
    provider.metrics().then(metrics => {
      metrics.forEach(metric => {
        this.allMetrics.push({
          metric: metric,
          provider: provider
        })
      });
    })
  }

  /**
   * Retrieves the list of available metrics
   *
   * @param provider Optionally pass a provider to filter the list
   */
  getMetrics(provider?: MetricsProvider) {
    var metrics = this.allMetrics
    if (provider) {
      metrics = this.allMetrics.filter(m => m.provider == provider)
    }
    return metrics.map((m, i) => <Metric>_.merge(_.clone(m.metric), { id: i }))
  }

  /**
   * Subscribes to metric updates.
   *
   * @param {number} metricId The metric's id from calling getMetrics()
   * @param {number} span     Span, in milliseconds, of data to be returned
   * @param {MetricCallback} callback Function that will called whenever new data is available
   */
  subscribe(metricId: number, from: number, span: number, callback: MetricCallback) {
    var metric = this.allMetrics[metricId];
    if (!metric) throw `Cloud not find a metric with id [${metricId}]`

    if (span <= 0) throw 'The span parameter needs to be a positive number greater than 0'
    if (from < 0) throw 'The from parameter needs to be a positive number'

    var subscription = this.subscriptions[metricId];
    if (!subscription) {
      subscription = {
        callbacks: [{
          from: from,
          span: span,
          callback: callback
        }],
        span: 0,
        metric: metric.metric,
        provider: metric.provider
      }
      this.subscriptions[metricId] = subscription
      this.refreshSubscription(subscription)
    }
    else {
      if (_.some(subscription.callbacks, c => c.callback == callback)) {
        throw 'The callback has already been registered for this metric'
      }

      subscription.callbacks.push({
        span: span,
        from: from,
        callback: callback
      })
      this.refreshSubscription(subscription)
    }
  }

  /**
   * Unsubscribe a callback from a given metric
   *
   * @param {number} metricId
   * @param {MetricCallback} callback
   */
  unsubscribe(metricId: number, callback: MetricCallback) {
    var subscription = this.subscriptions[metricId];
    if (!subscription) throw `no subscription for metric [${metricId}]`

    _.remove(subscription.callbacks, c => c.callback == callback)
    if (subscription.callbacks.length == 0) {
      subscription.provider.unsubscribe(subscription.metric)
      delete this.subscriptions[metricId]
    }
    else {
      this.refreshSubscription(subscription);
    }
  }

  /**
   * Gets a range of points
   *
   * @param {number} metricId
   * @param {number} start
   * @param {number} finish
   * @returns {ng.IPromise<DataPoints>}
   */
  getPoints(metricId: number, start: number, finish: number): ng.IPromise<Points> {
    var metric = this.allMetrics[metricId];
    if (!metric) throw `Cloud not find a metric with id [${metricId}]`

    return metric.provider.getPoints(metric.metric, start, finish)
  }

  private refreshSubscription(subscription: Subscription) {
    var max = _(subscription.callbacks).map(c => c.span).max()
    if (subscription.span >= max) return
    subscription.span = max
    subscription.provider.subscribe(
      subscription.metric,
      max,
      data => this.dispatch(data, subscription.callbacks)
    )
  }

  private dispatch(data: SeriesData, subscribers: CallbackInfo[]) {
    var now = Date.now()

    if (data.error) subscribers.forEach(s => s.callback(data))
    else {
      subscribers.forEach(s => {
        let from = now - s.from
        let to = from - s.span
        var points: { [seriesName: string]: Points } = {}
        _.forEach(data.points, (v, k) => {
          points[k] = _.filter(v, p => p.timestamp <= from && p.timestamp >= to)
        })

        s.callback({ points: points })
      })
    }
  }
}
