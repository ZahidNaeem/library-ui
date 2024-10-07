// ================== variables ==================
const HOST = 'localhost';
const PORT = '8082';
export const BASE_URL = `http://${HOST}:${PORT}/api`;

export const AUTH_URL = 'auth';
export const LOGIN_URL = `${AUTH_URL}/login`;
export const LOGOUT_URL = `${AUTH_URL}/logout`;
export const VALIDATE_TOKEN_URL = AUTH_URL + '/validate-token';
export const USERS_URL = 'users';
export const CURRENT_USER_URL = `${BASE_URL}/user/me`;
export const SUBJECTS_URL = 'subjects';
export const SUBJECTS_SEARCH_URL = SUBJECTS_URL + "/search";
export const AUTHORS_URL = 'authors';
export const AUTHORS_SEARCH_URL = AUTHORS_URL + "/search";
export const BOOKS_URL = 'books';
export const BOOKS_SEARCH_URL = BOOKS_URL + "/search";
export const PUBLISHERS_URL = "publishers";
export const PUBLISHERS_SEARCH_URL = PUBLISHERS_URL + "/search";
export const RESEARCHERS_URL = "researchers";
export const RESEARCHERS_SEARCH_URL = RESEARCHERS_URL + "/search";
export const SHELVES_URL = "shelves";
export const SHELVES_SEARCH_URL = SHELVES_URL + "/search";
export const VOLUMES_URL = "volumes";
export const VOLUMES_FILTERED_URL = VOLUMES_URL + "/filtered-volumes";
export const VOLUMES_SEARCH_URL = VOLUMES_URL + "/search";
export const RACKS_URL = "racks";
export const RACKS_SEARCH_URL = RACKS_URL + "/search";
export const READERS_URL = "readers";
export const READERS_SEARCH_URL = READERS_URL + "/search";
export const BOOK_TRANS_HEADERS_URL = "bookTransHeaders";
export const BOOK_TRANS_HEADERS_SEARCH_URL = BOOK_TRANS_HEADERS_URL + "/search";
// ================== functions ==================

export const getCustomDropdownValue = (conf, object) => {
  console.log(conf, object);
  let value;
  if (conf.listReturnKey) {
    value = conf.list.filter(element => element[conf.listReturnKey] === object[conf.modalKey]) || [];
  } else {
    value = conf.list.filter(element => object[conf.modalKey] && object[conf.modalKey].some(obj => obj.id === element.id)) || [];
  }
  return value;
}

export const getFirstElement = (arr) => arr?.[0] ?? null;
