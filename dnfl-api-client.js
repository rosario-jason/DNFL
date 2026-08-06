// dnfl-api-client.js
const DNFLClient = {
    baseUrl: "https://api.dnfl.live/api",

    async fetchData(endpoint) {
        // 1. Gather browser context variables natively supplied by MFL layout engine
        const leagueId = window.league_id || null; 
        const year     = window.current_year || null;
        const myTeam   = window.franchise_id || null;
        
        // DYNAMIC UPGRADE: Automatically read the active user's long-lived session key token
        const dynamicUserKey = window.apiKey || null;

        // 2. Dynamically construct the query string using only available values
        let queryParts = [];
        if (leagueId)       queryParts.push(`L=${leagueId}`);
        if (year)           queryParts.push(`YEAR=${year}`);
        if (myTeam)         queryParts.push(`MY_FRANCHISE=${myTeam}`);
        if (dynamicUserKey) queryParts.push(`APIKEY=${dynamicUserKey}`); // Pass key down to Render
        
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
