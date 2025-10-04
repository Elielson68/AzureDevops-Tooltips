import { getAllTeams, getProjects, getAllTeamMembersData } from "./api_azure.mjs";

let azureData = {}

export async function fetchProjects() {
    return await getProjects(azureData.organization.organization);
}

export async function fetchTeams(project) {
    return await getAllTeams(azureData.organization.organization, project);
}

export async function fetchTeamMembersNames() {
    let teammembers = await getAllTeamMembersData(azureData.organization.organization, azureData.project);
    return teammembers.map(member => member.displayName);
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

export function saveReviewersConfig(listAvaiableReviewers, selectedReviewers) {
    console.log("Configuração de revisores salva!");

    chrome.storage.local.set({
        listAvaiableReviewers: listAvaiableReviewers,
        selectedReviewers: selectedReviewers
    });
}

export async function LoadData() {
    return new Promise((resolve) => {
        chrome.storage.local.get([
            'azureConfig',
            'organization',
            'project',
            'team',
            'listAvaiableReviewers',
            'selectedReviewers'
        ], (data) => {
            azureData = data;
            console.log("Dados carregados: ", azureData);
            resolve(data);
        });
    });
}