const EMAIL_KEY = 'wedding_guest_email';
const NAME_KEY = 'wedding_guest_name';

export const sessionStorageKeys = {
  email: EMAIL_KEY,
  name: NAME_KEY
};

export const setGuestSession = (payload: {
  email: string;
  name: string;
}): void => {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(EMAIL_KEY, payload.email);
  localStorage.setItem(NAME_KEY, payload.name);
};

export const getGuestEmail = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem(EMAIL_KEY);
};
