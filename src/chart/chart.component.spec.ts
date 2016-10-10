import { DummyMetricsProvider } from '../fixtures/dummyProvider';
import Charts from '../../index';

interface TestScope extends ng.IScope {
  chartOptions: Charts.Chart.ChartOptions;
}

describe(Charts.Chart.Chart.name, () => {
  let graphData: Charts.Data.GraphData;
  let dummyProvider: DummyMetricsProvider;
  let rootScope: ng.IRootScopeService;
  let compile: ng.ICompileService;

  beforeEach(angular.mock.module('rs.charts'));

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
      graphData = _graphData;
      dummyProvider = _dummyProvider;
      rootScope = _rootScope;
      compile = _compile;

      graphData.addProvider(dummyProvider);

      spyOn(graphData, 'subscribe').and.callThrough();
      spyOn(graphData, 'unsubscribe').and.callThrough();
    }
  ]));

  it('should subscribe to one metric', () => {
    let scope = <TestScope>rootScope.$new();
    scope.chartOptions = {
      span: 10000,
      metricIds: ['Dummy Provider#foo']
    };
    compile('<rs-chart options="chartOptions"></rs-chart>')(scope);
    scope.$digest();
    expect(graphData.subscribe).toHaveBeenCalledTimes(1);
    scope.$digest();
  });

  it('should subscribe to two metrics', () => {
    let scope = <TestScope>rootScope.$new();
    scope.chartOptions = {
      span: 10000,
      metricIds: ['Dummy Provider#foo', 'Dummy Provider#bar']
    };
    compile('<rs-chart options="chartOptions"></rs-chart>')(scope);
    scope.$digest();
    expect(graphData.subscribe).toHaveBeenCalledTimes(2);
  });

  it('should subscribe to a new metric added to the options', () => {
    let scope = <TestScope>rootScope.$new();
    scope.chartOptions = {
      span: 10000,
      metricIds: ['Dummy Provider#foo']
    };
    compile('<rs-chart options="chartOptions"></rs-chart>')(scope);
    scope.$digest();
    scope.chartOptions.metricIds.push('Dummy Provider#bar');
    scope.$digest();
    expect(graphData.subscribe).toHaveBeenCalledTimes(3);
  });
});
