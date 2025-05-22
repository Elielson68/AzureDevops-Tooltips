import { LoadData, fetchOrganizations, fetchProjects, fetchTeams, getTokenValue, saveConfig } from "../model/organization.mjs";
import {
    addEventListenerToOrganizationSelect, addEventListenerToProjectSelect,
    addEventListenerToSaveConfigButton, getSelectValue, populateSelect,
    selectOrganizationId, selectProjectId, selectTeamId, setSelectValue
} from "../view/organization.mjs";


LoadData().then(async data => {
    console.log("Passou no carregamento");
    if (data) {
        const organization = await fetchOrganizations(data.azureConfig.token);
        await populateSelect(selectOrganizationId, organization);
        const project = await fetchProjects(data.azureConfig.token, data.organization);
        await populateSelect(selectProjectId, project);
        const team = await fetchTeams(data.azureConfig.token, data.project);
        await populateSelect(selectTeamId, team);
    }

    if (data.organization) {
        setSelectValue(selectOrganizationId, data.organization);
    }

    if (data.project) {
        setSelectValue(selectProjectId, data.project);
    }
    if (data.team) {
        setSelectValue(selectTeamId, data.team);
    }
});

addEventListenerToOrganizationSelect(async () => {
    const org = getSelectValue(selectOrganizationId);

    if (org) {
        try {
            const projects = await fetchProjects(getTokenValue(), org);
            populateSelect(selectProjectId, projects);
        } catch (error) {
            console.error('Erro ao carregar projetos:', error);
        }
    }
});

addEventListenerToProjectSelect(async () => {
    const token = getTokenValue();
    const org = getSelectValue(selectOrganizationId);
    const project = getSelectValue(selectProjectId);

    if (project) {
        try {
            const teams = await fetchTeams(token, org, project);
            populateSelect(selectTeamId, teams);
        } catch (error) {
            console.error('Erro ao carregar times:', error);
        }
    }
});

addEventListenerToSaveConfigButton(() => saveConfig(getSelectValue(selectOrganizationId), getSelectValue(selectProjectId), getSelectValue(selectTeamId)));


