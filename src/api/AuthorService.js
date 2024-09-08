import HTTP from './API';
import {AUTHORS_SEARCH_URL, AUTHORS_URL} from "../common/Constants";

export function findAllAuthors() {
  return HTTP.get(AUTHORS_URL);
}

export function findAllPaginatedAuthors(data, params) {
  return HTTP.post(AUTHORS_SEARCH_URL, data, {params});
}

export function findAuthorById(params) {
  return HTTP.get(AUTHORS_URL, {params});
}

export function addAuthor(author) {
  return HTTP.post(AUTHORS_URL, author);
}

export function editAuthor(author) {
  return HTTP.put(AUTHORS_URL, author);
}

export function deleteAuthor(params) {
  return HTTP.delete(AUTHORS_URL, {params});
}