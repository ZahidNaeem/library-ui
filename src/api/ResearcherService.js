import HTTP from './API';
import {RESEARCHERS_SEARCH_URL, RESEARCHERS_URL} from "../common/Constants";

export function findAllResearchers() {
  return HTTP.get(RESEARCHERS_URL);
}

export function findAllPaginatedResearchers(data, params) {
  return HTTP.post(RESEARCHERS_SEARCH_URL, data, {params});
}

export function findResearcherById(params) {
  return HTTP.get(RESEARCHERS_URL, {params});
}

export function addResearcher(researcher) {
  return HTTP.post(RESEARCHERS_URL, researcher);
}

export function editResearcher(researcher) {
  return HTTP.put(RESEARCHERS_URL, researcher);
}

export function deleteResearcher(params) {
  return HTTP.delete(RESEARCHERS_URL, {params});
}