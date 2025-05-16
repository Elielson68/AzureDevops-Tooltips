import { StartModule as StartModal } from "./view/modal.mjs";
import { StartModule as StartApiZure } from "./model/api_azure.mjs";

export function StartModules() {
    StartModal();
    StartApiZure();
}