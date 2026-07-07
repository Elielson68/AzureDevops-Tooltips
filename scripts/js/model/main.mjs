import { getAzureConnection, setAzureConnection } from "../../../common/storage.js";

export async function getTokenValue() {
    const connection = await getAzureConnection();
    return [connection?.token || '', connection?.organization || ''];
}

export async function saveValues(token, organization) {
    await setAzureConnection({ token, organization });
    alert('Token salvo com sucesso!');
}
