import HTTP from './API';
import {RACKS_SEARCH_URL, RACKS_URL} from "../common/Constants";

export function findAllRacks() {
  return HTTP.get(RACKS_URL);
}

export function findAllPaginatedRacks(data, params) {
  return HTTP.post(RACKS_SEARCH_URL, data, {params});
}

export function findRackById(params) {
  return HTTP.get(RACKS_URL, {params});
}

export function addRack(rack) {
  return HTTP.post(RACKS_URL, rack);
}

export function editRack(rack) {
  return HTTP.put(RACKS_URL, rack);
}

export function deleteRack(params) {
  return HTTP.delete(RACKS_URL, {params});
}