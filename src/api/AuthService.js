import HTTP from './API';
import {CURRENT_USER_URL, LOGIN_URL, VALIDATE_TOKEN_URL} from "../common/Constants";

export function login(data) {
  return HTTP.post(LOGIN_URL, data);
}

export function getCurrentUser() {
  return HTTP.get(CURRENT_USER_URL);
}

export function isTokenValid(params) {
  return HTTP.get(VALIDATE_TOKEN_URL, {params});
}