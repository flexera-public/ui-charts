import lib from '../lib';
import * as Data from '../dataProvider/dataProvider.service';
import _ from 'lodash';

interface SubscriptionData {
  metricId: number;
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
  metricIds: number[];
  paused?: boolean;
}

/**
 * Core chart component, needs to be used with a renderer to show any data
 *
 * @export
 * @class ChartComponent
 */
@lib.component('rsChart', {
  bindings: {
    options: '='
  }
})
@lib.inject([Data.GraphData, '$scope'])
export class ChartComponent {

  public options: ChartOptions;
  public details: MetricDetails[];

  private subscriptions: SubscriptionData[] = [];

  constructor(
    private graphData: Data.GraphData,
    $scope: ng.IScope
  ) {
    $scope.$watch(() => this.options, () => this.refreshSubscriptions(), true);

    $scope.$on('$destroy', () => this.unsubscribe());
  }

  /**
   * Unsubscribes from listening to all metrics
   *
   * @private
   */
  private unsubscribe() {
    this.subscriptions.forEach(s => {
      this.graphData.unsubscribe(s.metricId, s.callback);
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

    let availableMetrics = this.graphData.getMetrics();

    this.options.metricIds.forEach(id => {
      let metricInfo = _.find(availableMetrics, m => m.id === id);
      if (!metricInfo) {
        throw `Cannot find metric with id [${id}]`;
      }
      let details: MetricDetails = _.clone(metricInfo);
      this.details.push(details);

      let subscription: SubscriptionData = {
        metricId: id,
        callback: (data: Data.SeriesData) => {
          details.points = data.points;
        }
      };
      this.subscriptions.push(subscription);

      this.graphData.subscribe(id, this.options.from || 0, this.options.span, subscription.callback);
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
