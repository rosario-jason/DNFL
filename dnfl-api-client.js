// dnfl-api-client.js
const DNFLClient = {
    baseUrl: "https://api.dnfl.live",

    async fetchData(endpoint) {
        // 1. Gather browser context variables natively supplied by MFL
        const leagueId = window.league_id || null; 
        const myTeam   = window.franchise_id || null;
        
        // Dynamic User API Key: Checks window context first, then looks inside URL parameters string
        const urlParamsCheck = new URLSearchParams(window.location.search);
        const dynamicUserKey = window.apiKey || urlParamsCheck.get('APIKEY') || null;

        // Smart Year Extractor: Checks window variable first. If empty, it inspects 
        // the actual URL path bar (e.g., /2026/home/) to extract the target year cleanly.
        let targetYear = window.current_year || null;
        if (!targetYear) {
            const pathSegments = window.location.pathname.split('/');
            // Loops through segments to identify a 4-digit number starting with '20'
            const foundYear = pathSegments.find(segment => /^20\d{2}$/.test(segment));
            targetYear = foundYear ? foundYear : new Date().getFullYear();
        }

        // 2. Dynamically construct the query parameters string matching the backend criteria
        let queryParts = [];
        if (leagueId)       queryParts.push(`L=${leagueId}`);
        if (targetYear)     queryParts.push(`YEAR=${targetYear}`);
        if (myTeam)         queryParts.push(`MY_FRANCHISE=${myTeam}`);
        if (dynamicUserKey) queryParts.push(`APIKEY=${dynamicUserKey}`);
        
        const urlParams = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
        const cleanEndpoint = endpoint.toLowerCase();
        
        try {
            const response = await fetch(`${this.baseUrl}/${cleanEndpoint}${urlParams}`);
            if (!response.ok) throw new Error(`Network failure on endpoint path: ${cleanEndpoint}`);
            return await response.json();
        } catch (error) {
            console.error("DNFL Network Core Exception:", error);
            return null;
        }
    }
};
