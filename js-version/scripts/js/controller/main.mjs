import { getInputOrganizationValue, getInputTokenValue, setEventListenerToSaveTokenButton, setInputOrganizationValue, setInputTokenValue } from "../view/main.mjs";
import { getTokenValue, saveValues } from "../model/main.mjs";

async function populeInputTokenValue() {
    const [token, organization] = await getTokenValue();
    setInputTokenValue(token);
    setInputOrganizationValue(organization);
}

async function save() {
    const token = getInputTokenValue();
    const organization = getInputOrganizationValue();
    await saveValues(token, organization);
}

populeInputTokenValue();
setEventListenerToSaveTokenButton(() => {
    save();
});
