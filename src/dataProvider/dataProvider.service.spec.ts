import { DummyMetricsProvider, DummyMetricsProvider2 } from '../fixtures/dummyProvider.ts'
import * as Data from './dataProvider.service'

describe(Data.GraphData.name, () => {
  var graphData: Data.GraphData,
    dummyProvider: DummyMetricsProvider,
    dummyProvider2: DummyMetricsProvider2,
    rootScope: ng.IRootScopeService,
    interval: ng.IIntervalService

  beforeEach(angular.mock.module('rs.charts'))

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
      graphData = _graphData
      dummyProvider = _dummyProvider
      dummyProvider2 = _dummyProvider2
      rootScope = _rootScope
      interval = _interval
    }]))

  describe('addProvider()', () => {
    it('should add a new provider', () => {
      graphData.addProvider(dummyProvider)
      rootScope.$apply()
      expect(graphData.getMetrics().length).toBe(2)
    })

    it('should throw an error if adding an existing provider', () => {
      graphData.addProvider(dummyProvider)
      expect(() => { graphData.addProvider(dummyProvider) }).toThrow('The [Dummy Provider] metrics provider has already been added')
    })
  })

  describe('getMetrics()', () => {

    beforeEach(() => {
      graphData.addProvider(dummyProvider)
      graphData.addProvider(dummyProvider2)
      rootScope.$apply()
    })

    it('should get the metrics for all providers', () => {
      expect(graphData.getMetrics().length).toBe(3)
    })

    it('should get the metrics for a single provider', () => {
      var metrics = graphData.getMetrics(dummyProvider2)
      expect(metrics.length).toBe(1)
      expect(metrics[0].name).toBe('baz')
    })
  })

  describe('subscribe()', () => {
    beforeEach(() => {
      graphData.addProvider(dummyProvider)
      rootScope.$apply()
    })

    it('should throw an error if subscribing to a non-existent metric', () => {
      expect(() => { graphData.subscribe(5, 0, 10, data => { }) })
        .toThrow('Cloud not find a metric with id [5]')
    })

    it('should throw an error if the span is 0 or less', () => {
      expect(() => { graphData.subscribe(0, 0, 0, data => { }) })
        .toThrow('The span parameter needs to be a positive number greater than 0')
    })

    it('should throw an error if the from is less than 0', () => {
      expect(() => { graphData.subscribe(0, -10, 10, data => { }) })
        .toThrow('The from parameter needs to be a positive number')
    })

    it('should throw an error if subscribing the same listener to the same metric twice', () => {
      var listener = (data: Data.SeriesData) => { }

      graphData.subscribe(0, 0, 40000, listener)
      expect(() => { graphData.subscribe(0, 0, 50000, listener)})
        .toThrow('The callback has already been registered for this metric')
    })

    it('should subscribe with the provider', () => {
      var dataReceived: Data.SeriesData
      graphData.subscribe(0, 0, 60000, data => {
        dataReceived = data
      })
      interval.flush(6)
      expect(dataReceived.points).not.toBeUndefined()
    })

    it('should not renew provider subscription when next subscription span is shorter', () => {
      spyOn(dummyProvider, 'subscribe')

      graphData.subscribe(0, 0, 60000, data => { })
      graphData.subscribe(0, 0, 50000, data => { })

      expect(dummyProvider.subscribe).toHaveBeenCalledTimes(1)
    })

    it('should renew provider subscription when next subscription span is longer', () => {
      spyOn(dummyProvider, 'subscribe')

      graphData.subscribe(0, 0, 40000, data => { })
      graphData.subscribe(0, 0, 50000, data => { })

      expect(dummyProvider.subscribe).toHaveBeenCalledTimes(2)
    })

    it('should dispatch data to all subsribers', () => {
      var dataReceived: Data.SeriesData
      var dataReceived2: Data.SeriesData

      graphData.subscribe(0, 0, 40000, data => { dataReceived = data })
      graphData.subscribe(0, 0, 50000, data => { dataReceived2 = data })
      interval.flush(6)
      expect(dataReceived.points).not.toBeUndefined()
      expect(dataReceived2.points).not.toBeUndefined()
    })
  })

  describe('unsubscribe()', () => {
    it('should throw an error if the metric does not exist', () => {
      expect(() => { graphData.unsubscribe(5, data => { }) }).toThrow('no subscription for metric [5]')
    })

    it('should throw an error if the metric was not subscribed to', () => {
      graphData.addProvider(dummyProvider)
      rootScope.$apply()

      expect(() => { graphData.unsubscribe(0, data => { }) }).toThrow('no subscription for metric [0]')
    })

    it('should no longer dispatch data to unsubscribed client', () => {
      graphData.addProvider(dummyProvider)
      rootScope.$apply()

      var dataReceived: Data.SeriesData = null
      var listener = (data: Data.SeriesData) => { dataReceived = data }

      graphData.subscribe(0, 0, 40000, listener)
      interval.flush(6)

      expect(dataReceived).not.toBeNull()
      dataReceived = null;
      graphData.unsubscribe(0, listener)
      interval.flush(0)
      expect(dataReceived).toBeNull()
    })

    it('should unsubscribe from provider when all clients have unsubscribed', () => {
      spyOn(dummyProvider, 'unsubscribe')

      graphData.addProvider(dummyProvider)
      rootScope.$apply()

      var listener = (data: Data.SeriesData) => { }
      var listener2 = (data: Data.SeriesData) => { }

      graphData.subscribe(0, 0, 40000, listener)
      graphData.subscribe(0, 0, 50000, listener2)
      graphData.unsubscribe(0, listener)
      graphData.unsubscribe(0, listener2)

      expect(dummyProvider.unsubscribe).toHaveBeenCalledTimes(1)
    })
  })
})
