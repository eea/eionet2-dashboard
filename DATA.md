## Definitions
- WorkingGroup - group where the name starts with the prefix configured in the WorkingGroupPrefix option in Configuration list


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

### Groups with nominations
- The count of groups with nominations is computed by from the groups that have at least one user in the sharepoint list (signed in or not).

- Total number of groups is computed from the choices available in the membership column in the User sharepoint list excluding WorkingGroups.

### Groups with signed in users
- The count of groups with signed in users is computed by from the groups that have at least one user with SignedIn = true in the sharepoint list. Always should be smaller than the previous count.

- Total number of groups is computed in the same way as in the previous counter.


## Info detailing country progress

This section provides information of the selected country participantion in the events/consultations/enquiries. It is visible only if the country is selected.
The data is diplayed separately per year for the last three years (including current year).

### Consultations
- The total count of consultations is computed using the following condition: 

    ```
    Year = selected year 
    AND Deadline < Today 
    AND ConsultationType = 'Consultation' 
    AND IsECConsultation IN (Eionet-and-EC, Eionet-only, N/A) 
    AND EionetGroups has at least a non WorkingGroup
    ```

- The number of consultations for which the country has responded is computed with the following condition added to the list obtained with total condition:  

    ```Respondants includes the selected country```

### Enquiries
- The total count of enquiries is computed using the following condition: 

    ```
    Year = selected year 
    AND Deadline < Today 
    AND ConsultationType = 'Enquiry' 
    AND IsECConsultation IN (Eionet-and-EC, Eionet-only, N/A) 
    AND EionetGroups has at least a non WorkingGroup
    ```

- The number of enquiries for which the country has responded is computed with the following condition added to the list obtained with total condition:  

    ```Respondants includes the selected country```

### Events
- The total count of events is computed using the following condition: 
    
    ```
    Year = selected year 
    AND Group has at least a non WorkingGroup 
    AND MeetingEnd < Today
    ```

- The number of events attended by a user from the selected country is computed with the following condition added to the list obtained with total condition: 

    ```Countries includes the selected country```

