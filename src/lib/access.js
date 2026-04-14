export const USER_ROLES = {
  ADMIN: "ADMIN",
  AUTHOR: "AUTHOR",
};

export function isAdmin(user) {
  return user?.role === USER_ROLES.ADMIN;
}

export function isApprovedAuthor(user) {
  return user?.role === USER_ROLES.AUTHOR && user?.approved === true;
}

export function canAccessDashboard(user) {
  return isAdmin(user) || isApprovedAuthor(user);
}

export function canManageUsers(user) {
  return isAdmin(user);
}
