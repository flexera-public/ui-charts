import lib from '../lib';
import _ from 'lodash';

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
  latestData?: SeriesPoints
}

/**
 * Represents a function that handles data returned by a provider
 */
export type MetricCallback = (data: SeriesData) => void

/**
 * A single point of data
 */
export type PointData = { min: number, avg: number, max: number } | number

/**
 * Array of point data
 */
export type Points = {
  timestamp: number
  data: PointData
}[]

export type SeriesPoints = { [seriesName: string]: Points }

export interface SeriesData {
  readonly error?: string;
  readonly points?: SeriesPoints;
}

export interface MetricInfo {
  /**
   * Name of the metric
   */
  readonly name: string;

  /**
   * Arbitrary category that can be used to group several metrics
   */
  readonly category: string;

  /**
   * Label to be shown next to the y-axis
   */
  readonly axisLabel?: string;

  /**
   * Value range a renderer should use when representing the metric
   */
  readonly axisRange?: { min: number, max: number };

  /**
   * How to format the y axis labels. Refer to http://numeraljs.com/ for format strings.
   */
  readonly format?: string;
}

export interface MetricsProvider {
  readonly name: string;
  readonly description: string;

  metrics(): ng.IPromise<MetricInfo[]>;
  subscribe(metric: MetricInfo, span: number, listener: MetricCallback): void;
  unsubscribe(metric: MetricInfo): void;
  getPoints(metric: MetricInfo, start: number, finish: number): ng.IPromise<Points>;
}

export interface Metric extends MetricInfo {
  readonly id: number;
  readonly providerName: string;
}

@lib.service
/**
 * The GraphData service allows other services to register and provide time series data
 * to subscribers.
 */
export class GraphData {

  private providers: MetricsProvider[] = [];
  private allMetrics: { metric: Metric, provider: MetricsProvider }[] = [];

  private subscriptions: Subscription[] = [];

  /**
   * Registers a metrics provider with the service and makes its metrics availble forEach
   * subscription
   *
   * @param {MetricsProvider} provider
   * @returns a promise that is fulfilled once the provider's metrics have been retrieved
   *
   * @memberOf GraphData
   */
  addProvider(provider: MetricsProvider) {
    if (this.providers.indexOf(provider) >= 0) {
      throw `The [${provider.name}] metrics provider has already been added`;
    }
    this.providers.push(provider);
    return provider.metrics().then(metrics => {
      metrics.forEach(metric => {
        this.allMetrics.push({
          metric: _.merge(metric, { id: this.allMetrics.length, providerName: provider.name }),
          provider: provider
        });
      });
    });
  }

  /**
   * Retrieves the list of available metrics
   *
   * @param provider Optionally pass a provider to filter the list
   */
  getMetrics(provider?: MetricsProvider) {
    if (provider) {
      return this.allMetrics.filter(m => m.provider === provider).map(m => m.metric);
    }
    return this.allMetrics.map(m => m.metric);
  }

  /**
   * Subscribes to metric updates.
   *
   * @param {number} metricId The metric's id from calling getMetrics()
   * @param {number} span     Span, in milliseconds, of data to be returned
   * @param {MetricCallback} callback Function that will called whenever new data is available
   */
  subscribe(metricId: number, from: number, span: number, callback: MetricCallback) {
    let metric = this.allMetrics[metricId];
    if (!metric) {
      throw `Cloud not find a metric with id [${metricId}]`;
    }

    if (span <= 0) {
      throw 'The span parameter needs to be a positive number greater than 0';
    }

    if (from < 0) {
      throw 'The from parameter needs to be a positive number';
    }

    let subscription = this.subscriptions[metricId];
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
      };
      this.subscriptions[metricId] = subscription;
      this.refreshSubscription(subscription);
    }
    else {
      if (_.some(subscription.callbacks, c => c.callback === callback)) {
        throw 'The callback has already been registered for this metric';
      }

      let c = {
        span: span,
        from: from,
        callback: callback
      };

      subscription.callbacks.push(c);
      this.refreshSubscription(subscription);
      this.dispatch(subscription.latestData, c);
    }
  }

  /**
   * Unsubscribe a callback from a given metric
   *
   * @param {number} metricId
   * @param {MetricCallback} callback
   */
  unsubscribe(metricId: number, callback: MetricCallback) {
    let subscription = this.subscriptions[metricId];
    if (!subscription) {
      throw `no subscription for metric [${metricId}]`;
    }

    _.remove(subscription.callbacks, c => c.callback === callback);
    if (subscription.callbacks.length === 0) {
      subscription.provider.unsubscribe(subscription.metric);
      delete this.subscriptions[metricId];
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
    let metric = this.allMetrics[metricId];
    if (!metric) {
      throw `Cloud not find a metric with id [${metricId}]`;
    }

    return metric.provider.getPoints(metric.metric, start, finish);
  }

  private refreshSubscription(subscription: Subscription) {
    let max = _(subscription.callbacks).map(c => c.span).max();
    if (subscription.span >= max) {
      return;
    }

    subscription.span = max;
    subscription.provider.subscribe(
      subscription.metric,
      max,
      data => this.dataReceived(data, subscription)
    );
  }

  /**
   * Handles data being received from a provider and
   *
   * @private
   * @param {SeriesData} data
   * @param {Subscription} subscription
   */
  private dataReceived(data: SeriesData, subscription: Subscription) {
    if (data.error) {
      subscription.callbacks.forEach(s => s.callback(data));
    }
    else {
      subscription.latestData = data.points;
      subscription.callbacks.forEach(c => this.dispatch(data.points, c));
    }
  }

  /**
   * Sends data points to a subscriber, matching the subscription window
   *
   * @private
   * @param {SeriesPoints} points
   * @param {CallbackInfo} callback
   */
  private dispatch(seriesPoints: SeriesPoints, callback: CallbackInfo) {
    let from = Date.now() - callback.from;
    let to = from - callback.span;
    let points: { [seriesName: string]: Points } = {};
    _.forEach(seriesPoints, (v, k) => {
      points[k] = _.filter(v, p => p.timestamp <= from && p.timestamp >= to);
    });

    callback.callback({ points: points });
  }
}
