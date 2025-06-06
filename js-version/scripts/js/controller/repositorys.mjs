import { LoadData, saveRepositoriesData, updateRepositoriesData } from "../model/repositorys.mjs";
import {
    updateAvailableReposDropdown, getDropdownsValues,
    registerAllEvents, addEventListenerToSaveRepoConfigButton, updateMainReposDropdown,
    getLinkedReposData,
    updateLinkedReposList,

} from "../view/repositorys.mjs";

LoadData().then(async (data) => {
    console.log('Dados carregados:', data);
    registerAllEvents();
    updateAvailableReposDropdown(data.avaiableRepos);
    updateMainReposDropdown(data.mainRepos);
    updateLinkedReposList(data.linkedReposData);

    addEventListenerToSaveRepoConfigButton(() => {
        updateRepositoriesData(getDropdownsValues());
        updateRepositoriesData(getLinkedReposData());
        saveRepositoriesData();
    });
});
