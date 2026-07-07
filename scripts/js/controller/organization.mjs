import { LoadData, fetchProjects, fetchTeamMembers, fetchTeams, saveConfig, saveReviewersConfig } from "../model/organization.mjs";
import {
    addEventListenerToAddReviewerButton,
    addEventListenerToProjectSelect,
    addEventListenerToRemoveReviewerButton,
    addEventListenerToSaveConfigButton, addReviewerOption, getSelectedReviewer, getSelectOptions, getSelectValue, populateSelect,
    removeSelectValue,
    selectAddReviewerId,
    selectProjectId, selectReviewersId, selectTeamId, setSelectValue
} from "../view/organization.mjs";

export async function init() {
    const data = await LoadData();
    console.log("Passou no carregamento");
    if (data) {
        const projects = await fetchProjects();
        await populateSelect(selectProjectId, projects);
        const teams = await fetchTeams(projects[0]);
        await populateSelect(selectTeamId, teams);

        if (data.project && data.teamName && !data.reviewersConfigured) {
            const members = await fetchTeamMembers();
            await populateSelect(selectReviewersId, members);
        }
        else if (data.reviewersConfigured) {
            await populateSelect(selectReviewersId, data.available);
            await populateSelect(selectAddReviewerId, data.selected);
        }
    }

    if (data.project) {
        setSelectValue(selectProjectId, data.project);
    }
    if (data.teamName) {
        setSelectValue(selectTeamId, data.teamName);
    }

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
        const reviewer = getSelectedReviewer(selectReviewersId);
        if (!reviewer) return;
        addReviewerOption(selectAddReviewerId, reviewer);
        removeSelectValue(selectReviewersId, reviewer.id);

        saveReviewersConfig(getSelectOptions(selectReviewersId), getSelectOptions(selectAddReviewerId));
    });

    addEventListenerToRemoveReviewerButton(() => {
        const reviewer = getSelectedReviewer(selectAddReviewerId);
        if (!reviewer) return;
        addReviewerOption(selectReviewersId, reviewer);
        removeSelectValue(selectAddReviewerId, reviewer.id);

        saveReviewersConfig(getSelectOptions(selectReviewersId), getSelectOptions(selectAddReviewerId));
    });
}
