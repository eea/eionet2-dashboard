import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { ReactPlugin } from '@microsoft/applicationinsights-react-js';
import { createBrowserHistory } from 'history';
const browserHistory = createBrowserHistory({ basename: '' });
const reactPlugin = new ReactPlugin();

const appInsightsConnectionString = process.env.REACT_APP_INSIGHTS_CONNECTION;

const appInsights = new ApplicationInsights({
  config: {
    connectionString: appInsightsConnectionString,
    extensions: [reactPlugin],
    extensionConfig: {
      [reactPlugin.identifier]: { history: browserHistory },
    },
  },
});
appInsights.loadAppInsights();
export { reactPlugin, appInsights };
