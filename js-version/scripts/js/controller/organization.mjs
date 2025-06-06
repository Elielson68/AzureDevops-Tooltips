import { LoadData, fetchProjects, fetchTeams, getTokenValue, saveConfig } from "../model/organization.mjs";
import {
    addEventListenerToProjectSelect,
    addEventListenerToSaveConfigButton, getSelectValue, populateSelect,
    selectProjectId, selectTeamId, setSelectValue
} from "../view/organization.mjs";


LoadData().then(async data => {
    console.log("Passou no carregamento");
    if (data) {
        const project = await fetchProjects();
        await populateSelect(selectProjectId, project);
        const team = await fetchTeams();
        await populateSelect(selectTeamId, team);
    }

    if (data.project) {
        setSelectValue(selectProjectId, data.project);
    }
    if (data.team) {
        setSelectValue(selectTeamId, data.team);
    }


});

addEventListenerToProjectSelect(async () => {
    const token = getTokenValue();
    const project = getSelectValue(selectProjectId);

    if (project) {
        try {
            const teams = await fetchTeams(token, project);
            populateSelect(selectTeamId, teams);
        } catch (error) {
            console.error('Erro ao carregar times:', error);
        }
    }
});

addEventListenerToSaveConfigButton(() => saveConfig(getSelectValue(selectProjectId), getSelectValue(selectTeamId)));


