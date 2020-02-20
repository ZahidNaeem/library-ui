import {API_BASE_URL, ACCESS_TOKEN} from '../constant';
import axios from 'axios';
import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";

// import HttpStatus from 'http-status-codes';

export async function request(options) {
    const headers = {'Content-Type': 'application/json'};

    const accessToken = retrieveDataFromLocalStorage(ACCESS_TOKEN);
    if (accessToken) {
        headers['Authorization'] = 'Bearer ' + accessToken;
        console.log('Access Token:', accessToken);

    }

    const defaults = {headers};
    options = Object.assign({}, defaults, options);
    console.log("Options:", options);

    try {
        const res = await axios(options);
        callerFunction(res);
        return res;
    } catch (error) {
        console.log(error);
        callerFunction(error.response);
        return Promise.reject(error);
    }
};

export function login(loginRequest) {
    const options = {
        url: API_BASE_URL + "auth/signin",
        method: 'POST',
        data: loginRequest
    }
    return request(options);
}

export function signup(signupRequest) {
    return request({
        url: API_BASE_URL + "auth/signup",
        method: 'POST',
        // body: JSON.stringify(signupRequest)
        data: signupRequest
    });
}

export function checkUsernameAvailability(username) {
    return request({
        url: API_BASE_URL + "user/checkUsernameAvailability?username=" + username,
        method: 'GET'
    });
}

export function sendRecoveryEmail(email) {
    return request({
        url: API_BASE_URL + "auth/recoverPassword?email=" + email,
        method: 'GET'
    });
}

export function checkEmailAvailability(email) {
    return request({
        url: API_BASE_URL + "user/checkEmailAvailability?email=" + email,
        method: 'GET'
    });
}


export async function getCurrentUser() {
    const accessToken = retrieveDataFromLocalStorage(ACCESS_TOKEN);
    if (!accessToken) {
        return Promise.reject("No access token set.");
    }

    return await request({
        url: API_BASE_URL + "user/me",
        method: 'GET'
    });
}

export function getUserProfile(username) {
    return request({
        url: API_BASE_URL + "users/" + username,
        method: 'GET'
    });
}

export function changePassword(changePasswordRequest) {
    const options = {
        url: API_BASE_URL + "user/changePassword",
        method: 'POST',
        data: changePasswordRequest
    }
    return request(options);
}

export function callerFunction(res) {
    var callerName;
    let re = /([^(]+)@|at ([^(]+) \(/g;
    let aRegexResult = re.exec(new Error().stack);
    let result = aRegexResult[1] || aRegexResult[2];
    let arr = result.split("/");

    callerName = arr[arr.length - 1];
    console.log("Function:", callerName, "Response status:", res.status);
}

export function storeDataIntoLocalStorage(key, value) {
    try {
        localStorage.setItem(key, value);
        console.log("Data successfully stored in localStorage");

    } catch (error) {
        console.log("Error storing date into localStorage", error);

    }
}

export function retrieveDataFromLocalStorage(key) {
    try {
        const value = localStorage.getItem(key);
        if (value !== null) {
            return value;
        }
    } catch (error) {
        console.log("Error retrieving data from localStorage", error);
        return null;
    }
}

export function removeDataFromLocalStorage(key) {
    try {
        localStorage.removeItem(key);

        console.log("Data successfully removed from localStorage");
        return true;
    } catch (error) {
        console.log("Error removing data from localStorage", error);
        return false;
    }
}

export function clearLocalStorage() {
    try {
        localStorage.clear();
        console.log("localStorage cleared successfully.");
        return true;
    } catch (error) {
        console.log("Error clearing localStorage", error);
        return false;
    }
}

export function generateUniqueId() {
    return new Date().valueOf() + Math.floor(Math.random() * 10);
}

export function exportToCSV(csvData, fileName) {
    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';
    const ws = XLSX.utils.json_to_sheet(csvData);
    const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
    const excelBuffer = XLSX.write(wb, {bookType: 'xlsx', type: 'array'});
    const data = new Blob([excelBuffer], {type: fileType});
    FileSaver.saveAs(data, fileName + fileExtension);
}