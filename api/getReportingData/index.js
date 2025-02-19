const axios = require("axios");
/**
 *
 * @param {Context} context - The Azure Functions context object.
 * @param {HttpRequest} req - The HTTP request.
 */
module.exports = async function (context, req) {
  context.log("HTTP trigger function processed a request.");

  const authorizationKey = process.env["REACT_APP_REPORTNET3_KEY"];

  // Initialize response.
  const res = {
    status: 200,
    body: { authorizationKey: authorizationKey },
  };

  // Put an echo into response body.
  res.body.receivedHTTPRequestBody = req.body || "";

  const path = req.query.path,
    country = req.query.country;

  let result;

  let headers = {
    'Content-Type': 'application/json'
  }

  const pageSize = 20,
    dataflows = [];
  let url = `${path}${country}?asc=0&pageNum=0&pageSize=${pageSize}&key=${authorizationKey}`;

  try {
    let response = await axios.default.request({
      method: 'post',
      url: url,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response?.data?.totalRecords > 0) {
      dataflows.push(...response.data.dataflows);
      const noOfPages = Math.ceil(response.data.totalRecords / pageSize);
      let pageNo = 1;


      while (pageNo <= noOfPages) {
        url = `${path}${country}?asc=0&pageNum=${pageNo}&pageSize=${pageSize}&key=${authorizationKey}`;
        response = await axios.default.request({
          method: 'post',
          url: url,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        dataflows.push(...response.data.dataflows);
        pageNo++;
      }
    }

    res.body = {
      dataflows: dataflows,
      authorizationKey: authorizationKey
    };

  } catch (e) {
    return {
      status: e.statusCode,
      body: e.body
    };
  }

  return res;
};
