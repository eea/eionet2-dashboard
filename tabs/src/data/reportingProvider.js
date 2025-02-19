import { TeamsUserCredential, getResourceConfiguration, ResourceType } from '@microsoft/teamsfx';
import { logError } from './apiProvider';
import * as axios from 'axios';


function capitalize(str) {
  const result = str?.toLowerCase().replace(/_/g, ' ');
  return result.charAt(0).toUpperCase() + result.slice(1);
}


function processFlows(dataflows) {

  return dataflows.map((flow) => {
    const obligation = flow.obligation;
    let emails = [];

    flow.representatives.forEach(rpr => {
      emails.push(...rpr.leadReporters.map(lr => lr.email));
    });
    emails = [...new Set(emails.filter((e) => !!e))];

    const releasedDates = flow.releasedDates.filter(rd => !!rd).sort((a, b) => a - b).map(rDate => new Date(rDate)),
      firstReleaseDate = releasedDates?.length ? releasedDates[0] : undefined,
      lastReleaseDate = releasedDates?.length > 1 ? releasedDates[releasedDates.length - 1] : undefined;

    return {
      id: flow.id,
      dataflowName: flow.name,
      dataflowURL: flow.dataflowLink,
      obligationName: obligation?.oblTitle,
      obligationURL: obligation?.obligationLink,
      legalInstrumentName: obligation?.legalInstrument?.sourceAlias,
      legalInstrumentURL: obligation?.legalInstrument?.legalInstrumentLink,
      ...flow.deadlineDate && { deadlineDate: new Date(flow.deadlineDate) },
      status: capitalize(flow.status),
      emails: emails,
      firstReleaseDate: firstReleaseDate,
      lastReleaseDate: lastReleaseDate,
      deliveryStatus: capitalize(flow.reportingDatasets?.sort((a, b) => b.creationDate - a.creationDate)[0]?.status),
    }
  });
}

export async function apiGet(path, country, skipLog) {
  const credential = new TeamsUserCredential();
  const accessToken = await credential.getToken('');
  const apiConfig = getResourceConfiguration(ResourceType.API);
  try {
    const response = await axios.default.request({
      method: 'get',
      url: apiConfig.endpoint + '/api/reportingData',
      data: undefined,
      headers: {
        authorization: 'Bearer ' + accessToken.token,
      },
      params: {
        path: path,
        country: country
      },
    });

    return {
      dataflows: processFlows(response?.data?.dataflows || [])
    }
  } catch (err) {
    !skipLog && logError(err, path, { country: country });

    return {
      dataflows: []
    }
  }
}



