import { apiGet, getConfiguration } from './apiProvider';
import { getSPUserByMail } from './sharepointProvider';

let _profile = undefined;
export async function getMe() {
  if (!_profile) {
    const config = await getConfiguration(),
      response = await apiGet('me?$select=id,displayName,mail,mobilePhone,country', 'user'),
      groups = await apiGet('me/memberOf', 'user');

    const profile = response.graphClientMessage,
      spProfile = await getSPUserByMail(profile.mail);

    profile.isInList = spProfile != undefined;

    if (groups.graphClientMessage) {
      let groupsList = groups.graphClientMessage.value;

      profile.isAdmin = groupsList.some((group) => {
        return group.id === config.AdminGroupId;
      });
      profile.isNFP =
        !profile.isAdmin &&
        groupsList.some((group) => {
          return group.id === config.NFPGroupId;
        });
      profile.isGuest = !profile.isAdmin && !profile.isNFP;
    }
    _profile = profile;
  }
  return _profile;
}

export async function getUserByMail(email) {
  try {
    const adResponse = await apiGet("/users/?$filter=mail eq '" + email + "'"),
      spUser = await getSPUserByMail(email),
      adMessage = adResponse.graphClientMessage;

    const adUser = adMessage.value && adMessage.value.length ? adMessage.value[0] : undefined;

    return {
      ADUser: adUser,
      SharepointUser: spUser,
      Continue: (!adUser && !spUser) || (adUser && !spUser),
    };
  } catch (err) {
    console.log(err);
    return undefined;
  }
}

export async function getUser(userId) {
  try {
    const response = await apiGet('/users/' + userId);
    return response.graphClientMessage;
  } catch (err) {
    console.log(err);
    return undefined;
  }
}
