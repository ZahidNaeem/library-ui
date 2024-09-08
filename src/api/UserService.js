import HTTP from './API';
import {USERS_URL} from "../common/Constants";

export function findAllUsers() {
  return HTTP.get(USERS_URL);
}

export function findUserById(params) {
  return HTTP.get(USERS_URL, {params});
}
export function addUser(user) {
  return HTTP.post(USERS_URL, user);
}
export function editUser(user) {
  return HTTP.put(USERS_URL, user);
}
export function activateUser(id) {
  return HTTP.put(`${USERS_URL}/${id}`);
}

export function deleteUser(params) {
  return HTTP.delete(USERS_URL, {params});
}