## Definitions
- WorkingGroup - group where the name starts with the prefix configured in the WorkingGroupPrefix option in Configuration list
- NotApplicableGroup - group with the name 'N/A' (check is not case sensitive). Used for meetings that are not linked to an Eionet group, like the Bureau and the Management Board meetings.


In the following sections are detailed the conditions behind the counters displayed in the At a glance section in the Dashboard.

## Representation section

In this section the information is filtered by country if the country is selected. If not total counts are displayed.

### Members
- Total count of users in the User sharepoint list

- Details link will open the User sharepoint list filtered by country if selected.

### Members pending sing in
- Count of users with SignedIn = false. These users have been invited but have not finalized the sign-in process.

- Details link will open the User sharepoint list filtered by country if selected and by SignedIn = false (0).

### Organisations
- Total count of organisations in the Organisation sharepoint list

- Details link will open the Organisation sharepoint list filtered by country if selected.

### Eionet groups and thematic groups with nominations
- The count of groups with nominations is computed by from the groups that have at least one user in the sharepoint list (signed in or not), excluding WorkingGroups.

- Total number of groups is computed from the choices available in the membership column in the User sharepoint list excluding WorkingGroups.

- The info popup lists the groups in two columns: the groups with nominations and the groups without nominations.

### Working groups with nominations
- The count is computed in the same way, but using only the WorkingGroups: groups that have at least one user in the sharepoint list (signed in or not).

- Total number of groups is computed from the choices available in the membership column in the User sharepoint list, keeping only the WorkingGroups.

- The info popup lists the working groups in two columns: the ones with nominations and the ones without nominations.


## Info detailing country progress

This section provides information of the selected country participantion in the events/consultations/enquiries. It is visible only if the country is selected. The cards no longer link to the sharepoint lists, the details are displayed in the info popup of each card.
The data is diplayed separately per year, for the number of years configured in the DashboardNoOfDisplayedYears option in the Configuration list (2 by default, including the current year).

### Consultations
- The total count of consultations is computed using the following condition: 

    ```
    Year of the Deadline (finalisation date) = selected year 
    AND Deadline < Today 
    AND ConsultationType = 'Consultation' 
    AND IsECConsultation IN (Eionet-and-EC, Eionet-only, N/A) 
    AND (EionetGroups has at least a non WorkingGroup OR EionetGroups is empty)
    ```

- Consultations are loaded starting from 1 January of (current year - number of displayed years), based on Startdate. One that started before this interval is not counted, even if it finalises in a displayed year.

- The number of consultations for which the country has responded is computed with the following condition added to the list obtained with total condition:  

    ```Respondants includes the selected country```

- The info popup lists the consultations in two columns: the ones the country responded to and the ones it did not respond to. Both columns use the total condition above, so together they match the counter.

### Enquiries
- The total count of enquiries is computed using the following condition: 

    ```
    Year of the Deadline (finalisation date) = selected year 
    AND Deadline < Today 
    AND ConsultationType = 'Enquiry' 
    AND IsECConsultation IN (Eionet-and-EC, Eionet-only, N/A) 
    AND (EionetGroups has at least a non WorkingGroup OR EionetGroups is empty)
    ```

- Enquiries are loaded in the same interval as the consultations, based on Startdate.

- The number of enquiries for which the country has responded is computed with the following condition added to the list obtained with total condition:  

    ```Respondants includes the selected country```

- The info popup lists the enquiries in the same two columns as the consultations, using the same conditions.

### Events
- The total count of events is computed using the following condition: 
    
    ```
    Year = selected year 
    AND (Group has at least a group that is not a WorkingGroup and not a NotApplicableGroup OR Group is empty) 
    AND MeetingEnd < Today
    ```

- The number of events attended by a user from the selected country is computed with the following condition added to the list obtained with total condition: 

    ```Countries includes the selected country```

- The info popup lists the events in two columns: the ones the country participated in and the ones it did not participate in. Both columns use the total condition above, so together they match the counter.

## Info popups for the yearly cards

Every row shows the title and a date: the start date for events, the closed date for consultations and enquiries. The title links to the folder of the item (Linktofolder) or, when that is empty, to the item in the sharepoint list.

