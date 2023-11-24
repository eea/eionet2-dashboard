import { apiGet, apiPost, apiPatch, getConfiguration, apiDelete, logError } from './apiProvider';
import { format, differenceInDays, addDays } from 'date-fns';
import { sendEmail } from './provider';
import { createIcs } from './icsHelper';

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

let mappingsList = undefined;
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

export async function getConsultations(consultationType, fromDate, userCountry) {
  const config = await getConfiguration();
  try {
    let path =
      '/sites/' +
      config.SharepointSiteId +
      '/lists/' +
      config.ConsultationListId +
      '/items?$expand=fields&$top=999&$select=id,fields';

    if (consultationType) {
      path += "&$filter=fields/ConsultationType eq '";
      path += consultationType + "'";
    }

    if (fromDate) {
      path += "&$filter=fields/Startdate ge '";
      path += format(new Date(fromDate), 'yyyy-MM-dd') + "'";
    }

    const response = await apiGet(path),
      consultations = await response.graphClientMessage;

    const currentDate = new Date(new Date().toDateString());

    const itemLinkOperator = config.ConsultationListItemUrl.includes('?') ? '&' : '?';
    return consultations.value.map(function (consultation) {
      const respondants = consultation.fields.Respondants || [],
        hasUserCountryResponded = userCountry && respondants.includes(userCountry);
      return {
        id: consultation.fields.id,

        Title: consultation.fields.Title,
        ConsultationType: consultation.fields.ConsultationType,
        Description: consultation.fields.Description,

        Startdate: new Date(consultation.fields.Startdate),
        Closed: new Date(consultation.fields.Closed),
        Deadline: new Date(consultation.fields.Deadline),
        Year: new Date(consultation.fields.Startdate).getFullYear(),
        DaysLeft: differenceInDays(new Date(consultation.fields.Closed), currentDate),
        DaysFinalised: differenceInDays(new Date(consultation.fields.Deadline), currentDate),

        Linktofolder: consultation.fields.LinktoFolder,
        Respondants: respondants,
        HasUserCountryResponded: hasUserCountryResponded,
        Countries: consultation.fields.Countries,

        ConsulationmanagerLookupId: consultation.fields.ConsulationmanagerLookupId,
        EionetGroups: consultation.fields.EionetGroups,
        LinkToResults: consultation.fields.LinkToResults,
        ItemLink:
          config.ConsultationListItemUrl +
          itemLinkOperator +
          'FilterField1=ID&FilterValue1=' +
          consultation.fields.id,
      };
    });
  } catch (err) {
    console.log(err);
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
      allParticipants = await getParticipants(undefined, country);

    return await Promise.all(
      meetings.map(async (meeting) => {
        const meetingId = meeting.fields.id,
          participants = allParticipants.filter((p) => p.MeetingId == meetingId),
          participantsCount = participants.filter((p) => {
            return p.Participated;
          }).length,
          registerCount = participants.filter((p) => {
            return p.Registered;
          }).length;

        const currentDate = new Date(),
          meetingStart = new Date(meeting.fields.Meetingstart),
          meetingEnd = new Date(meeting.fields.Meetingend),
          meetingTitle = meeting.fields.Title,
          isPast = meetingEnd < currentDate;

        const countryFilterSuffix = country
          ? '&FilterField3=Countries&FilterValue3=' + country
          : '';
        const meetingFilterSuffix =
          '?FilterField1=Meetingtitle&FilterType1=Lookup&FilterValue1=' + meetingTitle;

        let currentParticipant =
          participants && participants.length && participants.find((p) => p.Email == userInfo.mail);

        const allowVote =
          userInfo.country &&
          currentParticipant &&
          !currentParticipant.Voted &&
          (currentParticipant.Registered || currentParticipant.Participated) &&
          meetingStart <= currentDate &&
          currentDate <= addDays(meetingStart, config.NoOfDaysForRating);

        return {
          id: meetingId,

          Title: meetingTitle,
          MeetingLink: meeting.fields.MeetingLink,
          MeetingRegistrationLink: meeting.fields.MeetingRegistrationLink,
          Group: meeting.fields.Group,

          MeetingStart: new Date(meeting.fields.Meetingstart),
          MeetingEnd: new Date(meeting.fields.Meetingend),
          MeetingType: meeting.fields.MeetingType,

          Year: meetingStart.getFullYear(),
          Linktofolder: meeting.fields.Linktofolder,

          NoOfParticipants: country ? participantsCount : meeting.fields.NoOfParticipants,
          ParticipantsUrl:
            config.MeetingParticipantsListUrl +
            meetingFilterSuffix +
            '&FilterField2=Participated&FilterValue2=1&FilterType2=Boolean' +
            countryFilterSuffix,
          NoOfRegistered: country ? registerCount : meeting.fields.NoOfRegistered,
          RegisteredUrl:
            config.MeetingParticipantsListUrl +
            meetingFilterSuffix +
            '&FilterField2=Registered&FilterValue2=1&FilterType2=Boolean' +
            countryFilterSuffix,
          Participants: participants,

          IsCurrent: meetingStart <= new Date() && meetingEnd >= new Date(),
          IsUpcoming: meetingStart > new Date(),
          IsPast: isPast,

          IsOnline: meeting.fields.MeetingType && meeting.fields.MeetingType == 'Online',
          IsOffline: meeting.fields.MeetingType && meeting.fields.MeetingType != 'Online',

          CustomMeetingRequest: meeting.fields.CustomMeetingRequests,

          HasRegistered: !!(currentParticipant && currentParticipant.Registered),
          HasVoted: !!(currentParticipant && currentParticipant.Voted),
          AllowVote: allowVote,
        };
      }),
    );
  } catch (err) {
    console.log(err);
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
          });
        });
      }

      path = participants['@odata.nextLink'];
    }

    return result;
  } catch (err) {
    console.log(err);
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

export function getGroups(users) {
  let groups = [];

  if (users && users.length) {
    users.forEach((user) => {
      groups = groups.concat(user.Membership);
    });
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

      if (publications && publications.value) {
        publications.value.forEach((p) => {
          const publicationDate = new Date(p.fields.Date_x0028_outpublic_x0029_);
          result.push({
            id: p.fields.id,
            Title: p.fields.Title,
            ItemType: p.fields.Item_x0020_type,
            ExtraCommsProducts: p.fields.Extra_x0020_comms_x0020_products,
            Status: p.fields.Status,
            Date: publicationDate,
            IsPast: publicationDate < currentDate,
          });
        });
      }

      path = publications['@odata.nextLink'];
    }

    return result;
  } catch (err) {
    console.log(err);
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

      if (obligations && obligations.value) {
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
  }
}

export async function postParticipant(participant, event) {
  const config = await getConfiguration(),
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
    },
  };

  try {
    const response = await apiPost(graphURL, participantData);

    await sendEmail(
      getNotificationSubject(config, event, false),
      getNotificationBody(config, event, false),
      [participant.Email],
      event.IsOnline ? createIcs(event) : undefined,
    );
    await sentNFPNotification(participant, event);
    return response?.graphClientMessage;
  } catch (err) {
    return false;
  }
}

