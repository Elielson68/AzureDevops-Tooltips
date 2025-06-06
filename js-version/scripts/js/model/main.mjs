export async function getTokenValue() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['azureConfig', 'organization'], async (result) => {
            console.log(result)
            if (result.azureConfig) {
                resolve([result.azureConfig.token, result.organization.organization]);
            } else {
                resolve([null, null]);
            }
        });
    });
}

export async function saveValues(token, organization) {
    chrome.storage.local.set({ azureConfig: { token }, organization: { organization }, }, () => {
        alert('Token salvo com sucesso!');
    });
}