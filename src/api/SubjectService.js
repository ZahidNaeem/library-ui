import HTTP from './API';
import {SUBJECTS_SEARCH_URL, SUBJECTS_URL} from "../common/Constants";

export function findAllSubjects() {
  return HTTP.get(SUBJECTS_URL);
}

export function findAllPaginatedSubjects(data, params) {
  return HTTP.post(SUBJECTS_SEARCH_URL, data, {params});
}

export function findSubjectById(params) {
  return HTTP.get(SUBJECTS_URL, {params});
}

export function addSubject(subject) {
  return HTTP.post(SUBJECTS_URL, subject);
}

export function editSubject(subject) {
  return HTTP.put(SUBJECTS_URL, subject);
}

export function deleteSubject(params) {
  return HTTP.delete(SUBJECTS_URL, {params});
}