/* global addonData */

function logError(error) {
    console.error(error);
}

/* Class representing a user's search that is eligible for tailoring. */
class TailorableSearch {
    /**
     * Create a new Tailorable Search, attached to the current window.
     * @param {object} searchWindow - The window object of the tab containing a
     * valid search.
     */
    constructor(searchWindow) {
        this.document = searchWindow.document;

        // Identify which of the predefined search engines we're targeting,
        // returning if one isn't found.
        this.searchEngine = addonData.searchEngines.find(searchEngine =>
            RegExp(searchEngine.matchPattern).test(searchWindow.location)
        );

        if (!this.searchEngine) return false;

        this.tailorResults();
    }

    /**
     * Get the current search result container.
     */
    get searchResultsContainer() {
        return this.document.querySelector(
            this.searchEngine.selectors.resultContainer
        );
    }

    /**
     * Get all current search results.
     */
    get searchResults() {
        return this.searchResultsContainer.querySelectorAll(
            this.searchEngine.selectors.result
        );
    }

    /**
     * Get all current search results that have a treatment applied to them.
     */
    get tailoredResults() {
        return this.searchResultsContainer.querySelectorAll(
            ".spotlight, .suppress, .screen"
        );
    }

    /**
     * Remove all treatment classes from the current search results.
     */
    resetTailoring() {
        this.tailoredResults.forEach(tailoredResult =>
            tailoredResult.classList.remove("spotlight", "suppress", "screen")
        );
    }

    /**
     * Get the current user-defined list of tailored domains, then apply fresh
     * treatments to matching search results.
     */
    tailorResults() {
        this.resetTailoring();

        /**
         * Apply the appropriate treatment class to each result that matches an
         * entry from the user-defined list of tailored domains.
         * @param {object} storageData - Freshly retrieved data from the extension's synchronized storage.
         */
        const applyTailoringTreatments = storageData => {
            // If this search engine loads results asynchronously, watch its
            // results container for changes.
            if (this.searchEngine.observe) this.setUpObserver();

            // Cache the current search results.
            const currentSearchResults = Array.from(this.searchResults);

            // Filter the search results against each user-defined tailored
            // domain, applying treatments to matching results.
            storageData.tailoredDomains.forEach(tailoredDomain => {
                const matchingResults = currentSearchResults.filter(result =>
                    RegExp(`.*://.*.?${tailoredDomain.domain}.*`).test(
                        result.querySelector(
                            this.searchEngine.selectors.resultLink
                        )
                    )
                );

                matchingResults.forEach(matchingResult =>
                    matchingResult.classList.add(tailoredDomain.treatment)
                );
            });
        };

        browser.storage.sync
            .get(addonData.defaultUserData)
            .then(applyTailoringTreatments, logError);
    }

    /**
     * Observe mutations to this search page's results container, tailoring the
     * results appropriately whenever they change.
     */
    setUpObserver() {
        // Disconnect any existing observers.
        if (this.searchObserver) this.searchObserver.disconnect();

        // Create a new observer to tailor currently-matching domains on
        // mutation.
        this.searchObserver = new MutationObserver(() => this.tailorResults());

        // Have the observer watch for changes to the current page's search
        // results.
        this.searchObserver.observe(this.searchResultsContainer, {
            childList: true,
        });
    }
}

const currentSearch = (function initAddon() {
    /**
     * Check and set a global guard variable.
     * If this content script is injected into the same page again, it will do
     * nothing next time.
     */

    if (window.hasRun) return null;

    window.hasRun = true;

    return new TailorableSearch(window);
})();

// Listen for storage updates, retailoring on change
browser.storage.onChanged.addListener(() => currentSearch.tailorResults());
