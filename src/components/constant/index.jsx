export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8089/api/';
export const API_ITEM_URL = API_BASE_URL + 'item/';
export const API_ITEM_STOCK_URL = API_BASE_URL + 'stock/';
export const API_PARTY_URL = API_BASE_URL + 'party/';
export const API_PARTY_BALANCE_URL = API_BASE_URL + 'balance/';
export const API_INVOICE_URL = API_BASE_URL + 'invoice/';
export const API_PO_INVOICE_URL = API_INVOICE_URL + 'po/';
export const API_PI_INVOICE_URL = API_INVOICE_URL + 'pi/';
export const API_PRI_INVOICE_URL = API_INVOICE_URL + 'pri/';
export const API_SO_INVOICE_URL = API_INVOICE_URL + 'so/';
export const API_SI_INVOICE_URL = API_INVOICE_URL + 'si/';
export const API_SRI_INVOICE_URL = API_INVOICE_URL + 'sri/';
export const API_INVOICE_DTL_URL = API_BASE_URL + 'invoiceDtl/';

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
