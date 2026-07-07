import { getAzureConnection } from "../../../common/storage.js";

async function buildHeaders() {
    const connection = await getAzureConnection();
    const token = connection?.token || '';
    const auth_token = btoa(`:${token}`);
    return { 'Authorization': `Basic ${auth_token}`, 'Content-Type': 'application/json' };
}

export async function get(uri) {
    const headers = await buildHeaders();
    return fetch(uri, { headers });
}

export async function path(uri, data) {
    const headers = await buildHeaders();
    return fetch(uri, { method: 'PATCH', headers, body: JSON.stringify(data) });
}

export async function post(uri, data) {
    const headers = await buildHeaders();
    return fetch(uri, { method: 'POST', headers, body: JSON.stringify(data) });
}
