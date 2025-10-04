import { LoadData, fetchProjects, fetchTeamMembersNames, fetchTeams, saveConfig } from "../model/organization.mjs";
import {
    addEventListenerToAddReviewerButton,
    addEventListenerToProjectSelect,
    addEventListenerToRemoveReviewerButton,
    addEventListenerToSaveConfigButton, addSelectValue, getSelectValue, populateSelect,
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

        if (data.project && data.team) {
            const reviewers = await fetchTeamMembersNames();
            await populateSelect(selectReviewersId, reviewers);
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
});

addEventListenerToRemoveReviewerButton(() => {
    var reviewerName = getSelectValue(selectAddReviewerId);
    addSelectValue(selectReviewersId, reviewerName);
    removeSelectValue(selectAddReviewerId, reviewerName);
});

