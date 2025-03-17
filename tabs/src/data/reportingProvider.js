import { apiGet, getConfiguration } from './apiProvider';

function capitalize(str) {
  const result = str?.toLowerCase().replace(/_/g, ' ');
  return result.charAt(0).toUpperCase() + result.slice(1);
}

export async function getFlows(country) {
  if (!country) {
    return [];
  }

  const config = await getConfiguration();
  try {
    let path =
      '/sites/' +
      config.SharepointSiteId +
      '/lists/' +
      config.ReportnetFlowsListId +
      '/items?$expand=fields&$top=999&$select=id,fields';

    if (country) {
      path += "&$filter=fields/Country eq '" + country + "'";
    }

    let result = [];
    while (path) {
      const response = await apiGet(path),
        flows = response.graphClientMessage?.value;

      flows && flows.forEach((flow) => {
        const flowFields = flow.fields
        result.push({
          id: flow.id,
          country: flowFields.Country,
          dataflowId: flowFields.DataflowId,
          dataflowName: flowFields.DataflowName,
          dataflowURL: flowFields.DataflowURL,
          obligationName: flowFields.ObligationName,
          obligationURL: flowFields.ObligationURL,
          legalInstrumentName: flowFields.LegalInstrumentName,
          legalInstrumentURL: flowFields.LegalInstrumentURL,
          deadlineDate: flowFields.DeadlineDate && new Date(flowFields.DeadlineDate),
          status: capitalize(flowFields.Status),
          reporterEmails: flowFields.ReporterEmails?.split(';') || [],
          firstReleaseDate: flowFields.FirstReleaseDate && new Date(flowFields.FirstReleaseDate),
          lastReleaseDate: flowFields.LastReleaseDate && new Date(flowFields.LastReleaseDate),
          deliveryStatus: flowFields.DeliveryStatus,
        });
      });

      path = response.graphClientMessage['@odata.nextLink'];
    }

    return result;
  } catch (err) {
    console.log(err);
    return [];
  }
}



