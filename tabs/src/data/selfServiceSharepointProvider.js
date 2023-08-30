import { apiGet, getConfiguration } from './apiProvider';

export async function getOrganisationList(country) {
  const config = await getConfiguration();
  try {
    let path =
      '/sites/' +
      config.SharepointSiteId +
      '/lists/' +
      config.OrganisationListId +
      '/items?$expand=fields';
    if (country) {
      path += "&$filter=fields/Country eq '" + country + "' or fields/Unspecified eq 1";
    }
    const response = await apiGet(path);
    return response.graphClientMessage.value.map(function (organisation) {
      return {
        header: organisation.fields.Title,
        content: organisation.id,
        unspecified: organisation.fields.Unspecified,
      };
    });
  } catch (err) {
    console.log(err);
    return [];
  }
}

export async function getSPUserByMail(email) {
  const config = await getConfiguration();
  try {
    const path =
        '/sites/' +
        config.SharepointSiteId +
        '/lists/' +
        config.UserListId +
        "/items?$filter=fields/Email eq '" +
        email?.replace("'", "''") +
        "'&$expand=fields",
      response = await apiGet(path),
      profile = response.graphClientMessage;
    if (profile.value && profile.value.length) {
      return profile.value[0];
    }
    return undefined;
  } catch (err) {
    console.log(err);
  }
}

export async function getGenderList() {
  const config = await getConfiguration();
  let genders = [];
  try {
    const response = await apiGet(
      '/sites/' + config.SharepointSiteId + '/lists/' + config.UserListId + '/columns',
    );
    const columns = response.graphClientMessage.value;
    let genderColumn = columns.find((column) => column.name === 'Gender');
    if (genderColumn && genderColumn.choice) {
      genders = genderColumn.choice.choices;
    }

    return genders;
  } catch (err) {
    console.log(err);
  }
}
