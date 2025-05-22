export function setInputTokenValue(token) {
    const tokenInput = document.getElementById('token');
    tokenInput.value = token;
}

export function getInputTokenValue() {
    const tokenInput = document.getElementById('token');
    return tokenInput.value;
}

export function setEventListenerToSaveTokenButton(event) {
    document.getElementById("saveToken").addEventListener('click', event);
}