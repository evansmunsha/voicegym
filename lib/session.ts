export function setUserSession(user: { id: string; email: string; username: string }) {
  // For demo: store user in localStorage (client-side only)
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('user', JSON.stringify(user));
  }
}

export function clearUserSession() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem('user');
  }
}

export function getUserSession() {
  if (typeof window !== 'undefined') {
    const user = window.localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  return null;
}
