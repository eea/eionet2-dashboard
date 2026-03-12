jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return {
    ...actual,
    React: actual,
    useEffect: jest.fn((fn) => fn()),
  };
});

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { UserEdit } from './UserEdit';
import { saveData } from '../../data/selfServiceProvider';
import { getGenderList } from '../../data/selfServiceSharepointProvider';
import { validateMandatoryField, validateName, validatePhone } from '../../data/validator';

const formSubmitHandlers = [];
const textFieldProps = [];
const autocompleteProps = [];

jest.mock('@mui/material', () => {
  const ReactLocal = require('react');
  const passthrough =
    (Tag = 'div') =>
    ({ children }) =>
      ReactLocal.createElement(Tag, {}, children);

  const Box = ({ children, component, onSubmit }) => {
    if (component === 'form' && onSubmit) {
      formSubmitHandlers.push(onSubmit);
    }
    return <div>{children}</div>;
  };

  const TextField = (props) => {
    textFieldProps.push(props);
    return <div>{props.label || props.id || ''}</div>;
  };

  const Autocomplete = (props) => {
    autocompleteProps.push(props);
    return <div>{props.renderInput ? props.renderInput({ id: 'gender' }) : null}</div>;
  };

  return {
    Box,
    TextField,
    Autocomplete,
    Button: passthrough('button'),
    FormLabel: passthrough('label'),
    CircularProgress: passthrough('span'),
    Chip: ({ label }) => <div>{label}</div>,
    Paper: passthrough(),
    InputLabel: passthrough('label'),
    Link: ({ children, href }) => <a href={href}>{children}</a>,
    Typography: passthrough('span'),
    Divider: passthrough('hr'),
    Tooltip: ({ children }) => <div>{children}</div>,
  };
});

jest.mock('@mui/icons-material/Check', () => () => <span>check-icon</span>);
jest.mock('@mui/icons-material/Save', () => () => <span>save-icon</span>);
jest.mock('@mui/icons-material/Contacts', () => () => <span>contacts-icon</span>);

jest.mock('./UserEdit.scss', () => ({}));
jest.mock('../../data/selfServiceProvider', () => ({
  saveData: jest.fn(),
}));
jest.mock('../../data/selfServiceSharepointProvider', () => ({
  getGenderList: jest.fn(),
}));
jest.mock('../../data/validator', () => ({
  validateMandatoryField: jest.fn(),
  validateName: jest.fn(),
  validatePhone: jest.fn(),
}));

describe('UserEdit', () => {
  const baseUser = {
    Gender: 'Mr',
    FirstName: 'John',
    LastName: 'Doe',
    JobTitle: 'Expert',
    Phone: '+40123',
    Department: 'Air',
    Country: 'Romania',
    Email: 'john.doe@example.org',
    Organisation: 'EEA',
    SelfSeviceHelpdeskPersonalDetailsText: 'Personal help text',
    SelfSeviceHelpdeskPreferencesText: 'Preferences help text',
    PCP: [],
    Memberships: [],
    OtherMemberships: [],
    NFP: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    formSubmitHandlers.length = 0;
    textFieldProps.length = 0;
    autocompleteProps.length = 0;

    getGenderList.mockResolvedValue(['Mr', 'Mrs']);
    validateMandatoryField.mockReturnValue('');
    validateName.mockReturnValue('');
    validatePhone.mockReturnValue('');
    saveData.mockResolvedValue({ Success: true });
  });

  test('renders form content and optional blocks', () => {
    const html = renderToStaticMarkup(
      <UserEdit
        user={{
          ...baseUser,
          PCP: ['Air group'],
          Memberships: ['Air group', 'Climate group'],
          OtherMemberships: ['External network'],
          NFP: 'Romania NFP',
        }}
        configuration={{ DashboardLeadIconTooltip: 'Lead contact' }}
      />,
    );

    expect(html).toContain('Manage personal details');
    expect(html).toContain('Memberships');
    expect(html).toContain('Other memberships');
    expect(html).toContain('Romania NFP');
    expect(html).toContain('helpdesk@eea.europa.eu');
    expect(html).toContain('Manage preferences');
    expect(getGenderList).toHaveBeenCalled();
  });

  test('runs submit success flow', async () => {
    const user = { ...baseUser };
    renderToStaticMarkup(<UserEdit user={user} configuration={{}} />);

    const submit = formSubmitHandlers[0];
    expect(submit).toBeDefined();

    const preventDefault = jest.fn();
    await submit({ preventDefault });

    expect(preventDefault).toHaveBeenCalled();
    expect(saveData).toHaveBeenCalledWith(user);
    expect(validateMandatoryField).toHaveBeenCalledWith(user.Gender);
    expect(validateName).toHaveBeenCalledWith(user.FirstName);
    expect(validatePhone).toHaveBeenCalledWith(user.Phone);
  });

  test('runs submit error flow when save fails', async () => {
    saveData.mockResolvedValue({ Success: false, Message: 'Save failed', Error: 'Backend error' });

    renderToStaticMarkup(<UserEdit user={{ ...baseUser }} configuration={{}} />);

    await formSubmitHandlers[0]({ preventDefault: jest.fn() });

    expect(saveData).toHaveBeenCalled();
  });

  test('stops submit when form has validation errors', async () => {
    validateMandatoryField.mockReturnValue('Required');

    renderToStaticMarkup(<UserEdit user={{ ...baseUser }} configuration={{}} />);

    await formSubmitHandlers[0]({ preventDefault: jest.fn() });

    expect(saveData).not.toHaveBeenCalled();
  });

  test('triggers field handlers for validation and mutations', () => {
    const user = { ...baseUser };
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    renderToStaticMarkup(<UserEdit user={user} configuration={{}} />);

    const firstName = textFieldProps.find((p) => p.id === 'firstName');
    const lastName = textFieldProps.find((p) => p.id === 'lastName' && p.label === 'Last name');
    const jobTitle = textFieldProps.find((p) => p.id === 'jobTitle');
    const phone = textFieldProps.find((p) => p.id === 'phone');
    const department = textFieldProps.find((p) => p.id === 'department');
    const salutation = textFieldProps.find((p) => p.label === 'Salutation');

    firstName.onChange({ target: { id: 'firstName', value: 'Alice' } });
    lastName.onChange({ target: { id: 'lastName', value: 'Smith' } });
    phone.onChange({ target: { id: 'phone', value: '+49123' } });
    jobTitle.onChange({ target: { id: 'jobTitle', value: 'Manager' } });
    department.onChange({ target: { id: 'department', value: 'Climate' } });

    salutation.onBlur({ target: { id: 'gender' } });

    const autocomplete = autocompleteProps[0];
    autocomplete.onChange({}, 'Mrs');

    expect(user.FirstName).toBe('Alice');
    expect(user.LastName).toBe('Smith');
    expect(user.Phone).toBe('+49123');
    expect(user.JobTitle).toBe('Manager');
    expect(user.Department).toBe('Climate');
    expect(user.Gender).toBe('Mrs');

    expect(validateName).toHaveBeenCalled();
    expect(validatePhone).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith('Undefined field for validation');

    logSpy.mockRestore();
  });

  test('renders empty container when user is missing', () => {
    const html = renderToStaticMarkup(<UserEdit user={null} configuration={{}} />);
    expect(html).toBe('<div class=""></div>');
  });
});
