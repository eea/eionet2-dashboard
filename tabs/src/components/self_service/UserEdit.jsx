import React, { useState, useEffect } from 'react';
import { saveData } from '../../data/selfServiceProvider';
import { getGenderList } from '../../data/selfServiceSharepointProvider';
import { validateMandatoryField, validateName, validatePhone } from '../../data/validator';
import './UserEdit.scss';
import {
  Box,
  TextField,
  Autocomplete,
  Button,
  FormLabel,
  CircularProgress,
  Chip,
  Paper,
  InputLabel,
  Link,
  Typography,
  Divider,
  Tooltip,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import SaveIcon from '@mui/icons-material/Save';
import ContactsIcon from '@mui/icons-material/Contacts';

export function UserEdit({ user, configuration }) {
  const [loading, setLoading] = useState(false),
    [success, setSuccess] = useState(false),
    [warningVisible, setWarningVisible] = useState(false),
    [warningText, setWarningText] = useState(''),
    [genders, setGenders] = useState([]);

  const [errors, setErrors] = useState({});

  const submit = async (e) => {
    if (!loading) {
      e.preventDefault();
      let tempErrors = validateForm();
      setWarningVisible(false);
      if (
        !tempErrors ||
        !Object.values(tempErrors).some((v) => {
          return v;
        })
      ) {
        setSuccess(false);
        setLoading(true);
        let result = await saveData(user);
        if (!result.Success) {
          setWarningText(result.Message + '\n' + result.Error);
          setWarningVisible(true);
          setSuccess(false);
        } else {
          setWarningText('');
          setWarningVisible(false);
        }
        setSuccess(true);
        setLoading(false);
      }
    }
  },
    validateField = (e) => {
      let id = e.target.id,
        tempErrors = { ...errors };

      switch (id) {
        case 'gender':
          tempErrors.gender = validateName(user.Gender);
          break;
        case 'firstName':
          tempErrors.firstName = validateName(user.FirstName);
          break;
        case 'lastName':
          tempErrors.lastName = validateName(user.LastName);
          break;
        case 'phone':
          tempErrors.phone = validatePhone(user.Phone);
          break;

        default:
          console.log('Undefined field for validation');
          break;
      }

      setErrors({ ...tempErrors });
    },
    validateForm = () => {
      let tempErrors = { ...errors };
      tempErrors.gender = validateMandatoryField(user.Gender);
      tempErrors.firstName = validateName(user.FirstName);
      tempErrors.lastName = validateName(user.LastName);
      tempErrors.phone = validatePhone(user.Phone);
      setErrors({ ...tempErrors });
      return tempErrors;
    };

  useEffect(() => {
    (async () => {
      let loadedGenders = await getGenderList();
      loadedGenders && setGenders(loadedGenders);
    })();
  }, [getGenderList]);

  return (
    <div className="">
      {user && (
        <Box
          sx={{
            overflowY: 'scroll',
            paddingLeft: '1.5rem',
            height: '100%',
            backgroundColor: 'suplementary.main',
          }}
        >
          <Box
            component="form"
            sx={{
              '& .MuiTextField-root': { m: 1 },
            }}
            autoComplete="off"
            noValidate
            onSubmit={(e) => {
              submit(e);
            }}
          >
            <Typography sx={{ paddingTop: '1rem' }} className="subtitle">
              Manage personal details
            </Typography>
            <FormLabel className="note-label">
              {user.SelfSeviceHelpdeskPersonalDetailsText}{' '}
            </FormLabel>
            <Box className="row-container" sx={{ backgroundColor: 'white', marginTop: '1.5rem' }}>
              <Box className="row">
                <Autocomplete
                  disablePortal
                  sx={{ width: '20ch', marginRight: '0.75rem' }}
                  id="combo-box-gender"
                  defaultValue={user.Gender || ''}
                  options={genders}
                  onChange={(e, value) => {
                    user.Gender = value;
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      autoComplete="off"
                      className="control"
                      label="Salutation"
                      variant="standard"
                      error={Boolean(errors?.gender)}
                      helperText={errors?.gender}
                      onBlur={validateField}
                    />
                  )}
                />
                <TextField
                  required
                  autoComplete="off"
                  className="control"
                  id="firstName"
                  label="First name"
                  variant="standard"
                  defaultValue={user.FirstName}
                  onChange={(e) => {
                    user.FirstName = e.target.value;
                    validateField(e);
                  }}
                  inputProps={{ style: { textTransform: 'capitalize' } }}
                  error={Boolean(errors?.firstName)}
                  helperText={errors?.firstName}
                  onBlur={validateField}
                />
                <TextField
                  required
                  autoComplete="off"
                  className="control"
                  id="lastName"
                  label="Last name"
                  variant="standard"
                  defaultValue={user.LastName}
                  onChange={(e) => {
                    user.LastName = e.target.value;
                    validateField(e);
                  }}
                  inputProps={{ style: { textTransform: 'capitalize' } }}
                  error={Boolean(errors?.lastName)}
                  helperText={errors?.lastName}
                  onBlur={validateField}
                />
                <TextField
                  autoComplete="off"
                  className="control"
                  id="jobTitle"
                  label="Job title"
                  variant="standard"
                  value={user.JobTitle}
                  onChange={(e) => {
                    user.JobTitle = e.target.value;
                    validateField(e);
                  }}
                  inputProps={{ style: { textTransform: 'capitalize' } }}
                />
                <TextField
                  autoComplete="off"
                  className="control"
                  id="phone"
                  label="Phone"
                  variant="standard"
                  defaultValue={user.Phone}
                  onChange={(e) => {
                    user.Phone = e.target.value;
                    validateField(e);
                  }}
                  inputProps={{ maxLength: 15 }}
                  error={Boolean(errors?.phone)}
                  helperText={errors?.phone}
                  onBlur={validateField}
                />
              </Box>
              <Box className="row">
                <TextField
                  disabled
                  required
                  autoComplete="off"
                  className="control"
                  id="lastName"
                  label="Country"
                  variant="standard"
                  defaultValue={user.Country}
                />
                <TextField
                  disabled
                  required
                  autoComplete="off"
                  className="control"
                  id="email"
                  defaultValue={user.Email}
                  label="Email"
                  variant="standard"
                />
                <TextField
                  disabled
                  required
                  autoComplete="off"
                  className="control"
                  id="lastName"
                  label="Organisation"
                  variant="standard"
                  defaultValue={user.Organisation}
                />
                <TextField
                  autoComplete="off"
                  className="control"
                  id="department"
                  label="Department"
                  variant="standard"
                  defaultValue={user.Department}
                  onChange={(e) => {
                    user.Department = e.target.value;
                  }}
                />
              </Box>
            </Box>
            <Box className="row">
              {user.Memberships && (
                <Paper square className="paper-container" elevation={0}>
                  <InputLabel className="inputLabel">Memberships</InputLabel>
                  <Paper className="paper" elevation={0}>
                    {user.Memberships.map((data, index) => {
                      const showIcon = user.PCP?.includes(data);
                      return (
                        <div key={index}>
                          {showIcon && (
                            <Tooltip title={configuration.DashboardLeadIconTooltip}>
                              <Chip
                                icon={user.PCP?.includes(data) && <ContactsIcon />}
                                variant="outlined"
                                color="primary"
                                className="chip"
                                label={data}
                              />
                            </Tooltip>
                          )}
                          {!showIcon && (
                            <Chip
                              variant="outlined"
                              color="primary"
                              className="chip"
                              label={data}
                            />
                          )}
                        </div>
                      );
                    })}
                  </Paper>
                </Paper>
              )}
              {user.OtherMemberships && (
                <Paper square className="paper-container" elevation={0}>
                  <InputLabel className="inputLabel">Other memberships</InputLabel>
                  <Paper className="paper" elevation={0}>
                    {user.OtherMemberships.map((data) => {
                      return (
                        <Chip
                          variant="outlined"
                          color="primary"
                          key={data}
                          className="chip"
                          label={data}
                        />
                      );
                    })}
                  </Paper>
                </Paper>
              )}
              {user.NFP && (
                <Paper sx={{ marginRight: '0' }} square className="paper-container" elevation={0}>
                  <InputLabel className="inputLabel">NFP</InputLabel>
                  <Paper className="paper" elevation={0}>
                    <Chip className="chip" variant="outlined" color="primary" label={user.NFP} />
                  </Paper>
                </Paper>
              )}
            </Box>
            <div className="row">
              <FormLabel className="note-label">
                Note: If the email or other details needs to be changed, kindly contact{' '}
                <Link sx={{ color: 'secondary.main' }} href="mailto:helpdesk@eea.europa.eu">
                  EEA Helpdesk
                </Link>
                .
              </FormLabel>
            </div>
            <div className="row">
              <Box sx={{ position: 'relative' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="medium"
                  className="button"
                  disabled={loading}
                  endIcon={success ? <CheckIcon /> : <SaveIcon />}
                >
                  Save changes
                </Button>
                {loading && (
                  <CircularProgress
                    color="primary"
                    size={24}
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      marginTop: '-12px',
                      marginLeft: '-12px',
                    }}
                  />
                )}
              </Box>
              {warningVisible && (
                <FormLabel className="note-label warning" error>
                  {warningText}
                </FormLabel>
              )}
            </div>
          </Box>
          <Divider sx={{ marginBottom: '1rem' }}></Divider>
          <Box>
            <Typography className="subtitle">Manage preferences</Typography>
            <FormLabel className="note-label">{user.SelfSeviceHelpdeskPreferencesText} </FormLabel>
          </Box>
        </Box>
      )}
    </div>
  );
}
