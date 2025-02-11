import { logError } from './apiProvider';
import * as axios from 'axios';


const authorizationKey = process.env.REACT_APP_REPORTNET3_KEY;

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
      status: flow.status,
      emails: emails,
      firstReleaseDate: firstReleaseDate,
      lastReleaseDate: lastReleaseDate,
      deliveryStatus: flow.reportingDatasets?.[0]?.status,
    }
  });
}

export async function apiPost(path, country, skipLog) {
  const pageSize = 20,
    dataflows = [], nationalCoordinators = [];
  let url = `${path}${country}?asc=0&pageNum=0&pageSize=${pageSize}&key=${authorizationKey}`;

  try {
    let response = await axios.default.request({
      method: 'post',
      url: url
    });

    if (response?.data?.totalRecords > 0) {
      dataflows.push(...response.data.dataflows);
      nationalCoordinators.push(...response.data.nationalCoordinators);
      const noOfPages = Math.ceil(response.data.totalRecords / pageSize);
      let pageNo = 1;


      while (pageNo <= noOfPages) {
        url = `${path}${country}?asc=0&pageNum=${pageNo}&pageSize=${pageSize}&key=${authorizationKey}`;
        response = await axios.default.request({
          method: 'post',
          url: url
        });

        dataflows.push(...response.data.dataflows);
        nationalCoordinators.push(...response.data.nationalCoordinators);
        pageNo++;
      }

      return {
        dataflows: processFlows(dataflows),
        nationalCoordinators: nationalCoordinators
      }
    }
  } catch (err) {
    !skipLog && logError(err, path, { country: country });
    throw err;
  }
}



