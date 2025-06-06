import { getUserOrganizations as getUserOrganization } from "./api_azure.mjs";


let azureData = {}

export async function fetchOrganization() {
    return await getUserOrganization();
}

export async function fetchProjects() {
    // Implemente a chamada à API para obter os projetos
    // Exemplo: return await callAzureDevOpsApi(`https://dev.azure.com/${organization}/_apis/projects`, token);
    return ['Projeto1', 'Projeto2', 'Projeto3']; // Exemplo
}

export async function fetchTeams() {
    // Implemente a chamada à API para obter os times
    // Exemplo: return await callAzureDevOpsApi(`https://dev.azure.com/${organization}/${project}/_apis/teams`, token);
    return ['Time1', 'Time2', 'Time3']; // Exemplo
}

export function getData() {
    return azureData;
}

export function getOrganization() {
    return azureData.organization;
}

export function getProject() {
    return azureData.project;
}

export function getTeam() {
    return azureData.team;
}

export function getTokenValue() {
    return azureData.azureConfig.token;
}

export function saveConfig(projectValue, teamValue) {
    alert("Configuração salva!");
    const project = projectValue;
    const team = teamValue;

    chrome.storage.local.set({
        project: project,
        team: team
    });
}

export async function LoadData() {
    return new Promise((resolve) => {
        chrome.storage.local.get([
            'azureConfig',
            'organization',
            'project',
            'team'
        ], (data) => {
            azureData = data;
            console.log("Dados carregados: ", azureData);
            resolve(data);
        });
    });
}