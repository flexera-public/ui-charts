import Charts from '../../index';
import { DummyMetricsProvider } from '../../src/fixtures/dummyProvider';
import app from '../app';

app
  .inject(Charts.Data.GraphData, DummyMetricsProvider)
  .run((
    graphData: Charts.Data.GraphData,
    dummyProvider: DummyMetricsProvider
  ) => {
    // Register the dummy data provider once
    graphData.addProvider(dummyProvider);
  });
