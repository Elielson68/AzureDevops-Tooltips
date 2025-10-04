import { LoadData, fetchProjects, fetchTeamMembersNames, fetchTeams, saveConfig, saveReviewersConfig } from "../model/organization.mjs";
import {
    addEventListenerToAddReviewerButton,
    addEventListenerToProjectSelect,
    addEventListenerToRemoveReviewerButton,
    addEventListenerToSaveConfigButton, addSelectValue, getSelectOptions, getSelectValue, populateSelect,
    removeSelectValue,
    selectAddReviewerId,
    selectProjectId, selectReviewersId, selectTeamId, setSelectValue
} from "../view/organization.mjs";


LoadData().then(async data => {
    console.log("Passou no carregamento");
    if (data) {
        const project = await fetchProjects();
        await populateSelect(selectProjectId, project);
        const team = await fetchTeams(project[0]);
        await populateSelect(selectTeamId, team);

        if (data.project && data.team && !data.listAvaiableReviewers && !data.selectedReviewers) {
            const reviewers = await fetchTeamMembersNames();
            await populateSelect(selectReviewersId, reviewers);
        }
        else if (data.listAvaiableReviewers && data.selectedReviewers) {
            await populateSelect(selectReviewersId, data.listAvaiableReviewers);
            await populateSelect(selectAddReviewerId, data.selectedReviewers);
        }
    }

    if (data.project) {
        setSelectValue(selectProjectId, data.project);
    }
    if (data.team) {
        setSelectValue(selectTeamId, data.team);
    }
});

addEventListenerToProjectSelect(async () => {
    const project = getSelectValue(selectProjectId);

    if (project) {
        try {
            const teams = await fetchTeams(project);
            populateSelect(selectTeamId, teams);
        } catch (error) {
            console.error('Erro ao carregar times:', error);
        }
    }
});

addEventListenerToSaveConfigButton(() => saveConfig(getSelectValue(selectProjectId), getSelectValue(selectTeamId)));

addEventListenerToAddReviewerButton(() => {
    var reviewerName = getSelectValue(selectReviewersId);
    addSelectValue(selectAddReviewerId, reviewerName);
    removeSelectValue(selectReviewersId, reviewerName);

    saveReviewersConfig(getSelectOptions(selectReviewersId), getSelectOptions(selectAddReviewerId));
});

addEventListenerToRemoveReviewerButton(() => {
    var reviewerName = getSelectValue(selectAddReviewerId);
    addSelectValue(selectReviewersId, reviewerName);
    removeSelectValue(selectAddReviewerId, reviewerName);

    saveReviewersConfig(getSelectOptions(selectReviewersId), getSelectOptions(selectAddReviewerId));
});

