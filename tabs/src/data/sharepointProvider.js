import { apiGet, getConfiguration } from './apiProvider';

function wrapError(err, message) {
  return {
    Message: message,
    Error: err,
    Success: false,
  };
}

const sharepointSiteId =
  '7lcpdm.sharepoint.com,bf9359de-0f13-4b00-8b5a-114f6ef3bfb0,6609a994-5225-4a1d-bd05-a239c7b45f72';

export async function getOrganisationList(country) {
  const config = await getConfiguration();
  try {
    let path =
      '/sites/' +
      sharepointSiteId +
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

var mappingsList = undefined;
export async function getMappingsList() {
  const config = await getConfiguration();
  try {
    if (!mappingsList) {
      const response = await apiGet(
        '/sites/' + sharepointSiteId + '/lists/' + config.MappingListId + '/items?$expand=fields',
      );
      mappingsList = response.graphClientMessage.value.map(function (mapping) {
        return {
          TeamURL: mapping.fields.TeamURL,
          O365Group: mapping.fields.O365group,
          O365GroupId: mapping.fields.O365GroupId,
          Membership: mapping.fields.Membership,
          Tag: mapping.fields.Tag,
          OtherMembership: mapping.fields.OtherMembership,
          ManagementBoard: mapping.fields.ManagementBoard,
        };
      });
    }
    return mappingsList;
  } catch (err) {
    console.log(err);
  }
}

export async function getCountries() {
  const config = await getConfiguration();
  try {
    const response = await apiGet(
      '/sites/' + sharepointSiteId + '/lists/' + config.UserListId + '/columns',
    );
    const columns = response.graphClientMessage.value;

    var countryColumn = columns.find((column) => column.name === 'Country');
    if (countryColumn && countryColumn.choice) {
      return countryColumn.choice.choices;
    }

    return [];
  } catch (err) {
    return wrapError(err, 'Error loading countries');
  }
}

export async function getSPUserByMail(email) {
  const config = await getConfiguration();
  try {
    const path =
        '/sites/' +
        sharepointSiteId +
        '/lists/' +
        config.UserListId +
        "/items?$filter=fields/Email eq '" +
        email +
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

export async function getConsultations(consultationType) {
  const config = await getConfiguration();
  try {
    let path =
      '/sites/' +
      sharepointSiteId +
      '/lists/' +
      config.ConsultationListId +
      '/items?$expand=fields&$top=999';

    if (consultationType) {
      path += "&$filter=fields/ConsultationType eq '";
      path += consultationType + "'";
    }

    const response = await apiGet(path),
      consultations = await response.graphClientMessage;

    return consultations.value.map(function (consultation) {
      /*var organisation = organisations.find(
        (o) => o.content === user.fields.OrganisationLookupId
      );*/
      return {
        id: consultation.fields.id,

        Title: consultation.fields.Title,
        ConsultationType: consultation.fields.ConsultationType,
        Description: consultation.fields.Description,

        Startdate: new Date(consultation.fields.Startdate),
        Closed: new Date(consultation.fields.Closed),
        Deadline: new Date(consultation.fields.Deadline),

        Linktofolder: consultation.fields.Linktofolder,
        Respondants: consultation.fields.Respondants,
        Countries: consultation.fields.Countries,

        ConsulationmanagerLookupId: consultation.fields.ConsulationmanagerLookupId,
        EionetGroups: consultation.fields.EionetGroups,
      };
    });
  } catch (err) {
    console.log(err);
  }
}

export async function getMeetings() {
  const config = await getConfiguration();
  try {
    let path =
      '/sites/' +
      sharepointSiteId +
      '/lists/' +
      config.MeetingListId +
      '/items?$expand=fields&$top=999';

    const response = await apiGet(path),
      meetings = await response.graphClientMessage;

    return meetings.value.map(function (meeting) {
      return {
        id: meeting.fields.id,

        Title: meeting.fields.Title,
        MeetingLink: meeting.fields.Meetinglink,
        Group: meeting.fields.Group,

        MeetingStart: new Date(meeting.fields.Meetingstart),
        MeetingEnd: new Date(meeting.fields.Meetingend),

        Linktofolder: meeting.fields.Linktofolder,
      };
    });
  } catch (err) {
    console.log(err);
  }
}

export async function getInvitedUsers(country) {
  const config = await getConfiguration();
  try {
    let path =
      '/sites/' +
      config.SharepointSiteId +
      '/lists/' +
      config.UserListId +
      '/items?$expand=fields&$top=999';
    if (country) {
      path += "&$filter=fields/Country eq '" + country + "'";
    }
    const response = await apiGet(path),
      users = await response.graphClientMessage,
      organisations = await getOrganisationList();

    return users.value.map(function (user) {
      let organisation = organisations.find((o) => o.content === user.fields.OrganisationLookupId);

      //concatenate memberships, otherMemberships and NFP in one field
      let memberships = (user.fields.Membership || []).concat(user.fields.OtherMemberships || []);
      user.fields.NFP && memberships.push(user.fields.NFP);

      return {
        Title: user.fields.Title,
        Email: user.fields.Email,
        Membership: user.fields.Membership,
        AllMemberships: memberships,
        OtherMemberships: user.fields.OtherMemberships,
        OtherMembershipsString:
          user.fields.OtherMemberships && user.fields.OtherMemberships.toString(),
        Country: user.fields.Country,
        OrganisationLookupId: user.fields.OrganisationLookupId,
        Organisation: organisation ? organisation.header : '',
        Phone: user.fields.Phone,
        ADUserId: user.fields.ADUserId,
        Gender: user.fields.Gender,
        NFP: user.fields.NFP,
        SignedIn: user.fields.SignedIn,
        SuggestedOrganisation: user.fields.SuggestedOrganisation,
        LastInvitationDate: user.fields.LastInvitationDate,
        id: user.fields.id,
      };
    });
  } catch (err) {
    console.log(err);
    return [];
  }
}
