import Charts from '../../index';
import lib from '../lib';
import _ from 'lodash';

@lib.service
@lib.inject(['$q', '$interval'])
export class DummyMetricsProvider implements Charts.Data.MetricsProvider {
  name = 'Dummy Provider';
  description = 'dummy';

  dummyMetrics = [
    {
      name: 'foo',
      listener: <Charts.Data.MetricCallback>null
    },
    {
      name: 'bar',
      axisLabel: 'percent',
      axisRange: {
        min: 0,
        max: 100
      },
      listener: <Charts.Data.MetricCallback>null
    },
    {
      name: 'baz',
      axisLabel: 'bytes',
      format: '0b',
      listener: <Charts.Data.MetricCallback>null
    }
  ];

  points: { [metric: string]: Charts.Data.Points } = {};

  constructor(
    private $q: ng.IQService,
    $interval: ng.IIntervalService
  ) {
    this.dummyMetrics.forEach(m => {
      this.points[m.name] = [];
    });

    $interval(() => {
      this.dummyMetrics.forEach(m => { this.updateMetric(m, true); });
    }, 2000);
  }

  metrics() {
    return this.$q.resolve(this.dummyMetrics);
  }

  subscribe = (metric: Charts.Data.MetricInfo, span: number, listener: Charts.Data.MetricCallback) => {
    let dummyMetric = _.find(this.dummyMetrics, m => m.name === metric.name);
    dummyMetric.listener = listener;
    this.updateMetric(dummyMetric, false);
  }

  unsubscribe(metric: Charts.Data.MetricInfo) {
    _.find(this.dummyMetrics, m => m.name === metric.name).listener = null;
  }

  getPoints(metric: Charts.Data.MetricInfo, start: number, finish: number): ng.IPromise<Charts.Data.SeriesData> {
    return this.$q.resolve({
      points: { 'series': this.points[metric.name].length ? this.points[metric.name] : this.buildPoints(metric) }
    });
  }

  private updateMetric(metric: any, addPoint: boolean) {
    if (!this.points[metric.name].length) {
      this.points[metric.name] = this.buildPoints(metric);
    }
    else if (addPoint) {
      this.points[metric.name] = [{ timestamp: Date.now(), data: this.newPoint(metric) }]
        .concat(this.points[metric.name]
        .slice(0, this.points[metric.name].length));
    }

    if (metric.listener) {
      metric.listener({ points: { 'series': this.points[metric.name] }});
    }
  }

  private newPoint(metric: any): Charts.Data.PointData {
    let range = metric.range || { min: 0, max: 5 };
    let avg = range.min + Math.random() * range.max;
    return {
      avg: avg,
      min: Math.max(avg - Math.random(), range.min),
      max: Math.min(avg + Math.random(), range.max)
    };
  }

  private buildPoints(metric: any) {
    let points: Charts.Data.Points = [];
    let now = Date.now();

    for (let i = 0; i < 150; i++) {
      points.push({ timestamp: now - (i * 2000), data: this.newPoint(metric) });
    }

    return points;
  }
}

@lib.service
@lib.inject(['$q', '$interval'])
export class DummyMetricsProvider2 extends DummyMetricsProvider {
  name = 'Dummy Provider 2';
}
