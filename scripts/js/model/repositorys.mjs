import { getRepositories } from "./api_azure.mjs";
import { getAzureConnection } from "../../../common/storage.js";

let repositoriesData = {
    allRepositoriesData: [],
    avaiableRepos: [],
    mainRepos: [],
    linkedRepos: [],
    mainRepoConfigs: {},
    linkedReposData: {}
};

export async function LoadData() {
    const connection = await getAzureConnection();
    const stored = await chrome.storage.local.get(['repositoriesData']);

    repositoriesData.allRepositoriesData = await fetchRepositories(connection.organization, connection.project);
    if (stored.repositoriesData) {
        Object.assign(repositoriesData, stored.repositoriesData);
        console.log('repositoriesData carregado do storage:', repositoriesData);
    }
    else {
        repositoriesData.avaiableRepos = repositoriesData.allRepositoriesData;
    }
    return repositoriesData;
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
