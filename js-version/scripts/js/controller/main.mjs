import { getInputTokenValue, setEventListenerToSaveTokenButton, setInputTokenValue } from "/scripts/js/view/main.mjs";
import { getTokenValue, setTokenValue } from "/scripts/js/model/main.mjs";

async function populeInputTokenValue() {
    const token = await getTokenValue();
    setInputTokenValue(token);
}

async function saveTokenValue() {
    const token = getInputTokenValue();
    await setTokenValue(token);
}

populeInputTokenValue();
setEventListenerToSaveTokenButton(() => {
    saveTokenValue();
});
