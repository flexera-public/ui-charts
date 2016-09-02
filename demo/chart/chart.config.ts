import app from '../app';
import Charts from '../../index';
import { DummyMetricsProvider } from '../../src/fixtures/dummyProvider';

app.run([Charts.Data.GraphData, DummyMetricsProvider], (
  graphData: Charts.Data.GraphData,
  dummyProvider: DummyMetricsProvider
) => {
  // Register the dummy data provider once
  graphData.addProvider(dummyProvider);
});
