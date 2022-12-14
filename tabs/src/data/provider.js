import { apiGet, apiPost, apiPatch, apiDelete, getConfiguration, logInfo } from './apiProvider';
import { getMappingsList, getSPUserByMail } from './sharepointProvider';
import messages from './messages.json';

function wrapError(err, message) {
  return {
    Message: message,
    Error: err,
    Success: false,
  };
}

var _profile = undefined;
export async function getMe() {
  if (!_profile) {
    const config = await getConfiguration(),
      response = await apiGet('me?$select=id,displayName,mail,mobilePhone,country', 'user'),
      groups = await apiGet('me/memberOf', 'user');

    const profile = response.graphClientMessage;
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

export async function getUserGroups(userId) {
  try {
    const response = await apiGet('/users/' + userId + '/memberOf'),
      mappings = await getMappingsList();
    let value = response.graphClientMessage ? response.graphClientMessage.value : [];
    return value
      .filter((v) => {
        return !mappings.some((m) => {
          return m.O365GroupId === v.id;
        });
      })
      .map(function (e) {
        return e.displayName;
      })
      .join(', ');
  } catch (err) {
    console.log(err);
    return undefined;
  }
}

async function addTag(teamId, name, userId) {
  var response = await apiGet('/teams/' + teamId + "/tags?$filter=displayName eq '" + name + "'");

  if (response.graphClientMessage.value && response.graphClientMessage.value.length) {
    let existingTag = response.graphClientMessage.value[0],
      tagMemberIdResponse = await apiGet(
        '/teams/' +
          teamId +
          '/tags/' +
          existingTag.id +
          "/members?$filter=userId eq '" +
          userId +
          "'",
      );

    if (
      !tagMemberIdResponse.graphClientMessage.value ||
      !tagMemberIdResponse.graphClientMessage.value.length
    ) {
      await apiPost('/teams/' + teamId + '/tags/' + existingTag.id + '/members', {
        userId: userId,
      });
    }
  } else {
    await apiPost('/teams/' + teamId + '/tags', {
      displayName: name,
      members: [
        {
          userId: userId,
        },
      ],
    });
  }
}

async function removeTag(teamId, name, userId) {
  const response = await apiGet('/teams/' + teamId + "/tags?$filter=displayName eq '" + name + "'");

  if (response.graphClientMessage.value && response.graphClientMessage.value.length) {
    let existingTag = response.graphClientMessage.value[0],
      tagMemberIdResponse = await apiGet(
        '/teams/' +
          teamId +
          '/tags/' +
          existingTag.id +
          "/members?$filter=userId eq '" +
          userId +
          "'",
      );

    if (
      tagMemberIdResponse.graphClientMessage.value &&
      tagMemberIdResponse.graphClientMessage.value.length
    ) {
      let tagMemberId = tagMemberIdResponse.graphClientMessage.value[0].id;
      await apiDelete('/teams/' + teamId + '/tags/' + existingTag.id + '/members/' + tagMemberId);
    }
  }
}

async function saveADUser(userId, userData) {
  let displayName = userData.FirstName + ' ' + userData.LastName + ' (' + userData.Country + ')';
  if (userData.NFP) {
    displayName = userData.FirstName + ' ' + userData.LastName + ' (NFP-' + userData.Country + ')';
  }
  await apiPatch('/users/' + userId, {
    givenName: userData.FirstName,
    surname: userData.LastName,
    displayName: displayName,
    department: 'Eionet',
    country: userData.Country,
  });
}

async function sendOrgSuggestionNotification(info) {
  const config = await getConfiguration();
  if (config.HelpdeskEmail) {
    try {
      await apiPost('users/' + config.FromEmailAddress + '/sendMail', {
        message: {
          subject: config.NewOrganisationSuggestionSubject,
          body: {
            contentType: 'Text',
            content: config.NewOrganisationSuggestionMailBody + '  ' + info,
          },
          toRecipients: [
            {
              emailAddress: {
                address: config.HelpdeskEmail,
              },
            },
          ],
        },
        saveToSentItems: true,
      });
    } catch (err) {
      console.log(err);
      return false;
    }
  }
}

async function saveSPUser(userId, userData, newYN) {
  const spConfig = await getConfiguration();
  let fields = {
    fields: {
      Phone: userData.Phone,
      Email: userData.Email,
      Country: userData.Country,
      ...(userData.Membership && {
        'Membership@odata.type': 'Collection(Edm.String)',
        Membership: userData.Membership,
      }),
      ...(userData.OtherMemberships && {
        'OtherMemberships@odata.type': 'Collection(Edm.String)',
        OtherMemberships: userData.OtherMemberships,
      }),
      Title: userData.FirstName + ' ' + userData.LastName,
      Gender: userData.Gender,
      Organisation: userData.Organisation,
      OrganisationLookupId: userData.OrganisationLookupId,
      ADUserId: userId,
      NFP: userData.NFP,
      SuggestedOrganisation: userData.SuggestedOrganisation,
    },
  };

  let graphURL = '/sites/' + spConfig.SharepointSiteId + '/lists/' + spConfig.UserListId + '/items';
  if (newYN) {
    await apiPost(graphURL, fields);
  } else {
    graphURL += '/' + userData.id;
    await apiPatch(graphURL, fields);
  }

  if (userData.SuggestedOrganisation) {
    sendOrgSuggestionNotification(userData.SuggestedOrganisation);
  }
}

export async function sendInvitation(user, mappings) {
  try {
    let firstMapping = mappings.find(
        (m) =>
          (user.Membership && user.Membership.includes(m.Membership)) ||
          (user.OtherMemberships && user.OtherMemberships.includes(m.Membership)),
      ),
      config = await getConfiguration();
    let userId = undefined,
      invitationResponse = undefined,
      sendMail = false,
      teamsURLs = '\n';

    if (user.NFP && !firstMapping) {
      firstMapping = mappings.find((m) => m.O365GroupId === config.MainEionetGroupId);
    }

    if (!user.ADProfile) {
      try {
        invitationResponse = await apiPost('/invitations/', {
          invitedUserEmailAddress: user.Email,
          invitedUserDisplayName: user.FirstName + ' ' + user.LastName,
          inviteRedirectUrl: firstMapping.TeamURL,
          sendInvitationMessage: true,
          invitedUserMessageInfo: {
            customizedMessageBody: config.InviteEmailText,
          },
        });
      } catch (err) {
        return wrapError(err, messages.UserInvite.Errors.Invitation);
      }

      try {
        if (invitationResponse && invitationResponse.graphClientMessage.invitedUser) {
          userId = invitationResponse.graphClientMessage.invitedUser.id;
          await saveADUser(userId, user);
        }
      } catch (err) {
        return wrapError(err, messages.UserInvite.Errors.ADUserCreation);
      }
    } else {
      userId = user.ADProfile.id;
      sendMail = true;
    }

    if (userId) {
      try {
        let groupList = [];
        //If NFP save to NFPs groups and Main EIONET group
        if (user.NFP) {
          try {
            await apiPost('/groups/' + config.NFPGroupId + '/members/$ref', {
              '@odata.id': 'https://graph.microsoft.com/beta/directoryObjects/' + userId,
            });

            groupList.push(config.MainEionetGroupId);

            await apiPost('/groups/' + config.MainEionetGroupId + '/members/$ref', {
              '@odata.id': 'https://graph.microsoft.com/beta/directoryObjects/' + userId,
            });
          } catch (err) {
            return wrapError(err, messages.UserInvite.Errors.JoiningTeam);
          }

          try {
            await addTag(config.MainEionetGroupId, 'NFP', userId);
          } catch (err) {
            return wrapError(err, messages.UserInvite.Errors.TagsCreation);
          }
        }

        mappings
          .filter(
            (m) =>
              (user.Membership && user.Membership.includes(m.Membership)) ||
              (user.OtherMemberships && user.OtherMemberships.includes(m.Membership)),
          )
          .forEach(async (mapping) => {
            //Set groups and tags
            try {
              if (!groupList.includes(mapping.O365GroupId)) {
                teamsURLs = teamsURLs + mapping.TeamURL + '\n';
                groupList.push(mapping.O365GroupId);
                setTimeout(
                  await apiPost('/groups/' + mapping.O365GroupId + '/members/$ref', {
                    '@odata.id': 'https://graph.microsoft.com/beta/directoryObjects/' + userId,
                  }),
                  50,
                );
              }
            } catch (err) {
              return wrapError(err, messages.UserInvite.Errors.JoiningTeam);
            }
            try {
              if (mapping.Tag) {
                //TeamId is the same as O365GroupId
                await addTag(mapping.O365GroupId, mapping.Tag, userId);
                await addTag(mapping.O365GroupId, user.Country, userId);
              }
            } catch (err) {
              return wrapError(err, messages.UserInvite.Errors.TagsCreation);
            }
          });

        if (sendMail) {
          try {
            await apiPost('users/' + config.FromEmailAddress + '/sendMail', {
              message: {
                subject: config.AddedToTeamsMailSubject,
                body: {
                  contentType: 'Text',
                  content: config.AddedToTeamsMailBody + teamsURLs,
                },
                toRecipients: [
                  {
                    emailAddress: {
                      address: user.Email,
                    },
                  },
                ],
              },
              saveToSentItems: true,
            });
          } catch (err) {
            return wrapError(err, messages.UserInvite.Errors.Mail);
          }
        }
      } catch (err) {
        console.log(err);
        return false;
      }
      try {
        await saveSPUser(userId, user, true);
      } catch (err) {
        return wrapError(err, messages.UserInvite.Errors.SharepointUser);
      }
    }
    logInfo('Invitation sent for user', '', user, 'Add user');
    return { Success: true };
  } catch (err) {
    return wrapError(err, messages.UserInvite.Errors.Error);
  }
}

export async function editUser(user, mappings, oldValues) {
  try {
    let newMappings = mappings.filter(
        (m) =>
          (user.Membership && user.Membership.includes(m.Membership)) ||
          (user.OtherMemberships && user.OtherMemberships.includes(m.Membership)),
      ),
      oldMappings = mappings.filter(
        (m) =>
          (oldValues.Membership && oldValues.Membership.includes(m.Membership)) ||
          (oldValues.OtherMemberships && oldValues.OtherMemberships.includes(m.Membership)),
      ),
      newGroups = [...new Set(newMappings.map((m) => m.O365GroupId))],
      oldGroups = [...new Set(oldMappings.map((m) => m.O365GroupId))],
      newTags = [...new Set(newMappings.filter((m) => m.Tag))],
      oldTags = [...new Set(oldMappings.filter((m) => m.Tag))],
      config = await getConfiguration();

    newGroups.forEach(async (groupId) => {
      if (!oldGroups.includes(groupId)) {
        setTimeout(
          await apiPost('/groups/' + groupId + '/members/$ref', {
            '@odata.id': 'https://graph.microsoft.com/beta/directoryObjects/' + user.ADUserId,
          }),
          50,
        );

        var groupMapping = mappings.filter((m) => m.O365GroupId === groupId);
        if (groupMapping[0].Tag) addTag(groupId, user.Country, user.ADUserId);
      }
    });

    newTags.forEach((m) => {
      if (!oldTags.includes(m)) {
        addTag(m.O365GroupId, m.Tag, user.ADUserId);
      }
    });

    oldTags.forEach((m) => {
      if (!newTags.includes(m)) {
        removeTag(m.O365GroupId, m.Tag, user.ADUserId);
      }
    });

    oldGroups.forEach(async (groupId) => {
      if (!newGroups.includes(groupId) && !(user.NFP && groupId === config.MainEionetGroupId)) {
        setTimeout(
          await apiDelete('/groups/' + groupId + '/members/' + user.ADUserId + '/$ref'),
          50,
        );
      }
    });

    if (oldValues.Country !== user.Country) {
      newMappings.forEach((m) => {
        if (m.Tag) {
          addTag(m.O365GroupId, user.Country, user.ADUserId);
        }
        removeTag(m.O365GroupId, oldValues.Country, user.ADUserId);
      });
    }

    if (user.NFP && !oldValues.NFP) {
      await apiPost('/groups/' + config.NFPGroupId + '/members/$ref', {
        '@odata.id': 'https://graph.microsoft.com/beta/directoryObjects/' + user.ADUserId,
      });

      if (!newGroups.includes(config.MainEionetGroupId)) {
        await apiPost('/groups/' + config.MainEionetGroupId + '/members/$ref', {
          '@odata.id': 'https://graph.microsoft.com/beta/directoryObjects/' + user.ADUserId,
        });
      }

      try {
        await addTag(config.MainEionetGroupId, 'NFP', user.ADUserId);
      } catch (err) {
        return wrapError(err, messages.UserInvite.Errors.TagsCreation);
      }
    } else if (!user.NFP && oldValues.NFP) {
      await apiDelete('/groups/' + config.NFPGroupId + '/members/' + user.ADUserId + '/$ref');
      if (!newGroups.includes(config.MainEionetGroupId)) {
        await apiDelete(
          '/groups/' + config.MainEionetGroupId + '/members/' + user.ADUserId + '/$ref',
        );
      }
    }

    try {
      await saveADUser(user.ADUserId, user);
    } catch (err) {
      return wrapError(err, messages.UserEdit.Errors.ADUser);
    }

    try {
      await saveSPUser(user.ADUserId, user, false);
    } catch (err) {
      return wrapError(err, messages.UserEdit.Errors.SharepointUser);
    }

    return { Success: true };
  } catch (err) {
    return wrapError(err, messages.UserEdit.Errors.Error);
  }
}

export async function removeUser(user) {
  if (user) {
    const mappings = await getMappingsList(),
      config = await getConfiguration();

    if (user.ADUserId) {
      try {
        let filteredMappings = mappings.filter(
            (m) =>
              (user.Membership && user.Membership.includes(m.Membership)) ||
              (user.OtherMemberships && user.OtherMemberships.includes(m.Membership)),
          ),
          groups = [...new Set(filteredMappings.map((m) => m.O365GroupId))];

        groups.forEach(async (groupId) => {
          setTimeout(
            await apiDelete('/groups/' + groupId + '/members/' + user.ADUserId + '/$ref'),
            50,
          );
        });

        if (user.NFP) {
          await apiDelete('/groups/' + config.NFPGroupId + '/members/' + user.ADUserId + '/$ref');
        }
      } catch (err) {
        return wrapError(err, messages.UserDelete.Errors.Groups);
      }

      const apiPath = '/users/' + user.ADUserId;
      try {
        await apiPatch(apiPath, {
          displayName: user.FirstName + ' ' + user.LastName,
          department: 'Ex-Eionet',
          country: null,
        });
      } catch (err) {
        return wrapError(err, messages.UserDelete.Errors.ADUser);
      }
    }

    try {
      const spConfig = await getConfiguration();
      await apiDelete(
        '/sites/' +
          spConfig.SharepointSiteId +
          '/lists/' +
          spConfig.UserListId +
          '/items/' +
          user.id,
      );
    } catch (err) {
      return wrapError(err, messages.UserDelete.Errors.ADUser);
    }

    logInfo('User removed', '', user, 'Remove user');
    return { Success: true };
  }
  return false;
}
