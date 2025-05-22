export const selectOrganizationId = "organization_select";
export const selectProjectId = "project";
export const selectTeamId = "team";


export async function populateSelect(selectId, items) {
    const select = document.getElementById(selectId);
    select.disabled = false;
    select.innerHTML = '';

    if (items.length === 0) {
        select.innerHTML = '<option value="">Nenhum item encontrado</option>';
        console.log("NÃO POPULOU: ", selectId);
        return;
    }
    console.log("Populou: ", selectId);
    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = item;
        select.appendChild(option);
    });
}

export function addEventListenerToOrganizationSelect(event) {
    document.getElementById(selectOrganizationId).addEventListener('change', event);
}

export function addEventListenerToProjectSelect(event) {
    document.getElementById(selectProjectId).addEventListener('change', event);
}

export function addEventListenerToTeamSelect(event) {
    document.getElementById(selectTeamId).addEventListener('change', event);
}

export function addEventListenerToSaveConfigButton(event) {
    document.getElementById('saveConfig').addEventListener('click', event);
}

export function setSelectValue(selectId, value, disableSelect = false) {
    const select = document.getElementById(selectId);
    select.value = value;
    select.disabled = disableSelect;
}

export function getSelectValue(selectId) {
    const select = document.getElementById(selectId);
    return select.value;
}
