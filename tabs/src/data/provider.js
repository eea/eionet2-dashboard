import { apiGet, getConfiguration, apiPost, logInfo, logError } from './apiProvider';
import { getSPUserByMail, getADUserId } from './sharepointProvider';

let _profile = undefined;
export async function getMe() {
  if (!_profile) {
    const config = await getConfiguration(),
      response = await apiGet(
        'me?$select=id,displayName,mail,mobilePhone,country,givenName,surname',
        'user',
      ),
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

export async function getMeetingJoinInfo(event) {
  const joinMeetingId =
    event.fields.JoinMeetingId && event.fields.JoinMeetingId.split(' ').join('');
  try {
    if (joinMeetingId) {
      const userId = await getADUserId(event.fields.MeetingmanagerLookupId);
      if (userId) {
        const response = await apiGet(
          '/users/' +
            userId +
            "/onlineMeetings?$filter=joinMeetingIdSettings/JoinMeetingId eq '" +
            joinMeetingId +
            "'",
        );
        if (
          response.graphClientMessage &&
          response.graphClientMessage.value &&
          response.graphClientMessage.value.length > 0
        ) {
          return response.graphClientMessage.value[0];
        }
      }
      return undefined;
    }
  } catch (err) {
    console.log(err);
    return undefined;
  }
}

export async function sendEmail(subject, text, emails, attachment) {
  const config = await getConfiguration();

  if (subject && text && emails.length) {
    const recipients = emails.map((email) => {
      return {
        emailAddress: {
          address: email,
        },
      };
    });

    const attachments = [];
    if (attachment) {
      let buffer = undefined;
      const reader = new FileReader();

      const promise = new Promise((resolve) => {
        reader.onloadend = function () {
          buffer = reader.result;
          resolve();
        };
      });
      reader.readAsDataURL(attachment);
      await promise;

      buffer &&
        attachments.push({
          '@odata.type': '#microsoft.graph.fileAttachment',
          name: 'calendar.ics',
          contentType: 'text/plain',
          contentBytes: buffer.split(',')[1],
        });
    }

    const message = {
        subject: subject,
        body: {
          contentType: 'HTML',
          content: text,
        },
        toRecipients: recipients,
        ...(attachments.length > 0 && { attachments: attachments }),
      },
      apiPath = 'users/' + config.FromEmailAddress + '/sendMail';

    await apiPost(apiPath, {
      message: message,
      saveToSentItems: true,
    });

    if (config.DashboardEmailLoggingEnabled == 'true') {
      await logInfo('Mail sent during registration process', apiPath, message);
    }
  } else {
    await logError('Missing subject, body or recipients!', '', {
      subject: subject,
      body: text,
      recipients: emails,
    });
  }
}
