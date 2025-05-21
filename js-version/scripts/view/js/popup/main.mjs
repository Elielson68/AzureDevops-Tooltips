console.log("Carregou main.mjs");
chrome.storage.local.get(['azureConfig'], (result) => {
    if (result.azureConfig) {
        token.value = result.azureConfig.token;
    }
});


document.getElementById("saveToken").addEventListener('click', async () => {
    const tokenInput = document.getElementById('token');
    const token = (tokenInput && tokenInput.value);

    chrome.storage.local.set({ azureConfig: { token } }, () => {
        alert('Token salvo com sucesso!');
    });
});