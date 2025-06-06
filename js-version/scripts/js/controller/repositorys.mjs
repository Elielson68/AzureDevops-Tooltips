import { LoadData, saveRepositoriesData, updateRepositoriesData } from "../model/repositorys.mjs";
import {
    addEventListenerToAddMainRepoButton, updateAvailableReposDropdown, getDropdownsValues,
    registerAllEvents, addEventListenerToSaveRepoConfigButton, updateMainReposDropdown,
    addEventListenerToRemoveMainRepoButton
} from "../view/repositorys.mjs";

LoadData().then(async (data) => {
    console.log('Dados carregados:', data);
    registerAllEvents();
    updateAvailableReposDropdown(data.avaiableRepos);
    updateMainReposDropdown(data.mainRepos);

    addEventListenerToAddMainRepoButton(() => {
        updateRepositoriesData(getDropdownsValues());
    });

    addEventListenerToRemoveMainRepoButton(() => {
        updateRepositoriesData(getDropdownsValues());
    });

    addEventListenerToSaveRepoConfigButton(saveRepositoriesData);
});