export async function patchParticipants(participants, event) {
  for (const participant of participants) {
    participant.NFPApprovalChanged && (await patchParticipant(participant, event, true));
    participant.NFPApprovalChanged = false;
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
          attachment = isApproved ? createIcs(event) : undefined;
        await sendEmail(
          getNotificationSubject(config, event, false),
          replacePlaceholders(config[bodyPropperty], event),
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
  const propName = event.MeetingType == 'Online' ? 'Online' : 'Offline';
  let emailSubjectProperty = 'Reg' + propName + 'EmailSubject';

  forNFP ? (emailSubjectProperty += 'NFP') : (emailSubjectProperty += 'User');
  let subject = config[emailSubjectProperty];
  return subject && subject.replaceAll(MEETING_TITLE_PLACEHOLDER, event.Title);
}

function getNotificationBody(config, event, forNFP) {
  const propName = event.MeetingType == 'Online' ? 'Online' : 'Offline';
  let emailBodyProperty = 'Reg' + propName + 'EmailBody';

  forNFP ? (emailBodyProperty += 'NFP') : (emailBodyProperty += 'User');
  return replacePlaceholders(config[emailBodyProperty], event);
}

function replacePlaceholders(property, event) {
  if (property) {
    property = property.replaceAll(MEETING_TITLE_PLACEHOLDER, event.Title);
    property = property.replaceAll(MEETING_JOIN_URL_PLACEHOLDER, event.MeetingLink || '');
  }

  //event.MeetingJoinContent && (property += event.MeetingJoinContent);
  return property;
}

async function sentNFPNotification(participant, event) {
  if (participant && participant.Country) {
    const config = await getConfiguration(),
      users = await getInvitedUsers(participant.Country);

    const nfpUsers = users.filter((u) => !!u.NFP);
    if (nfpUsers && nfpUsers.length) {
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
      const user = getADUser(lookupId);
      if (user && user.id) {
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
        if (userInfo && userInfo.id) {
          const userId = userInfo.id;
          userInfo.lookupId = lookupId;
          try {
            const response = await apiGet('/users/' + userId + '/photos/64x64/$value', 'app', true);
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
        return adResponse?.graphClientMessage?.value.length
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

  if (response.graphClientMessage && response.graphClientMessage.value.length) {
    return response.graphClientMessage.value[0];
  }
  return undefined;
}

function buildRatingData(rating, value) {
  return {
    fields: {
      Responses: rating.fields.Responses + 1,
      Rating: rating.fields.Rating + value,
    },
  };
}

export async function postRating(event, participant, value) {
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
    existingRating = await loadRating(event.id);
  if (existingRating) {
    let ratingData = buildRatingData(existingRating, value);
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
          ratingData = buildRatingData(existingRating, value);
        }
      }
    }
  } else {
    const ratingData = {
      fields: {
        EventLookupId: event.id,
        Responses: 1,
        Rating: value,
      },
    };
    try {
      await apiPost(ratingGraphURL, ratingData);
      success = true;
    } catch (err) {
      //await logError(err);
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
    } catch (err) {
      return false;
    }
  }
  return success;
}
