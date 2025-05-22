const tokenInput = document.getElementById('token');

export function setInputTokenValue(token) {
    tokenInput.value = token;
}

export function getInputTokenValue() {
    return tokenInput.value;
}

export function setEventListenerToSaveTokenButton(event) {
    document.getElementById("saveToken").addEventListener('click', event);
}