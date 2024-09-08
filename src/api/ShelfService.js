import HTTP from './API';
import {SHELVES_SEARCH_URL, SHELVES_URL} from "../common/Constants";

export function findAllShelves() {
  return HTTP.get(SHELVES_URL);
}

export function findAllPaginatedShelves(data, params) {
  return HTTP.post(SHELVES_SEARCH_URL, data, {params});
}

export function findShelfById(params) {
  return HTTP.get(SHELVES_URL, {params});
}

export function addShelf(shelf) {
  return HTTP.post(SHELVES_URL, shelf);
}

export function editShelf(shelf) {
  return HTTP.put(SHELVES_URL, shelf);
}

export function deleteShelf(params) {
  return HTTP.delete(SHELVES_URL, {params});
}