import { getRepositories } from "./api_azure.mjs";

let repositoriesData = {
    allRepositoriesData: [],
    avaiableRepos: [],
    mainRepos: [],
    linkedRepos: [],
    mainRepoConfigs: {},
    linkedReposData: {}
};

let azureData = null;

export async function LoadData() {
    return new Promise((resolve) => {
        chrome.storage.local.get([
            'azureConfig',
            'repositoriesData',
            'organization',
            'project'
        ], async (data) => {
            azureData = data.azureConfig;
            repositoriesData.allRepositoriesData = await fetchRepositories(data.organization.organization, data.project);
            if (data.repositoriesData) {
                Object.assign(repositoriesData, data.repositoriesData);
                console.log('repositoriesData carregado do storage:', repositoriesData);
            }
            else {
                repositoriesData.avaiableRepos = repositoriesData.allRepositoriesData;
            }
            resolve(repositoriesData);
        });
    });
}

export function saveRepositoriesData() {
    chrome.storage.local.set({ repositoriesData }, () => {
        console.log('repositoriesData salvo no storage:', repositoriesData);
    });
}

export async function fetchRepositories(organization, project) {
    return await getRepositories(organization, project);
}

export function updateRepositoriesData(data) {
    Object.assign(repositoriesData, data);
    console.log('Dados atualizados:', repositoriesData);
}