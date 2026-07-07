export function setInputTokenValue(token) {
    const tokenInput = document.getElementById('token');
    tokenInput.value = token;
}

export function setInputOrganizationValue(organization) {
    const organizationInput = document.getElementById('organization');
    organizationInput.value = organization;
}

export function getInputTokenValue() {
    const tokenInput = document.getElementById('token');
    return tokenInput.value;
}

export function getInputOrganizationValue() {
    const organizationInput = document.getElementById('organization');
    return organizationInput.value;
}

export function setEventListenerToSaveTokenButton(event) {
    document.getElementById("saveToken").addEventListener('click', event);
}