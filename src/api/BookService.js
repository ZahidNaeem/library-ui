import HTTP from './API';
import {BOOKS_SEARCH_URL, BOOKS_URL} from "../common/Constants";

export function findAllBooks() {
  return HTTP.get(BOOKS_URL);
}

export function findAllPaginatedBooks(data, params) {
  return HTTP.post(BOOKS_SEARCH_URL, data, {params});
}

export function findBookById(params) {
  return HTTP.get(BOOKS_URL, {params});
}

export function addBook(book) {
  return HTTP.post(BOOKS_URL, book);
}

export function editBook(book) {
  return HTTP.put(BOOKS_URL, book);
}

export function deleteBook(params) {
  return HTTP.delete(BOOKS_URL, {params});
}