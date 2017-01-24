import _ from 'lodash';
import * as Data from '../dataProvider/dataProvider.service';
import lib from '../lib';

interface SubscriptionData {
  live?: boolean;
  metricId: string;
  callback: Data.MetricCallback;
}

/**
 * Exposes details and data about a metric that a Chart is subscribed to.
 * This is intended to be used by a renderer.
 *
 * @export
 * @interface MetricDetails
 */
export interface MetricDetails extends Data.Metric {
  points?: { [seriesName: string]: Data.Points };
}

/**
 * Options controlling the behavior of a chart
 *
 * @export
 * @interface ChartOptions
 */
export interface ChartOptions {
  span: number;
  from?: number;
  metricIds: string[];
  paused?: boolean;
}

/**
 * Core chart component, needs to be used with a renderer to show any data
 *
 * @export
 * @class ChartComponent
 */
@lib.inject(Data.GraphData, '$q', '$scope').component({
  bindings: {
    options: '='
  }
})
export class Chart {

  /**
   * Configuration options
   */
  public options: ChartOptions;

  /**
   * Chart data
   */
  public details: MetricDetails[];

  /**
   * time stamp of the last time the data was update. A renderer should watch this value instead
   * of the details as this will be much more efficient.
   */
  public lastUpdate: number;

  private subscriptions: SubscriptionData[] = [];

  constructor(
    private graphData: Data.GraphData,
    private q: ng.IQService,
    $scope: ng.IScope
  ) {
    $scope.$watch(() => this.options, () => this.refreshSubscriptions(), true);

    $scope.$on('$destroy', () => this.unsubscribe());
  }

  /**
   * Forces a refresh of the metric data even if the chart is paused.
   *
   * @memberOf Chart
   */
  forceRefresh(from: number, span: number) {
    this.details = [];
    let promises: Array<ng.IPromise<any>> = [];

    this.enumMetrics(m => {
      promises.push(this.graphData
        .getPoints(m.id, from - span, from)
        .then(p => {
          let details: MetricDetails = _.clone(m);
          details.points = p;
          this.details.push(details);
        }));
    });

    this.q.all(promises).then(() => this.lastUpdate = Date.now());
  }

  /**
   * Unsubscribes from listening to all metrics
   *
   * @private
   */
  private unsubscribe() {
    this.subscriptions.forEach(s => {
      if (s.live) {
        this.graphData.unsubscribe(s.metricId, s.callback);
      }
    });
    this.subscriptions = [];
  }

  /**
   * Refreshes the subscriptions after the chart options have changed
   *
   * @private
   */
  private refreshSubscriptions() {
    this.unsubscribe();
    if (!this.validateOptions() || this.options.paused) {
      return;
    }

    this.details = [];

    this.enumMetrics(m => {
      let details: MetricDetails = _.clone(m);
      this.details.push(details);

      let subscription: SubscriptionData = {
        metricId: m.id,
        callback: (data: Data.SeriesData) => {
          details.points = data.points;
          this.lastUpdate = Date.now();
        }
      };
      this.subscriptions.push(subscription);
      if (this.options.from === 0) {
        // Live updates
        subscription.live = true;
        this.graphData.subscribe(m.id, 0, this.options.span, subscription.callback);
      }
    });

    if (this.options.from !== 0) {
      this.options.paused = true;
      this.forceRefresh(this.options.from, this.options.span);
    }
  }

  private enumMetrics(cb: (metric: Data.Metric) => void) {
    let availableMetrics = this.graphData.getMetrics();

    this.options.metricIds.forEach(id => {
      let metricInfo = _.find(availableMetrics, m => m.id === id);
      if (!metricInfo) {
        throw `Cannot find metric with id [${id}]`;
      }

      cb(metricInfo);
    });
  }

  private validateOptions() {
    if (!this.options || !this.options.metricIds || !this.options.metricIds.length || !this.options.span) {
      return false;
    }

    if (!_.isInteger(this.options.span) || this.options.span <= 0) {
      throw 'span must be an integer greater than 0';
    }

    if (this.options.from && (!_.isInteger(this.options.from) || this.options.from < 0)) {
      throw 'from must be a positive integer';
    }

    return true;
  }
}
