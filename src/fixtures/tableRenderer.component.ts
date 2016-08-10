import lib from '../lib'
import * as Chart from '../chart/chart.component'

@lib.component('rsTableRenderer', {
  require: {
    chart: 'rsChart'
  }
})
export class TableRenderer {
  chart: Chart.ChartComponent
}
