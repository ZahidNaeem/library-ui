export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8089/api/';
export const API_AUTHOR_URL = API_BASE_URL + 'author/';
export const API_SUBJECT_URL = API_BASE_URL + 'subject/';
export const API_PUBLISHER_URL = API_BASE_URL + 'publisher/';
export const API_RESEARCHER_URL = API_BASE_URL + 'researcher/';
export const API_SHELF_URL = API_BASE_URL + 'shelf/';
export const API_BOOK_URL = API_BASE_URL + 'book/';

export const ACCESS_TOKEN = 'accessToken';
export const LOGIN_REQUEST = 'loginRequest';
export const CURRENT_USER = 'currentUser';
export const USERNAME_OR_EMAIL = 'usernameOrEmail';
export const PASSWORD = 'password';
export const REMEMBER_ME = 'rememberMe';

export const NAME_MIN_LENGTH = 4;
export const NAME_MAX_LENGTH = 40;

export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 15;

export const EMAIL_MAX_LENGTH = 40;

export const PASSWORD_MIN_LENGTH = 6;
export const PASSWORD_MAX_LENGTH = 20;
