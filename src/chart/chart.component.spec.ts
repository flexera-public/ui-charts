import { DummyMetricsProvider } from '../fixtures/dummyProvider.ts'
import Charts from '../../index'

interface TestScope extends ng.IScope {
  chartOptions: Charts.Chart.ChartOptions
}

describe(Charts.Chart.ChartComponent.name, () => {
  var graphData: Charts.Data.GraphData,
    dummyProvider: DummyMetricsProvider,
    rootScope: ng.IRootScopeService,
    compile: ng.ICompileService

  beforeEach(angular.mock.module('rs.charts'))

  beforeEach(inject([
    Charts.Data.GraphData.name,
    DummyMetricsProvider.name,
    '$rootScope',
    '$compile',
    (
      _graphData: Charts.Data.GraphData,
      _dummyProvider: DummyMetricsProvider,
      _rootScope: ng.IRootScopeService,
      _compile: ng.ICompileService
    ) => {
      graphData = _graphData
      dummyProvider = _dummyProvider
      rootScope = _rootScope
      compile = _compile

      graphData.addProvider(dummyProvider)

      spyOn(graphData, 'subscribe').and.callThrough()
      spyOn(graphData, 'unsubscribe').and.callThrough()
    }
  ]))

  it('should subscribe to one metric', () => {
    var scope = <TestScope>rootScope.$new()
    scope.chartOptions = {
      span: 10000,
      metricIds: [0]
    }
    compile('<rs-chart options="chartOptions"></rs-chart>')(scope)
    scope.$digest()
    expect(graphData.subscribe).toHaveBeenCalledTimes(1)
    scope.$digest()
  })

  it('should subscribe to two metrics', () => {
    var scope = <TestScope>rootScope.$new()
    scope.chartOptions = {
      span: 10000,
      metricIds: [0, 1]
    }
    compile('<rs-chart options="chartOptions"></rs-chart>')(scope)
    scope.$digest()
    expect(graphData.subscribe).toHaveBeenCalledTimes(2)
  })

  it('should subscribe to a new metric added to the options', () => {
    var scope = <TestScope>rootScope.$new()
    scope.chartOptions = {
      span: 10000,
      metricIds: [0]
    }
    compile('<rs-chart options="chartOptions"></rs-chart>')(scope)
    scope.$digest()
    scope.chartOptions.metricIds.push(1)
    scope.$digest()
    expect(graphData.subscribe).toHaveBeenCalledTimes(3)
  })
})
