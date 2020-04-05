import addonData from "./addonData";

/**
 * Queries for the first match of a given selector within a given element. A
 * convenience shorthand for the `Element.querySelector()` method.
 *
 * @param {string} selector - The selector to query.
 * @param {ParentNode} context - The node on which to perform the query.
 *
 * @returns {Element} The first element that matches the passed selector in the given context.
 */
export function qs(selector, context = document) {
    return context.querySelector(selector);
}

/**
 * Queries for all matches of a given selector within a given element. A
 * convenience shorthand for the `Element.querySelectorAll()` method.
 *
 * @param {string} selector - The selector to query.
 * @param {ParentNode} context - The node on which to perform the query.
 *
 * @returns {NodeListOf<Element>} All elements that match the passed selector in the given context.
 */
export function qsa(selector, context = document) {
    return context.querySelectorAll(selector);
}

/**
 * Apply the settings from a particular tailoring treatment to the
 * appropriate attributes of an HTML element.
 *
 * @param {object} tailoringTreatment - The tailoring treatment to apply styles from.
 * @param {object} elementToStyle - The HTML element to apply the treatment's properties to.
 */
export function applyTailoringTreatmentToElement(
    tailoringTreatment,
    elementToStyle
) {
    const element = elementToStyle;

    // Style the supplied element with 8-character hex notation.
    element.style.backgroundColor = tailoringTreatment.backgroundColor;
    element.style.borderColor = tailoringTreatment.borderColor;
}

/**
 * Generates a new unique tailoring entry ID.
 *
 * @param {Number} maxRandomInt The multiplication factor to apply to the random ID generation.
 */
export function generateTailoringEntryID(maxRandomInt = 100000) {
    const currentTimestamp = Date.now();
    const randomInt = Math.floor(Math.random() * Math.floor(maxRandomInt));

    return `${currentTimestamp}-${randomInt}`;
}

/**
 * Retrieves the addon's current user data using the browser storage API and
 * saves a local working copy. If the requested data isn't found, it falls
 * back to the addon's defined default values.
 *
 * @returns {Promise} A Promise resolving to the data saved as the local working copy.
 */
export function getUserData() {
    const requestedStorageData = ["tailoringEntries"];

    const userDataPromise = new Promise((resolve, reject) => {
        browser.storage.sync
            .get(requestedStorageData)
            .then(storageData => {
                requestedStorageData.forEach(dataType => {
                    addonData.runtime[dataType] = [];

                    if (storageData[dataType] && storageData[dataType].length) {
                        addonData.runtime[dataType] = storageData[dataType];
                    } else {
                        addonData.runtime[dataType] =
                            addonData.defaultUserData[dataType];
                    }
                });

                resolve(addonData.runtime);
            })
            .catch(error => reject(error));
    });

    return userDataPromise;
}

/**
 * Logs an error.
 *
 * @param {*} error The error output to log.
 */
export function logError(error) {
    console.error(error);
}

/**
 * Save the current tailoring entries via the browser storage API.
 */
export function saveTailoringEntries() {
    // Get the settings of all existing entry objects. This is largely to make
    // sure we get them in the order represented in the popup UI.
    const entrySettings = addonData.runtime.tailoringEntryObjects.map(
        entryObject => entryObject.settings
    );

    browser.storage.sync
        .set({ tailoringEntries: entrySettings })
        .then(null, logError);
}
