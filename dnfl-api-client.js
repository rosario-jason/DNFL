// dnfl-api-client.js
const DNFLClient = {
    baseUrl: "https://dnfl.live",

    async fetchData(endpoint) {
        // 1. Gather browser context variables natively tracked by MFL
        const leagueId = window.league_id || "22972"; 
        const year     = window.current_year || new Date().getFullYear();
        const myTeam   = window.franchise_id || "";

        // 2. Append parameters dynamically to your backend cache tunnel request string
        const urlParams = `?L=${leagueId}&YEAR=${year}&MY_FRANCHISE=${myTeam}`;
        
        try {
            const response = await fetch(`${this.baseUrl}/${endpoint}${urlParams}`);
            if (!response.ok) throw new Error(`Network failure on: ${endpoint}`);
            return await response.json();
        } catch (error) {
            console.error("DNFL Network Core Exception:", error);
            return null;
        }
    }
};
