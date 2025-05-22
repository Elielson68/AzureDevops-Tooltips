import * as api_links from "./api_links.mjs";

export const auth_token = btoa(`:${api_links.data_config.token_azure}`);
export const HEADERS = { 'Authorization': `Basic ${auth_token}`, 'Content-Type': 'application/json' };

export const headerGetRequest = {
    headers: HEADERS
};

export const headerPathRequest = (data) => ({
    method: 'PATCH',
    headers: HEADERS,
    body: JSON.stringify(data)
});

export const headerPostRequest = (data) => ({
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(data)
});

export async function get(uri) {
    return fetch(uri, headerGetRequest);
}

export async function path(uri, data) {
    return fetch(uri, headerPathRequest(data));
}

export async function post(uri, data) {
    return fetch(uri, headerPostRequest(data));
}