import lib from '../lib'
import * as Data from '../dataProvider/dataProvider.service'

interface SubscriptionData {
    metricId: number
    callback: Data.MetricCallback
}

export interface MetricDetails {
  id: number
  name: string
  points?: Data.DataPoints
}

@lib.component('rsChart', {
  bindings: {
    metricIds: '<',
    span: '=',
    end: '='
  }
})
@lib.inject([Data.GraphData, '$scope'])
export class ChartComponent {
  public metricIds: number[]
  public span: number
  public end: number

  private subscriptions: SubscriptionData[] = []
  private metrics: Data.Metric[]

  public details: MetricDetails[]

  constructor(
    private graphData: Data.GraphData,
    $scope: ng.IScope
  ) {
    $scope.$watch(() => [this.metricIds, this.span, this.end], () => this.refreshSubscriptions(), true)

    $scope.$on('$destroy', () => this.unsubscribe())
  }

  private unsubscribe() {
    this.subscriptions.forEach(s => {
      this.graphData.unsubscribe(s.metricId, s.callback)
    })
    this.subscriptions = []
  }

  private refreshSubscriptions() {
    this.unsubscribe()
    this.details = []
    if (!this.metricIds) return

    this.metricIds.forEach(id => {
      let metricInfo = this.graphData.getMetrics().find(m => m.id == id)
      if (!metricInfo) throw `Cannot find metric with id [${id}]`
      let details: MetricDetails = {
        id: id,
        name: metricInfo.name
      }
      this.details.push(details)

      let subscription:SubscriptionData = {
        metricId: id,
        callback: (data: Data.SeriesData) => {
          details.points = data.points
        }
      }
      this.subscriptions.push(subscription)

      this.graphData.subscribe(id, this.span, subscription.callback)
    })
  }
}
