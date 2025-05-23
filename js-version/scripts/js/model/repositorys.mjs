let repositoriesData = {
    avaiableRepos: [],
    mainRepos: [],
    linkedRepos: [],
    mainRepoConfigs: {}
};
let currentRepoId = null;
let azureData = null;

export async function LoadData() {
    return new Promise((resolve) => {
        chrome.storage.local.get([
            'azureConfig',
        ], (data) => {
            azureData = data;
            resolve(data);
        });
    });
}

// Funções auxiliares
export async function fetchRepositories(token) {
    // Implemente a chamada à API para obter os repositórios
    // Exemplo: return await callAzureDevOpsApi(`https://dev.azure.com/{organization}/_apis/git/repositories`, token);
    return [
        { id: 'repo1', name: 'Repositório 1' },
        { id: 'repo2', name: 'Repositório 2' },
        { id: 'repo3', name: 'Repositório 3' }
    ]; // Exemplo
}