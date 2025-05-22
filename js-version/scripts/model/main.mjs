export async function getTokenValue() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['azureConfig'], (result) => {
            if (result.azureConfig) {
                resolve(result.azureConfig.token);
            } else {
                resolve(null);
            }
        });
    });
}

export async function setTokenValue(token) {
    chrome.storage.local.set({ azureConfig: { token } }, () => {
        alert('Token salvo com sucesso!');
    });
}