import lib from '../lib'
import * as Chart from '../chart/chart.component'
import _ from 'lodash'

@lib.component('rsTableRenderer', {
  require: {
    chart: 'rsChart'
  },
  templateUrl: 'ui-chart/tableRenderer/tableRenderer.html'
})
@lib.inject(['$scope'])
export class TableRenderer {
  chart: Chart.ChartComponent



  constructor(
    $scope: ng.IScope
  ) {
    $scope.$watch(() => this.chart.details, this.prepData, true)
  }

  private prepData = (details: Chart.MetricDetails[]) => {
    var timestamps = _(details)
      .map(d => _(d.points).keys().each(k => parseInt(k)).value())
      .flatten()
      .sort()
  }
}
