import HTTP from './API';
import {BOOK_TRANS_HEADERS_SEARCH_URL, BOOK_TRANS_HEADERS_URL} from "../common/Constants";

export function findAllBookTrans() {
  return HTTP.get(BOOK_TRANS_HEADERS_URL);
}

export function findAllPaginatedBookTrans(data, params) {
  return HTTP.post(BOOK_TRANS_HEADERS_SEARCH_URL, data, {params});
}

export function findBookTransById(params) {
  return HTTP.get(BOOK_TRANS_HEADERS_URL, {params});
}

export function addBookTrans(bookTrans) {
  return HTTP.post(BOOK_TRANS_HEADERS_URL, bookTrans);
}

export function editBookTrans(bookTrans) {
  return HTTP.put(BOOK_TRANS_HEADERS_URL, bookTrans);
}

export function deleteBookTrans(params) {
  return HTTP.delete(BOOK_TRANS_HEADERS_URL, {params});
}