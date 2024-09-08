import HTTP from './API';
import {READERS_SEARCH_URL, READERS_URL} from "../common/Constants";

export function findAllReaders() {
  return HTTP.get(READERS_URL);
}

export function findAllPaginatedReaders(data, params) {
  return HTTP.post(READERS_SEARCH_URL, data, {params});
}

export function findReaderById(params) {
  return HTTP.get(READERS_URL, {params});
}

export function addReader(reader) {
  return HTTP.post(READERS_URL, reader);
}

export function editReader(reader) {
  return HTTP.put(READERS_URL, reader);
}

export function deleteReader(params) {
  return HTTP.delete(READERS_URL, {params});
}