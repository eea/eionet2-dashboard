const validator = require('./validator');

test('validateName returns length error for single character', () => {
  expect(validator.validateName('t')).toBe('Please enter at least 2 characters!');
});

test('validateName returns mandatory error for empty value', () => {
  expect(validator.validateName('')).toBe('Please fill out this field!');
});

test('validateName passes for valid value', () => {
  expect(validator.validateName('test')).toBe(undefined);
});

test('validateMandatoryField passes for non-empty string', () => {
  expect(validator.validateMandatoryField('test')).toBe(undefined);
});

test('validateMandatoryField returns mandatory error for empty string', () => {
  expect(validator.validateMandatoryField('')).toBe('Please fill out this field!');
});

test('validateMandatoryField returns mandatory error for empty array', () => {
  expect(validator.validateMandatoryField([])).toBe('Please fill out this field!');
});

test('validateMandatoryField passes for non-empty array', () => {
  expect(validator.validateMandatoryField(['a'])).toBe(undefined);
});

test('validatePhone returns format error for invalid input', () => {
  expect(validator.validatePhone('abc')).toBe(
    'Only numbers and characters +, -, . are allowed.',
  );
});

test('validatePhone passes for valid numeric input', () => {
  expect(validator.validatePhone('+40 123-456.78')).toBe(undefined);
});

test('validatePhone passes for empty input', () => {
  expect(validator.validatePhone('')).toBe(undefined);
});
