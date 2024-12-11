import { TeamsUserCredential, getResourceConfiguration, ResourceType } from '@microsoft/teamsfx';
import * as axios from 'axios';

async function callApiFunction(command, method, options, params) {
  let message = [];

  const credential = new TeamsUserCredential();
  const accessToken = await credential.getToken('');
  const apiConfig = getResourceConfiguration(ResourceType.API);
  const response = await axios.default.request({
    method: method,
    url: apiConfig.endpoint + '/api/' + command,
    headers: {
      authorization: 'Bearer ' + accessToken.token,
    },
    data: options,
    params,
  });
  message = response.data;

  return message;
}

export async function apiGet(path, credentialType = 'app', skipLog) {
  try {
    return await callApiFunction('graphData', 'get', undefined, {
      path: path,
      credentialType: credentialType,
    });
  } catch (err) {
    !skipLog && logError(err, path, {});
    throw err;
  }
}

export async function apiPost(path, data, credentialType = 'app', skipLog) {
  try {
    return await callApiFunction('graphData', 'post', {
      credentialType: credentialType,
      data: data,
      path: path,
    });
  } catch (err) {
    !skipLog && logError(err, path, data);
    throw err;
  }
}

export async function apiPatch(path, data, eTag = undefined, credentialType = 'app') {
  try {
    return await callApiFunction('graphData', 'patch', {
      credentialType: credentialType,
      data: data,
      path: path,
      ...(eTag && { eTag: eTag }),
    });
  } catch (err) {
    logError(err, path, data);
    throw err;
  }
}

export async function apiDelete(path, credentialType = 'app') {
  try {
    return await callApiFunction('graphData', 'delete', {
      credentialType: credentialType,
      path: path,
    });
  } catch (err) {
    logError(err, path, null);
    throw err;
  }
}

let _userMail;
export async function getUserMail() {
  if (!_userMail) {
    const response = await apiGet('me?$select=id,displayName,mail,mobilePhone,country', 'user');

    if (response.graphClientMessage) {
      _userMail = response.graphClientMessage.mail;
    }
  }
  return _userMail;
}

const sharepointSiteId = process.env.REACT_APP_SHAREPOINT_SITE_ID,
  configurationListId = process.env.REACT_APP_CONFIGURATION_LIST_ID;

let _configuration;
export async function getConfiguration() {
  try {
    if (!_configuration) {
      const response = await apiGet(
        '/sites/' + sharepointSiteId + '/lists/' + configurationListId + '/items?$expand=fields',
      );
      _configuration = {};
      response.graphClientMessage.value.forEach(function (item) {
        _configuration[item.fields.Title] = item.fields.Value;
      });
      _configuration.SharepointSiteId = sharepointSiteId;
    }
    return _configuration;
  } catch (err) {
    console.log(err);
    return undefined;
  }
}

export async function logError(err, apiPath, data) {
  const userMail = await getUserMail();

  let title = err.response?.data?.error?.body || err.message;

  //missing index error
  if (err.response?.data?.message?.includes('HonorNonIndexedQueriesWarningMayFailRandomly')) {
    title = err.response?.data?.message;
  }

  let fields = {
    fields: {
      ApplicationName: 'Eionet2-Dashboard',
      ApiPath: apiPath,
      ApiData: JSON.stringify(data),
      Title: title,
      UserMail: userMail,
      Timestamp: new Date(),
      Logtype: 'Error',
    },
  };

  if (_configuration) {
    await apiPost(
      `/sites/${_configuration.SharepointSiteId}/lists/${_configuration.LoggingListId}/items`,
      fields,
      'app',
      true,
    );
  } else {
    console.log('Configuration not loaded cannot proceed');
  }
}

export async function logInfo(message, apiPath, data, action, affectedUser, skipEmail = false) {
  const spConfig = await getConfiguration(),
    userMail = await getUserMail();

  let fields = {
    fields: {
      ApplicationName: 'Eionet2-Dashboard',
      ApiPath: apiPath,
      ApiData: JSON.stringify(data),
      Title: message,
      UserMail: skipEmail ? '' : userMail,
      Timestamp: new Date(),
      Logtype: 'Info',
      Action: action,
      AffectedUser: affectedUser,
    },
  };

  let graphURL =
    '/sites/' + spConfig.SharepointSiteId + '/lists/' + spConfig.LoggingListId + '/items';
  await apiPost(graphURL, fields);
}
