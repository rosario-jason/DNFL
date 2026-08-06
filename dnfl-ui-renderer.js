// dnfl-ui-renderer.js
document.addEventListener("DOMContentLoaded", async () => {
    // 1. Determine who is currently logged into the MFL viewport
    const currentViewerId = DNFLClient.getActiveFranchiseId();
    
    // 2. Safely call the universal rosters file out of your proxy cache server
    const rosterData = await DNFLClient.fetchData("rosters");
    
    if (rosterData && currentViewerId) {
        renderDnflUserDashboard(rosterData, currentViewerId);
    } else if (!currentViewerId) {
        console.log("No league franchise owner detected. Showing standard homepage layout.");
    }
});

function renderDnflUserDashboard(rosterData, franchiseId) {
    // Targets the unique injection div tag container set inside your page body
    const placementContainer = document.getElementById("dnfl-welcome-dashboard");
    if (!placementContainer) return; 

    const allFranchises = rosterData.rosters.franchise;
    const individualTeam = allFranchises.find(f => f.id === franchiseId);

    if (individualTeam) {
        // Construct the layout grid elements natively
        placementContainer.innerHTML = `
            <div class="dnfl-custom-card">
                <h3>Welcome back to the DNFL!</h3>
                <p>Viewing Team ID: <strong>${franchiseId}</strong></p>
                <div id="dnfl-roster-list">Processing your team roster...</div>
            </div>
        `;
    }
}
