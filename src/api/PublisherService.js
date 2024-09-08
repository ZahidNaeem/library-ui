import HTTP from './API';
import {PUBLISHERS_SEARCH_URL, PUBLISHERS_URL} from "../common/Constants";

export function findAllPublishers() {
  return HTTP.get(PUBLISHERS_URL);
}

export function findAllPaginatedPublishers(data, params) {
  return HTTP.post(PUBLISHERS_SEARCH_URL, data, {params});
}

export function findPublisherById(params) {
  return HTTP.get(PUBLISHERS_URL, {params});
}

export function addPublisher(publisher) {
  return HTTP.post(PUBLISHERS_URL, publisher);
}

export function editPublisher(publisher) {
  return HTTP.put(PUBLISHERS_URL, publisher);
}

export function deletePublisher(params) {
  return HTTP.delete(PUBLISHERS_URL, {params});
}