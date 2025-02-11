import {
  apiGet,
  apiPost,
  apiPatch,
  getConfiguration,
  apiDelete,
  logError,
  logInfo,
} from './apiProvider';
import { format, differenceInDays, addDays } from 'date-fns';
import { sendEmail } from './provider';
import { createIcs } from './icsHelper';
import Constants from './constants.json';

function wrapError(err, message) {
  return {
    Message: message,
    Error: err,
    Success: false,
  };
}

const MEETING_TITLE_PLACEHOLDER = '{MeetingTitle}',
  MEETING_JOIN_URL_PLACEHOLDER = '{MeetingJoinUrl}';

export async function getOrganisationList(country) {
  const config = await getConfiguration();
  try {
    let path =
      '/sites/' +
      config.SharepointSiteId +
      '/lists/' +
      config.OrganisationListId +
      '/items?$expand=fields&$top=999&$select=id,fields';
    if (country) {
      path += "&$filter=fields/Country eq '" + country + "'";
    }
    const response = await apiGet(path);
    return response.graphClientMessage.value.map(function (organisation) {
      return {
        header: organisation.fields.Title,
        content: organisation.id,
      };
    });
  } catch (err) {
    console.log(err);
    return [];
  }
}

let mappingsList;
export async function getMappingsList() {
  const config = await getConfiguration();
  try {
    if (!mappingsList) {
      const response = await apiGet(
        '/sites/' +
          config.SharepointSiteId +
          '/lists/' +
          config.MappingListId +
          '/items?$expand=fields',
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
          EEAGroupLeads: mapping.fields.EEAGroupLeads,
          ETCManagers: mapping.fields.ETCManagers,
          OfficialGroupName: mapping.fields.OfficialGroupName,
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
      '/sites/' + config.SharepointSiteId + '/lists/' + config.UserListId + '/columns',
    );
    const columns = response.graphClientMessage.value;

    const countryColumn = columns.find((column) => column.name === 'Country');
    if (countryColumn && countryColumn.choice) {
      return countryColumn.choice.choices;
    }

    return [];
  } catch (err) {
    return wrapError(err, 'Error loading countries');
  }
}

export async function getAvailableGroups() {
  const config = await getConfiguration();
  try {
    const response = await apiGet(
      '/sites/' + config.SharepointSiteId + '/lists/' + config.UserListId + '/columns',
    );
    const columns = response.graphClientMessage.value;

    let result = [];

    const column = columns.find((column) => column.name === 'Membership');
    column && column.choice && (result = result.concat(column.choice.choices));

    return result;
  } catch (err) {
    return wrapError(err, 'Error loading groups');
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

export async function getConsultations(fromDate, userCountry) {
  const config = await getConfiguration();
  try {
    let path =
      '/sites/' +
      config.SharepointSiteId +
      '/lists/' +
      config.ConsultationListId +
      '/items?$expand=fields&$top=999&$select=id,fields';

    let hasFilter = false;
    if (fromDate) {
      path += "&$filter=fields/Startdate ge '";
      path += format(new Date(fromDate), 'yyyy-MM-dd') + "'";
      hasFilter = true;
    }

    const ecConsultationFilter =
      "(fields/IsECConsultation eq 'Eionet-only' or fields/IsECConsultation eq 'Eionet-and-EC' or fields/IsECConsultation eq 'N/A')";
    if (hasFilter) {
      path += ' and ';
    } else {
      path += '&$filter=';
    }

    path += ecConsultationFilter;

    const response = await apiGet(path),
      consultations = await response.graphClientMessage;

    const currentDate = new Date(new Date().toDateString());

    const itemLinkOperator = config.ConsultationListItemUrl.includes('?') ? '&' : '?';
    return consultations.value.map(function (consultation) {
      const fields = consultation.fields,
        respondants = fields.Respondants || [],
        hasUserCountryResponded = userCountry && respondants.includes(userCountry);

      return {
        id: fields.id,

        Title: fields.Title,
        ConsultationType: fields.ConsultationType,
        Description: fields.Description,

        Startdate: new Date(fields.Startdate),
        Closed: new Date(fields.Closed),
        Deadline: new Date(fields.Deadline),
        Year: parseInt(fields.Year.replace(',', '')),
        DaysLeft: differenceInDays(new Date(fields.Closed), currentDate),
        DaysFinalised: differenceInDays(new Date(fields.Deadline), currentDate),

        Linktofolder: fields.LinktoFolder,
        Respondants: respondants,
        HasUserCountryResponded: hasUserCountryResponded,
        Countries: fields.Countries,

        ConsulationmanagerLookupId: fields.ConsulationmanagerLookupId,
        EionetGroups: fields.EionetGroups,
        LinkToResults: fields.LinkToResults,
        ItemLink:
          config.ConsultationListItemUrl +
          itemLinkOperator +
          'FilterField1=ID&FilterValue1=' +
          fields.id,
      };
    });
  } catch (err) {
    console.log(err);
    return [];
  }
}

export async function getMeetings(fromDate, country, userInfo) {
  const config = await getConfiguration();
  try {
    let path =
      '/sites/' +
      config.SharepointSiteId +
      '/lists/' +
      config.MeetingListId +
      '/items?$expand=fields&$top=999&$select=id,fields';

    if (fromDate) {
      path += "&$filter=fields/Meetingstart ge '";
      path += format(new Date(fromDate), 'yyyy-MM-dd') + "'";
    }

    const response = await apiGet(path),
      meetings = response.graphClientMessage.value,
      allParticipants = await getParticipants(undefined, country),
      itemLinkOperator = config.EventListItemUrl.includes('?') ? '&' : '?';

    return await Promise.all(
      meetings.map(async (meeting) => {
        const fields = meeting.fields,
          meetingId = fields.id,
          participants = allParticipants.filter((p) => p.MeetingId == meetingId),
          participantsCount = participants.filter((p) => {
            return p.Participated;
          }).length,
          registerCount = participants.filter((p) => {
            return p.Registered;
          }).length;

        const currentDate = new Date(),
          meetingStart = new Date(fields.Meetingstart),
          meetingEnd = new Date(fields.Meetingend),
          meetingTitle = fields.Title,
          isPast = meetingEnd < currentDate;

        const countryFilterSuffix = country
          ? '&FilterField2=Countries&FilterValue2=' + country
          : '';
        const meetingFilterSuffix =
          '?FilterField1=Meetingtitle&FilterType1=Lookup&FilterValue1=' +
          encodeURIComponent(meetingTitle);

        let currentParticipant =
          participants && participants.length && participants.find((p) => p.Email == userInfo.mail);

        const allowVote =
            userInfo.country &&
            currentParticipant &&
            !currentParticipant.Voted &&
            (currentParticipant.Registered || currentParticipant.Participated) &&
            meetingStart <= currentDate &&
            currentDate <= addDays(meetingStart, config.NoOfDaysForRating),
          isOnline = !!(fields.MeetingType?.toLowerCase() == 'online');

        return {
          id: meetingId,

          Title: meetingTitle,
          MeetingLink: fields.MeetingLink,
          MeetingRegistrationLink: fields.MeetingRegistrationLink,
          Group: fields.Group,

          MeetingStart: new Date(fields.Meetingstart),
          MeetingEnd: new Date(fields.Meetingend),
          MeetingType: fields.MeetingType,
          EventCategory: fields.EventCategory,

          Year: parseInt(fields.Year.replace(',', '')),
          Linktofolder: fields.Linktofolder,

          NoOfParticipants: country ? participantsCount : fields.NoOfParticipants,
          ParticipantsUrl: `${config.MeetingParticipantsListUrl}${meetingFilterSuffix}${countryFilterSuffix}`,
          NoOfRegistered: country ? registerCount : fields.NoOfRegistered,
          RegisteredUrl: `${config.MeetingParticipantsListUrl}${meetingFilterSuffix}${countryFilterSuffix}&FilterField3=Registered&FilterValue3=1&FilterType3=Boolean`,
          Participants: participants,

          IsCurrent: meetingStart <= new Date() && meetingEnd >= new Date(),
          IsUpcoming: meetingStart > new Date(),
          IsPast: isPast,

          IsOnline: isOnline,
          IsOnlineOrHybrid: !!(fields.MeetingType?.toLowerCase() != 'physical'),
          IsOffline: !isOnline,

          CustomMeetingRequest: fields.CustomMeetingRequests,
          Countries: fields.Countries,

          HasRegistered: !!currentParticipant?.Registered,
          HasVoted: !!currentParticipant?.Voted,
          AllowVote: allowVote,

          ItemLink:
            config.EventListItemUrl +
            itemLinkOperator +
            'FilterField1=ID&FilterValue1=' +
            fields.id,
        };
      }),
    );
  } catch (err) {
    console.log(err);
    return [];
  }
}

export async function getParticipants(meetingId, country) {
  if (!meetingId && !country) {
    return [];
  }

  let hasFilter = false;
  const config = await getConfiguration();
  try {
    let path =
      '/sites/' +
      config.SharepointSiteId +
      '/lists/' +
      config.MeetingParticipantsListId +
      '/items?$expand=fields&$top=999&$select=id,fields';

    if (meetingId) {
      path += '&$filter=fields/MeetingtitleLookupId eq ';
      path += meetingId;
      hasFilter = true;
    }

    if (country) {
      path += hasFilter ? 'and ' : '&$filter=';
      path += "fields/Countries eq '";
      path += country;
      path += "'";
    }

    let result = [];
    while (path) {
      const response = await apiGet(path),
        participants = response.graphClientMessage;

      if (participants && participants.value) {
        participants.value.forEach((p) => {
          result.push({
            id: p.fields.id,
            MeetingId: p.fields.MeetingtitleLookupId,
            ParticipantName: p.fields.Participantname,
            Email: p.fields.EMail,
            Country: p.fields.Countries,
            Registered: p.fields.Registered,
            Participated: p.fields.Participated,
            PhysicalParticipation: p.fields.PhysicalParticipation,
            EEAReimbursementRequested: p.fields.EEAReimbursementRequested,
            CustomMeetingRequest: p.fields.CustomMeetingRequest,
            NFPApproved: p.fields.NFPApproved,
            Voted: p.fields.Voted,
            IsInvitedByNFP: p.fields.IsInvitedByNFP,
          });
        });
      }

      path = participants['@odata.nextLink'];
    }

    return result;
  } catch (err) {
    console.log(err);
    return [];
  }
}

export async function getCurrentParticipant(event, userInfo) {
  event.Participants = await getParticipants(event.id, userInfo.country);
  let participant =
    event.Participants &&
    event.Participants.length &&
    event.Participants.find((p) => p.Email == userInfo.mail);

  if (!participant) {
    participant = {
      MeetingId: event.id,
      ParticipantName: userInfo.givenName + ' ' + userInfo.surname,
      Email: userInfo.mail,
      Country: userInfo.country,
      Registered: false,
      Participated: false,
      PhysicalParticipation: false,
      EEAReimbursementRequested: false,
      IsInvitedByNFP: false,
    };
  }
  return participant;
}

export async function getInvitedUsers(country) {
  const config = await getConfiguration();
  try {
    let path =
      '/sites/' +
      config.SharepointSiteId +
      '/lists/' +
      config.UserListId +
      '/items?$expand=fields&$top=999&$select=id,fields';
    if (country) {
      path += "&$filter=fields/Country eq '" + country + "'";
    }

    let result = [];
    const organisations = await getOrganisationList();

    while (path) {
      const response = await apiGet(path),
        users = await response.graphClientMessage;

      users.value.forEach(function (user) {
        let organisation = organisations.find(
          (o) => o.content === user.fields.OrganisationLookupId,
        );

        //concatenate memberships, otherMemberships and NFP in one field to display in grid
        let memberships = (user.fields.Membership || []).concat(user.fields.OtherMemberships || []);
        user.fields.NFP && memberships.push(user.fields.NFP);

        result.push({
          Title: user.fields.Title,
          Email: user.fields.Email,
          Membership: user.fields.Membership,
          AllMemberships: memberships,
          OtherMemberships: user.fields.OtherMemberships,
          OtherMembershipsString:
            user.fields.OtherMemberships && user.fields.OtherMemberships.toString(),
          Country: user.fields.Country,
          OrganisationLookupId: user.fields.OrganisationLookupId,
          Organisation: organisation?.header,
          ADUserId: user.fields.ADUserId,
          NFP: user.fields.NFP,
          SignedIn: user.fields.SignedIn,
          Department: user.fields.Department,
          JobTitle: user.fields.JobTitle,
          PCP: user.fields.PCP,
          id: user.fields.id,
        });
      });

      path = users['@odata.nextLink'];
    }
    return result;
  } catch (err) {
    console.log(err);
    return [];
  }
}

export function getGroups(users, removeWorkingGroups = false) {
  let groups = [];

  if (users?.length) {
    users.forEach((user) => {
      groups = groups.concat(user.Membership);
    });
  }

  if (removeWorkingGroups) {
    groups = groups.filter(
      (gr) => gr && !gr.toLowerCase().startsWith(Constants.WorkingGroupPrefix),
    );
  }
  return [...new Set(groups)];
}

export async function getPublications() {
  const config = await getConfiguration();
  try {
    let path =
      '/sites/' +
      config.CommunicationSiteId +
      '/lists/' +
      config.PublicationListId +
      '/items?$expand=fields&$top=999&$select=id,fields';

    let result = [];
    const currentDate = new Date(new Date().toDateString());

    while (path) {
      const response = await apiGet(path),
        publications = response.graphClientMessage;

      if (publications?.value) {
        publications.value.forEach((p) => {
          const outDate = p.fields.Date_x0028_outpublic_x0029_;
          //ignore publications without date.
          if (outDate) {
            const publicationDate = new Date(outDate);
            result.push({
              id: p.fields.id,
              Title: p.fields.Title,
              ItemType: p.fields.Item_x0020_type,
              ExtraCommsProducts: p.fields.Extra_x0020_comms_x0020_products,
              Status: p.fields.Status,
              Date: publicationDate,
              Link: p.fields.Link?.Url,
              IsPast: publicationDate < currentDate,
            });
          }
        });
      }

      path = publications['@odata.nextLink'];
    }

    return result;
  } catch (err) {
    console.log(err);
    return [];
  }
}

export async function getObligations() {
  const config = await getConfiguration();
  try {
    let path =
      '/sites/' +
      config.SharepointSiteId +
      '/lists/' +
      config.ObligationsListId +
      '/items?$expand=fields&$top=999&$select=id,fields&$filter=fields/IsTerminated eq 0 and fields/IsFlagged eq 1';

    let result = [];

    while (path) {
      const response = await apiGet(path),
        obligations = response.graphClientMessage;

      if (obligations?.value) {
        obligations.value.forEach((o) => {
          const currentDate = new Date(new Date().toDateString()),
            deadline = o.fields.Deadline && new Date(o.fields.Deadline),
            isContinuous = !o.fields.ReportingFrequencyMonths && !deadline,
            isUpcoming = deadline && deadline >= currentDate;

          result.push({
            id: o.fields.id,
            Title: o.fields.Title,
            Url: o.fields.Url,
            Instrument: o.fields.Instrument,
            InstrumentUrl: o.fields.InstrumentUrl,
            ReportTo: o.fields.ReportTo,
            ReportToUrl: o.fields.ReportToUrl,
            ...(deadline && { Deadline: deadline }),
            IsEEACore: o.fields.IsEEACore,
            IsContinuous: isContinuous,
            IsUpcoming: isUpcoming,
          });
        });
      }

      path = obligations['@odata.nextLink'];
    }

    return result;
  } catch (err) {
    console.log(err);
    return [];
  }
}

export async function postParticipant(participant, event) {
  const config = await getConfiguration(),
    externalUser = participant.IsInvitedByNFP,
    graphURL =
      '/sites/' + config.SharepointSiteId + '/lists/' + config.MeetingParticipantsListId + '/items';

  const participantData = {
    fields: {
      MeetingtitleLookupId: participant.MeetingId,
      Participantname: participant.ParticipantName,
      EMail: participant.Email,
      Countries: participant.Country,
      Registered: participant.Registered,
      Participated: participant.Participated,
      RegistrationDate: participant.RegistrationDate,
      PhysicalParticipation: participant.PhysicalParticipation,
      EEAReimbursementRequested: participant.EEAReimbursementRequested,
      CustomMeetingRequest: participant.CustomMeetingRequest,
      ...(participant.NFPApproved && { NFPApproved: participant.NFPApproved }),
      IsInvitedByNFP: participant.IsInvitedByNFP ?? false,
    },
  };

  try {
    const response = await apiPost(graphURL, participantData),
      notificationBody = externalUser
        ? getExternalNotificationBody(config, event)
        : getNotificationBody(config, event, false);

    await sendEmail(
      externalUser
        ? getExternalNotificationSubject(config, event)
        : getNotificationSubject(config, event, false),
      notificationBody,
      [participant.Email],
      event.IsOnline
        ? createIcs(event, config.FromEmailAddress, notificationBody, participant)
        : undefined,
    );
    !externalUser && (await sentNFPNotification(participant, event));
    return response?.graphClientMessage;
  } catch (err) {
    return false;
  }
}

export async function patchParticipants(participants, event) {
  for (const participant of participants) {
    participant.changed && (await patchParticipant(participant, event, true));
    participant.changed = false;
  }
}

export async function patchParticipant(participant, event, approvalChanged) {
  const config = await getConfiguration(),
    graphURL =
      '/sites/' +
      config.SharepointSiteId +
      '/lists/' +
      config.MeetingParticipantsListId +
      '/items/' +
      participant.id;

  const participantData = {
    fields: {
      Registered: participant.Registered,
      Participated: participant.Participated,
      PhysicalParticipation: participant.PhysicalParticipation,
      EEAReimbursementRequested: participant.EEAReimbursementRequested,
      CustomMeetingRequest: participant.CustomMeetingRequest,
      NFPApproved: participant.NFPApproved,
    },
  };

  try {
    await apiPatch(graphURL, participantData);

    if (approvalChanged) {
      if (participant.NFPApproved && participant.NFPApproved != 'No value') {
        const isApproved = participant.NFPApproved == 'Approved',
          bodyPropperty =
            'Reg' +
            (event.MeetingType == 'Online' ? 'Online' : 'Offline') +
            (isApproved ? 'NFPAccepts' : 'NFPDeclines'),
          body = replacePlaceholders(config[bodyPropperty], event),
          attachment = isApproved
            ? createIcs(event, config.FromEmailAddress, body, participant)
            : undefined;
        await sendEmail(
          getNotificationSubject(config, event, false),
          body,
          [participant.Email],
          attachment,
        );
      }
    } else {
      await sendEmail(
        getNotificationSubject(config, event, false),
        getNotificationBody(config, event, false),
        [participant.Email],
      );
      await sentNFPNotification(participant, event);
    }

    return true;
  } catch (err) {
    await logError(err);
    return false;
  }
}

function getNotificationSubject(config, event, forNFP) {
  let emailSubjectProperty = `Reg${event.IsOnlineOrHybrid ? 'Online' : 'Offline'}EmailSubject`;

  const suffix = forNFP ? 'NFP' : 'User';
  emailSubjectProperty += suffix;
  return config[emailSubjectProperty]?.replaceAll(MEETING_TITLE_PLACEHOLDER, event.Title);
}

function getNotificationBody(config, event, forNFP) {
  let emailBodyProperty = `Reg${event.IsOnlineOrHybrid ? 'Online' : 'Offline'}EmailBody`;

  const suffix = forNFP ? 'NFP' : 'User';
  emailBodyProperty += suffix;
  return replacePlaceholders(config[emailBodyProperty], event);
}

function getExternalNotificationSubject(config, event) {
  const subject = config[`Invite${event.IsOnlineOrHybrid ? 'Online' : 'Offline'}EmailSubject`];
  return subject?.replaceAll(MEETING_TITLE_PLACEHOLDER, event.Title);
}

function getExternalNotificationBody(config, event) {
  return replacePlaceholders(
    config[`Invite${event.IsOnlineOrHybrid ? 'Online' : 'Offline'}EmailBody`],
    event,
  );
}

function replacePlaceholders(property, event) {
  if (property) {
    property = property.replaceAll(MEETING_TITLE_PLACEHOLDER, event.Title);
    property = property.replaceAll(MEETING_JOIN_URL_PLACEHOLDER, event.MeetingLink || '');
  }

  return property;
}

async function sentNFPNotification(participant, event) {
  if (participant?.Country) {
    const config = await getConfiguration(),
      users = await getInvitedUsers(participant.Country);

    const nfpUsers = users.filter((u) => !!u.NFP);
    if (nfpUsers?.length) {
      await sendEmail(
        getNotificationSubject(config, event, true),
        getNotificationBody(config, event, true),
        nfpUsers.map((u) => u.Email) || [],
      );
    } else {
      await logError(
        'No NFP found to notify for the user with email ' + participant.Email,
        '',
        participant,
      );
    }
  } else {
    await logError(
      'The NFP couldn’t be notified for the user with email ' +
        participant.Email +
        ' because the user does not have a country specified.',
      '',
      participant,
    );
  }
}

export async function deleteParticipant(participant) {
  const config = await getConfiguration(),
    graphURL =
      '/sites/' +
      config.SharepointSiteId +
      '/lists/' +
      config.MeetingParticipantsListId +
      '/items/' +
      participant.id;
  try {
    const response = await apiDelete(graphURL);
    return response?.graphClientMessage;
  } catch (err) {
    return false;
  }
}

const meetingManagers = {};
export async function getMeetingManager(lookupId) {
  if (lookupId) {
    if (!meetingManagers[lookupId]) {
      const user = await getADUser(lookupId);
      if (user?.id) {
        meetingManagers[lookupId] = user.id;
      }
    }
    return meetingManagers[lookupId];
  }
}

export async function getADUserInfos(lookupIds) {
  return await Promise.all(
    lookupIds.map(async (lookupId) => {
      try {
        const userInfo = await getADUser(lookupId);
        if (userInfo?.id) {
          const userId = userInfo.id;
          userInfo.lookupId = lookupId;
          try {
            const response = await apiGet('/users/' + userId + '/photos/48x48/$value', 'app', true);
            userInfo.base64Photo = response?.graphClientMessage;
          } catch (error) {
            console.log(error);
          }

          return userInfo;
        }
      } catch (error) {
        console.log(error);
        return undefined;
      }
    }),
  );
}

export async function getADUser(lookupId) {
  if (lookupId) {
    const config = await getConfiguration();
    try {
      let path =
        '/sites/' + config.SharepointSiteId + '/lists/User Information List/items/' + lookupId;

      const response = await apiGet(path);
      if (response.graphClientMessage) {
        const userInfo = response.graphClientMessage.fields;

        const adResponse = await apiGet(
          "/users/?$filter=mail eq '" + userInfo.EMail?.replace("'", "''") + "'",
        );
        return adResponse?.graphClientMessage?.value?.length
          ? adResponse?.graphClientMessage?.value[0]
          : undefined;
      }

      return undefined;
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }
}

async function loadRating(eventId) {
  const config = await getConfiguration(),
    ratingGraphURL =
      '/sites/' + config.SharepointSiteId + '/lists/' + config.MeetingRatingListId + '/items',
    response = await apiGet(
      ratingGraphURL + '?$expand=fields&$filter=fields/EventLookupId eq ' + eventId,
    );

  if (response.graphClientMessage?.value?.length) {
    return response.graphClientMessage.value[0];
  }
  return undefined;
}

function buildRatingData(rating, value) {
  return {
    fields: {
      Responses: rating.fields.Responses + 1,
      Rating: (rating.fields.Rating || 0) + value,
    },
  };
}

export async function postRating(event, participant, value) {
  const ratingValue = value === undefined || value === null ? 0 : value;

  const config = await getConfiguration(),
    ratingGraphURL =
      '/sites/' + config.SharepointSiteId + '/lists/' + config.MeetingRatingListId + '/items',
    participantGraphURL =
      '/sites/' +
      config.SharepointSiteId +
      '/lists/' +
      config.MeetingParticipantsListId +
      '/items/' +
      participant.id;

  let success = false,
    existingRating = await loadRating(event.id),
    ratingData;
  if (existingRating) {
    ratingData = buildRatingData(existingRating, ratingValue);
    let retryPatch = true;
    while (retryPatch) {
      try {
        //send eTag to make sure record was not modified. Reload record if modified.
        await apiPatch(ratingGraphURL + '/' + existingRating.id, ratingData, existingRating.eTag);
        retryPatch = false;
        success = true;
      } catch (err) {
        retryPatch = err.response?.status == 412;
        if (retryPatch) {
          existingRating = await loadRating(event.id);
          ratingData = buildRatingData(existingRating, ratingValue);
        }
      }
    }
  } else {
    ratingData = {
      fields: {
        EventLookupId: event.id,
        Responses: 1,
        Rating: ratingValue,
      },
    };
    try {
      await apiPost(ratingGraphURL, ratingData);
      success = true;
    } catch (err) {
      success = false;
    }
  }

  if (success) {
    try {
      await apiPatch(participantGraphURL, {
        fields: {
          Voted: true,
        },
      });

      await logInfo(
        'Event rating',
        '',
        {
          Event: event.Title,
          RatingValue: ratingValue,
        },
        'Rating',
        '',
        true,
      );
    } catch (err) {
      return false;
    }
  }
  return success;
}

let countryMapping;
export async function getCountryCodeMappingsList() {
  const config = await getConfiguration();
  try {
    if (!countryMapping) {
      countryMapping = [];
      const response = await apiGet(
        `/sites/${config.SharepointSiteId}/lists/${config.CountryCodeMappingListId}/items?$expand=fields`,
      );
      countryMapping = response.graphClientMessage.value.map((mapping) => {
        return {
          CountryCode: mapping.fields.Title,
          CountryName: mapping.fields.CountryName,
          CDO: mapping.fields.CDO,
          TeamMember: mapping.fields.TeamMember,
        };
      });
    }
    return countryMapping;
  } catch (err) {
    console.log(err);
    return [];
  }
}
