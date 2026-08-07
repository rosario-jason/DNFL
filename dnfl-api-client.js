// dnfl-api-client.js
const DNFLClient = {
    // Points directly to your secure, branded Render proxy cache subdomain
    baseUrl: "https://api.dnfl.live/api",

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
        
        // 3. Normalize endpoint names to lowercase to perfectly match the backend automated routes
        const cleanEndpoint = endpoint.toLowerCase();
        
        try {
            // Forces clean string construction to avoid browser double-slash bugs
            const fullTargetUrl = this.baseUrl + "/" + cleanEndpoint + urlParams;
            
            console.log("DNFL Debug - Tunneling to URL:", fullTargetUrl);
            
            const response = await fetch(fullTargetUrl);
            if (!response.ok) throw new Error(`Network failure on endpoint path: ${cleanEndpoint}`);
            return await response.json();
        } catch (error) {
            console.error("DNFL Network Core Exception:", error);
            return null;
        }
    }
};
