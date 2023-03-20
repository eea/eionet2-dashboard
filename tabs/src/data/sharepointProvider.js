import { apiGet, apiPost, apiPatch, getConfiguration, apiDelete } from './apiProvider';
import { format, differenceInDays } from 'date-fns';

function wrapError(err, message) {
  return {
    Message: message,
    Error: err,
    Success: false,
  };
}

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
      '/items?$expand=fields&$top=999';

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
      '/items?$expand=fields&$top=999';

    if (fromDate) {
      path += "&$filter=fields/Meetingstart ge '";
      path += format(new Date(fromDate), 'yyyy-MM-dd') + "'";
    }

    const response = await apiGet(path),
      meetings = response.graphClientMessage;

    return await Promise.all(
      meetings.value.map(async (meeting) => {
        const meetingId = meeting.fields.id,
          participants = await getParticipants(meetingId, country),
          participantsCount = participants.filter((p) => {
            return p.Participated;
          }).length,
          registerCount = participants.filter((p) => {
            return p.Registered;
          }).length;

        const meetingStart = new Date(meeting.fields.Meetingstart),
          meetingEnd = new Date(meeting.fields.Meetingend),
          meetingTitle = meeting.fields.Title;

        const countryFilterSuffix = country
          ? '&FilterField3=Countries&FilterValue3=' + country
          : '';
        const filterUrlSuffix =
          '&FilterField2=Meetingtitle&FilterType2=Lookup&FilterValue2=' +
          meetingTitle +
          countryFilterSuffix;

        let currentParticipant =
          participants &&
          participants.length &&
          participants.find((p) => p.Email == userInfo.mail && p.Registered);
        return {
          id: meetingId,

          Title: meetingTitle,
          MeetingLink: meeting.fields.Meetinglink,
          MeetingRegistrationLink: meeting.fields.MeetingRegistrationLink,
          Group: meeting.fields.Group,

          MeetingStart: new Date(meeting.fields.Meetingstart),
          MeetingEnd: new Date(meeting.fields.Meetingend),
          MeetingType: !meeting.fields.MeetingType,

          Year: meetingStart.getFullYear(),
          Linktofolder: meeting.fields.Linktofolder,

          NoOfParticipants: participantsCount,
          ParticipantsUrl:
            config.MeetingParticipantsListUrl +
            '?FilterField1=Participated&FilterValue1=1' +
            filterUrlSuffix,
          NoOfRegistered: registerCount,
          RegisteredUrl:
            config.MeetingParticipantsListUrl +
            '?FilterField1=Registered&FilterValue1=1' +
            filterUrlSuffix,
          Participants: participants,

          IsCurrent: meetingStart <= new Date() && meetingEnd >= new Date(),
          IsUpcoming: meetingStart > new Date(),
          IsPast: meetingEnd < new Date(),

          IsOnline: meeting.fields.MeetingType && meeting.fields.MeetingType == 'Online',
          IsOffline: meeting.fields.MeetingType && meeting.fields.MeetingType != 'Online',

          HasRegistered: !!currentParticipant,
        };
      }),
    );
  } catch (err) {
    console.log(err);
  }
}

export async function getParticipants(meetingId, country) {
  const config = await getConfiguration();
  try {
    let path =
      '/sites/' +
      config.SharepointSiteId +
      '/lists/' +
      config.MeetingParticipantsListId +
      '/items?$expand=fields&$filter=fields/MeetingtitleLookupId eq ' +
      meetingId;

    if (country) {
      path += "and fields/Countries eq '";
      path += country;
      path += "'";
    }

    const response = await apiGet(path),
      participants = response.graphClientMessage;

    if (participants && participants.value) {
      return participants.value.map((p) => {
        return {
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
        };
      });
    }

    return [];
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
      users = response.graphClientMessage,
      organisations = await getOrganisationList();

    return users.value.map(function (user) {
      const organisation = organisations.find(
        (o) => o.content === user.fields.OrganisationLookupId,
      );
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
        Organisation: organisation?.header,
        ADUserId: user.fields.ADUserId,
        NFP: user.fields.NFP,
        SignedIn: user.fields.SignedIn,
        id: user.fields.id,
      };
    });
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

  const propName = event.MeetingType == 'Online' ? 'Online' : 'Offline';

  const emailSubjectProperty = 'Reg' + propName + 'EmailSubject',
    emailBodyProperty = 'Reg' + propName + 'EmailBody';
  try {
    const response = await apiPost(graphURL, participantData);
    const users = await getInvitedUsers(participant.Country);

    await sendEmail(
      config[emailSubjectProperty + 'NFP'],
      config[emailBodyProperty + 'NFP'],
      users.filter((u) => !!u.NFP).map((u) => u.Email) || [],
    );
    await sendEmail(config[emailSubjectProperty + 'User'], config[emailBodyProperty + 'User'], [
      participant.Email,
    ]);
    return response?.graphClientMessage;
  } catch (err) {
    return false;
  }
}

export async function patchParticipant(participant, event, approvalStatus) {
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

  const propName = event.MeetingType == 'Online' ? 'Online' : 'Offline';

  const emailSubjectProperty = 'Reg' + propName + 'EmailSubject',
    emailBodyProperty = 'Reg' + propName + 'EmailBody';
  try {
    await apiPatch(graphURL, participantData);
    const users = await getInvitedUsers(participant.Country);

    await sendEmail(
      config[emailSubjectProperty + 'NFP'],
      config[emailBodyProperty + 'NFP'],
      users.filter((u) => !!u.NFP).map((u) => u.Email) || [],
    );
    await sendEmail(config[emailSubjectProperty + 'User'], config[emailBodyProperty + 'User'], [
      participant.Email,
    ]);

    if (approvalStatus) {
      const isApproved = participant.NFPApproved == 'Approved',
        bodyPropperty = 'Reg' + propName + (isApproved ? 'NFPAccepts' : 'NFPDeclines');
      await sendEmail(config[emailSubjectProperty + 'NFP'], config[bodyPropperty], [
        participant.Email,
      ]);
    }
    return true;
  } catch (err) {
    return false;
  }
}

export async function patchParticipants(participants, event) {
  for (const participant of participants) {
    participant.NFPApprovalChanged && (await patchParticipant(participant, event, true));
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

async function sendEmail(subject, text, emails) {
  const config = await getConfiguration();

  if (subject && text && emails.length) {
    const recipients = emails.map((email) => {
      return {
        emailAddress: {
          address: email,
        },
      };
    });

    await apiPost('users/' + config.FromEmailAddress + '/sendMail', {
      message: {
        subject: subject,
        body: {
          contentType: 'Text',
          content: text,
        },
        toRecipients: recipients,
      },
      saveToSentItems: true,
    });
  }
}
