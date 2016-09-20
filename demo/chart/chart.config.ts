import app from '../app';
import Charts from '../../index';
import { DummyMetricsProvider } from '../../src/fixtures/dummyProvider';

app
  .inject(Charts.Data.GraphData, DummyMetricsProvider)
  .run((
    graphData: Charts.Data.GraphData,
    dummyProvider: DummyMetricsProvider
  ) => {
    // Register the dummy data provider once
    graphData.addProvider(dummyProvider);
  });
