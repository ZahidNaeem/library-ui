export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8089/api/';
export const API_AUTHOR_URL = API_BASE_URL + 'authors/';
export const API_SUBJECT_URL = API_BASE_URL + 'subjects/';
export const API_PUBLISHER_URL = API_BASE_URL + 'publishers/';
export const API_RESEARCHER_URL = API_BASE_URL + 'researchers/';
export const API_SHELF_URL = API_BASE_URL + 'shelves/';
export const API_RACK_URL = API_BASE_URL + 'racks/';
export const API_BOOK_URL = API_BASE_URL + 'books/';
export const API_VOLUME_URL = API_BASE_URL + 'volumes/';
export const API_READER_URL = API_BASE_URL + 'readers/';
export const API_BOOK_TRANS_HEADER_URL = API_BASE_URL + 'bookTransHeaders/';
export const API_BOOK_TRANS_LINE_URL = API_BASE_URL + 'bookTransLines/';

export const BUTTON_FIRST = 'الأول';
export const BUTTON_PREVIOUS = 'السابق';
export const BUTTON_NEXT = 'اللاحق';
export const BUTTON_LAST = 'الآخر';

export const BUTTON_ADD = 'إضافة';
export const BUTTON_DELETE = 'حذف';
export const BUTTON_SAVE = 'حفظ';
export const BUTTON_UNDO = 'إلغاء';

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

export const INPUT_GROUP_TEXT_STYLE = {
    width: "180px"
}

export const STRETCH_STYLE = {
    flex: "1"
}

export const EXTRA_SMALL_BUTTON_STYLE = {
    width: "5%"
}

export const SMALL_BUTTON_STYLE = {
    width: "10%"
}

export const LARGE_BUTTON_STYLE = {
    width: "15%"
}

export const INPUT_DATE_STYLE = {
    width: "15%"
}