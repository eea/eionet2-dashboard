import { apiPatch, getConfiguration, logInfo } from './apiProvider';

function wrapError(err, message) {
  return {
    Message: message,
    Error: err,
    Success: false,
  };
}

async function saveADUser(userData) {
  let displayName = userData.FirstName + ' ' + userData.LastName + ' (' + userData.Country + ')';
  if (userData.NFP) {
    displayName = userData.FirstName + ' ' + userData.LastName + ' (NFP-' + userData.Country + ')';
  }
  await apiPatch('/users/' + userData.ADUserId, {
    givenName: userData.FirstName,
    surname: userData.LastName,
    displayName: displayName,
    department: 'Eionet',
  });
}

async function saveSPUser(userData) {
  const spConfig = await getConfiguration();
  let fields = {
    fields: {
      Phone: userData.Phone,
      Title: userData.FirstName + ' ' + userData.LastName,
      Gender: userData.Gender,
    },
  };

  let graphURL =
    '/sites/' +
    spConfig.SharepointSiteId +
    '/lists/' +
    spConfig.UserListId +
    '/items/' +
    userData.id;
  await apiPatch(graphURL, fields);
}

export async function saveData(user) {
  try {
    await saveADUser(user);
  } catch (err) {
    return wrapError(err, 'saveADUser');
  }

  try {
    await saveSPUser(user);
    await logInfo('User edited information', '', user, 'Edit user');
  } catch (err) {
    return wrapError(err, 'saveSPUser');
  }

  return { Success: true };
}
