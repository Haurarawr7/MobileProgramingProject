export const USER_ROLE_STUDENT = 'student';
export const USER_ROLE_TEACHER = 'teacher';
export const TEACHER_EMAIL = 'hauraamnun@gmail.com';

export const USER_ROLE_LABELS = Object.freeze({
  [USER_ROLE_STUDENT]: 'Siswa',
  [USER_ROLE_TEACHER]: 'Guru',
});

export function normalizeUserRole(role) {
  return Object.prototype.hasOwnProperty.call(USER_ROLE_LABELS, role)
    ? role
    : USER_ROLE_STUDENT;
}

export function isTeacherEmail(email) {
  return typeof email === 'string' &&
    email.trim().toLowerCase() === TEACHER_EMAIL;
}
