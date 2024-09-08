import HTTP from './API';
import {VOLUMES_FILTERED_URL, VOLUMES_SEARCH_URL, VOLUMES_URL} from "../common/Constants";

export function findAllVolumes() {
  return HTTP.get(VOLUMES_URL);
}

export function findAllFilteredVolumes() {
  return HTTP.get(VOLUMES_FILTERED_URL);
}

export function findAllPaginatedVolumes(data, params) {
  return HTTP.post(VOLUMES_SEARCH_URL, data, {params});
}

export function findVolumeById(params) {
  return HTTP.get(VOLUMES_URL, {params});
}

export function addVolume(volume) {
  return HTTP.post(VOLUMES_URL, volume);
}

export function editVolume(volume) {
  return HTTP.put(VOLUMES_URL, volume);
}

export function deleteVolume(params) {
  return HTTP.delete(VOLUMES_URL, {params});
}