import { fetchRepositories, LoadData } from "../model/repositorys.mjs";
import { addEventListenerToAddMainRepoButton, updateAvailableReposDropdown, getDropdownsValues, registerAllEvents } from "../view/repositorys.mjs";

registerAllEvents();

LoadData().then(async (data) => {
    const token = data.azureConfig.token;
    updateAvailableReposDropdown(await fetchRepositories(token));
});

addEventListenerToAddMainRepoButton(() => {
    console.log(getDropdownsValues());
});

