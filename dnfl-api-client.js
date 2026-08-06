// dnfl-api-client.js
const DNFLClient = {
    // Points directly to your secure, branded Render proxy cache subdomain
    baseUrl: "https://api.dnfl.live/api",

    // Central fetch interface to connect your components to your server cache
    async fetchData(endpoint) {
        // 1. Gather browser context variables natively supplied by MFL (defaults to null if missing)
        const leagueId = window.league_id || null; 
        const year     = window.current_year || null;
        const myTeam   = window.franchise_id || null;

        // 2. Dynamically construct the query string using only available values
        let queryParts = [];
        if (leagueId) queryParts.push(`L=${leagueId}`);
        if (year)     queryParts.push(`YEAR=${year}`);
        if (myTeam)   queryParts.push(`MY_FRANCHISE=${myTeam}`);
        
        const urlParams = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
        
        // 3. Normalize endpoint names to lowercase to perfectly match the backend automated routes
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
