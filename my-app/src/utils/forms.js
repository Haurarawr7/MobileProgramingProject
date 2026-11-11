export const FORM_FIELD_TYPES = ['text', 'number', 'switch'];
export const MAX_FORM_FIELDS = 10;

export const isValidFormConfig = (form) =>
  form &&
  typeof form === 'object' &&
  typeof form.title === 'string' &&
  form.title.trim().length > 0 &&
  form.title.trim().length <= 100 &&
  Array.isArray(form.fields) &&
  form.fields.length > 0 &&
  form.fields.length <= MAX_FORM_FIELDS &&
  form.fields.every(
    (field) =>
      field &&
      typeof field.label === 'string' &&
      field.label.trim().length > 0 &&
      field.label.trim().length <= 40 &&
      FORM_FIELD_TYPES.includes(field.type),
  ) &&
  new Set(form.fields.map((field) => field.label.trim().toLowerCase())).size ===
    form.fields.length;
