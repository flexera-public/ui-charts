import { DummyMetricsProvider } from '../fixtures/dummyProvider.ts'
import Charts from '../../index'

describe(Charts.Chart.ChartComponent.name, () => {
  var graphData: Charts.Data.GraphData,
    dummyProvider: DummyMetricsProvider,
    rootScope: ng.IRootScopeService

  beforeEach(angular.mock.module('rs.charts'))

  beforeEach(inject([
    Charts.Data.GraphData.name,
    DummyMetricsProvider.name,
    '$rootScope',
    (
      _graphData: Charts.Data.GraphData,
      _dummyProvider: DummyMetricsProvider,
      _rootScope: ng.IRootScopeService,
    ) => {
      graphData = _graphData
      dummyProvider = _dummyProvider
      rootScope = _rootScope

      graphData.addProvider(dummyProvider)
    }
  ]))

  it('should subscribe to one metric')

  it('should subscribe to two metrics')

  it('should subscribe to a new metric added to the options')
})
