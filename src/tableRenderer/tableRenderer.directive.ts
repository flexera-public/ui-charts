import * as Chart from '../chart/chart.component';
import lib from '../lib';

@lib.component({
  require: {
    chart: '^rsChart'
  },
  templateUrl: 'rs.charts/tableRenderer/tableRenderer.html'
})
export class TableRenderer {
  chart: Chart.Chart;
}
