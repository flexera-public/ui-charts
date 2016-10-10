import { DummyMetricsProvider, DummyMetricsProvider2 } from '../fixtures/dummyProvider';
import * as Data from './dataProvider.service';

describe(Data.GraphData.name, () => {
  let graphData: Data.GraphData;
  let dummyProvider: DummyMetricsProvider;
  let dummyProvider2: DummyMetricsProvider2;
  let rootScope: ng.IRootScopeService;
  let interval: ng.IIntervalService;

  beforeEach(angular.mock.module('rs.charts'));

  beforeEach(inject([
    Data.GraphData.name,
    DummyMetricsProvider.name,
    DummyMetricsProvider2.name,
    '$rootScope',
    '$interval',
    (
      _graphData: Data.GraphData,
      _dummyProvider: DummyMetricsProvider,
      _dummyProvider2: DummyMetricsProvider2,
      _rootScope: ng.IRootScopeService,
      _interval: ng.IIntervalService
    ) => {
      graphData = _graphData;
      dummyProvider = _dummyProvider;
      dummyProvider2 = _dummyProvider2;
      rootScope = _rootScope;
      interval = _interval;
    }]));

  describe('addProvider()', () => {
    it('should add a new provider', () => {
      graphData.addProvider(dummyProvider);
      rootScope.$apply();
      expect(graphData.getMetrics().length).toBe(3);
    });

    it('should throw an error if adding an existing provider', () => {
      graphData.addProvider(dummyProvider);
      expect(() => { graphData.addProvider(dummyProvider); })
        .toThrow('The [Dummy Provider] metrics provider has already been added');
    });
  });

  describe('getMetrics()', () => {

    beforeEach(() => {
      graphData.addProvider(dummyProvider);
      graphData.addProvider(dummyProvider2);
      rootScope.$apply();
    });

    it('should get the metrics for all providers', () => {
      expect(graphData.getMetrics().length).toBe(6);
    });

    it('should get the metrics for a single provider', () => {
      let metrics = graphData.getMetrics(dummyProvider2);
      expect(metrics.length).toBe(3);
      expect(metrics[0].name).toBe('foo');
      expect(metrics[0].providerName).toBe('Dummy Provider 2');
    });
  });

  describe('subscribe()', () => {
    beforeEach(() => {
      graphData.addProvider(dummyProvider);
      rootScope.$apply();
    });

    it('should throw an error if subscribing to a non-existent metric', () => {
      expect(() => { graphData.subscribe('not real', 0, 10, data => { }); })
        .toThrow('Cloud not find a metric with id [not real]');
    });

    it('should throw an error if the span is 0 or less', () => {
      expect(() => { graphData.subscribe('Dummy Provider#foo', 0, 0, data => { }); })
        .toThrow('The span parameter needs to be a positive number greater than 0');
    });

    it('should throw an error if the from is less than 0', () => {
      expect(() => { graphData.subscribe('Dummy Provider#foo', -10, 10, data => { }); })
        .toThrow('The from parameter needs to be a positive number');
    });

    it('should throw an error if subscribing the same listener to the same metric twice', () => {
      let listener = (data: Data.SeriesData) => { };

      graphData.subscribe('Dummy Provider#foo', 0, 40000, listener);
      expect(() => { graphData.subscribe('Dummy Provider#foo', 0, 50000, listener);})
        .toThrow('The callback has already been registered for this metric');
    });

    it('should subscribe with the provider', () => {
      let dataReceived: Data.SeriesData;
      graphData.subscribe('Dummy Provider#foo', 0, 60000, data => {
        dataReceived = data;
      });
      interval.flush(6);
      expect(dataReceived.points).not.toBeUndefined();
    });

    it('should not renew provider subscription when next subscription span is shorter', () => {
      spyOn(dummyProvider, 'subscribe');

      graphData.subscribe('Dummy Provider#foo', 0, 60000, data => { });
      graphData.subscribe('Dummy Provider#foo', 0, 50000, data => { });

      expect(dummyProvider.subscribe).toHaveBeenCalledTimes(1);
    });

    it('should renew provider subscription when next subscription span is longer', () => {
      spyOn(dummyProvider, 'subscribe');

      graphData.subscribe('Dummy Provider#foo', 0, 40000, data => { });
      graphData.subscribe('Dummy Provider#foo', 0, 50000, data => { });

      expect(dummyProvider.subscribe).toHaveBeenCalledTimes(2);
    });

    it('should dispatch data to all subsribers', () => {
      let dataReceived: Data.SeriesData;
      let dataReceived2: Data.SeriesData;

      graphData.subscribe('Dummy Provider#foo', 0, 40000, data => { dataReceived = data; });
      graphData.subscribe('Dummy Provider#foo', 0, 50000, data => { dataReceived2 = data; });
      interval.flush(6);
      expect(dataReceived.points).not.toBeUndefined();
      expect(dataReceived2.points).not.toBeUndefined();
    });
  });

  describe('unsubscribe()', () => {
    it('should throw an error if the metric does not exist', () => {
      expect(() => { graphData.unsubscribe('not real', data => { }); })
        .toThrow('no subscription for metric [not real]');
    });

    it('should throw an error if the metric was not subscribed to', () => {
      graphData.addProvider(dummyProvider);
      rootScope.$apply();

      expect(() => { graphData.unsubscribe('Dummy Provider#foo', data => { }); })
        .toThrow('no subscription for metric [Dummy Provider#foo]');
    });

    it('should no longer dispatch data to unsubscribed client', () => {
      graphData.addProvider(dummyProvider);
      rootScope.$apply();

      let dataReceived: Data.SeriesData = null;
      let listener = (data: Data.SeriesData) => { dataReceived = data; };

      graphData.subscribe('Dummy Provider#foo', 0, 40000, listener);
      interval.flush(6);

      expect(dataReceived).not.toBeNull();
      dataReceived = null;
      graphData.unsubscribe('Dummy Provider#foo', listener);
      interval.flush(0);
      expect(dataReceived).toBeNull();
    });

    it('should unsubscribe from provider when all clients have unsubscribed', () => {
      spyOn(dummyProvider, 'unsubscribe');

      graphData.addProvider(dummyProvider);
      rootScope.$apply();

      let listener = (data: Data.SeriesData) => { };
      let listener2 = (data: Data.SeriesData) => { };

      graphData.subscribe('Dummy Provider#foo', 0, 40000, listener);
      graphData.subscribe('Dummy Provider#foo', 0, 50000, listener2);
      graphData.unsubscribe('Dummy Provider#foo', listener);
      graphData.unsubscribe('Dummy Provider#foo', listener2);

      expect(dummyProvider.unsubscribe).toHaveBeenCalledTimes(1);
    });
  });
});
