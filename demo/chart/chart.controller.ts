import app from '../app'
import Chart from '../../index'
import {DummyMetricsProvider} from '../../src/fixtures/dummyProvider'
import '../../src/tableRenderer/tableRenderer.directive'
import _ from 'lodash'

@app.controller
@app.inject([Chart.Data.GraphData, DummyMetricsProvider, '$scope'])
export class ChartController {

  spanStr: string = '10000'
  metric1: boolean = false
  metric2: boolean = false
  span: number

  metrics:number[] = []

  constructor(
    graphData: Chart.Data.GraphData,
    dummyProvider: DummyMetricsProvider,
    scope: ng.IScope
  ) {
    graphData.addProvider(dummyProvider)

    scope.$watch(() => this.spanStr, val => this.span = parseInt(val))

    scope.$watch(() => this.metric1, show => {
      if (show) {
        this.metrics = _.uniq([0].concat(this.metrics))
      }
      else {
        _.remove(this.metrics, m => m == 0)
      }
    })

    scope.$watch(() => this.metric2, show => {
      if (show) {
        this.metrics = _.uniq([1].concat(this.metrics))
      }
      else {
        _.remove(this.metrics, m => m == 1)
      }
    })
  }

}
