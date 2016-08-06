import { DummyMetricsProvider, DummyMetricsProvider2 } from '../fixtures/dummyProvider.ts'
import * as Data from './dataProvider.service'

describe(Data.GraphData.name, () => {
  var graphData: Data.GraphData,
    dummyProvider: DummyMetricsProvider,
    dummyProvider2: DummyMetricsProvider2,
    rootScope: ng.IRootScopeService

  beforeEach(angular.mock.module('rs.charts'))

  beforeEach(inject([Data.GraphData.name, DummyMetricsProvider.name, DummyMetricsProvider2.name, '$rootScope', (
    _graphData: Data.GraphData,
    _dummyProvider: DummyMetricsProvider,
    _dummyProvider2: DummyMetricsProvider2,
    _rootScope: ng.IRootScopeService
  ) => {
    graphData = _graphData
    dummyProvider = _dummyProvider
    dummyProvider2 = _dummyProvider2
    rootScope = _rootScope
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
    it('should throw an error if subscribing to a non-existent metric')

    it('should throw an error if ths span is 0 or less')

    it('should subscribe with the provider')

    it('should not renew provider subscription when next subscription span is shorter')

    it('should renew provider subscription when next subscription span is longer')

    it('should dispatch data to all subsribers')
  })

  describe('unsubscribe()', () => {
    it('should throw an error if the metric does not exist')

    it('should no longer dispatch data to unsibscribed client')

    it('should unsubscribe from provider when all clients have unsibscribed')
  })
})
