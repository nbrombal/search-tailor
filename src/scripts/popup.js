const addonData = require("./addonData");
const addonFunctions = require("./addonFunctions");
const TailoringGroup = require("./TailoringGroup");
const TailoringEntry = require("./TailoringEntry");

/**
 * Namespace for popup-related properties & methods.
 */
const popup = {
    /**
     * Creates a Tailoring Group for each existing treatment in the user data,
     * adding it to the current working list of all Tailoring Groups.
     */
    initializeGroups() {
        addonData.local.tailoringTreatments.forEach(tailoringTreatment => {
            addonData.local.tailoringGroups.push(
                new TailoringGroup(tailoringTreatment)
            );
        });
    },

    /**
     * Creates a Tailoring Entry for each existing entry in the user data,
     * adding it to the entry list of the Tailoring Group to which it belongs.
     */
    initializeEntries() {
        addonData.local.tailoringEntries.forEach(tailoringEntry => {
            addonFunctions
                .getTailoringGroupByTreatmentID(tailoringEntry.treatment)
                .entries.push(new TailoringEntry(tailoringEntry));
        });
    },

    /**
     * Initializes the addon's popup UI.
     */
    initialize() {
        this.initializeGroups();
        this.initializeEntries();
    },
};

// Get the current user data, then initialize the popup UI.
addonFunctions.getUserData().then(() => popup.initialize());
