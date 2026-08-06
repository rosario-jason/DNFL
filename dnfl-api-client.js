// dnfl-api-client.js
const DNFLClient = {
    // Replace this string with your production Render Web Service URL link
    baseUrl: "https://onrender.com",

    // Central fetch interface to target your backend cache tier
    async fetchData(endpoint) {
        try {
            const response = await fetch(`${this.baseUrl}/${endpoint}`);
            if (!response.ok) throw new Error(`Network issue requesting: ${endpoint}`);
            return await response.json();
        } catch (error) {
            console.error("DNFL API Client Error:", error);
            return null;
        }
    },

    // Grabs the browser window context identity parameter provided by MFL
    getActiveFranchiseId() {
        return window.franchise_id || "";
    }
};
