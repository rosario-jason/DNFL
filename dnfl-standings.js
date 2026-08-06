// dnfl-standings.js
document.addEventListener("DOMContentLoaded", async () => {
    // Fetch both datasets concurrently from your loop-driven Render proxy cache
    const [standingsResponse, leagueResponse] = await Promise.all([
        DNFLClient.fetchData("leaguestandings"),
        DNFLClient.fetchData("league")
    ]);
    
    if (standingsResponse && leagueResponse) {
        renderDnflCustomStandings(standingsResponse, leagueResponse);
    } else {
        console.error("DNFL Standings Error: Failed to gather necessary cached data streams.");
    }
});

function renderDnflCustomStandings(standingsData, leagueData) {
    const tableContainer = document.getElementById("dnfl-standings-table");
    if (!tableContainer) return; // Exit silently if the visual placeholder isn't present on this page

    try {
        const franchises = standingsData.leagueStandings.franchise;
        const leagueDetails = leagueData.league.franchises.franchise;
        
        if (!franchises || !leagueDetails) throw new Error("Missing structural data maps.");

        // 1. Build the Standard MFL Report Wrapper Frame
        let tableHtml = `
            <div class="reportwrapper">
                <table class="report">
                    <caption>
                        <span>DNFL League Standings</span>
                    </caption>
                    <thead>
                        <tr class="reportheader">
                            <th><span>Rank</span></th>
                            <th><span>Team</span></th>
                            <th><span>Record (H2H)</span></th>
                            <th><span>Avg PF</span></th>
                            <th><span>Avg PA</span></th>
                            <th><span>BBID Budget</span></th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        // 2. Loop Through Teams and Generate Alternating Table Rows
        franchises.forEach((team, index) => {
            const profile = leagueDetails.find(f => f.id === team.id);
            const teamName = profile ? profile.name : `Franchise ${team.id}`;
            const logoUrl = profile ? profile.icon : "";
            const bbid = profile ? (profile.bbidBalance || "0") : "0";

            // Sourced directly out of the expanded ALL=1 dataset fields
            const wins = team.h2hw || "0";
            const losses = team.h2hl || "0";
            const ties = team.h2ht || "0";
            
            // Format to two decimal places
            const avgPf = parseFloat(team.avgpf || 0).toFixed(2);
            const avgPa = parseFloat(team.avgpa || 0).toFixed(2);

            // Dynamic Row Styling Classifier Loop (Alternates row-by-row)
            const rowClass = (index % 2 === 0) ? "oddtablerow" : "eventablerow";

            const iconMarkup = logoUrl 
                ? `<img src="${logoUrl}" alt="" style="width:24px; height:24px; border-radius:50%; vertical-align:middle; margin-right:8px;">` 
                : `<span style="margin-right:8px;">🏈</span>`;

            // Append row values mapping cleanly to MFL's tag format structure
            tableHtml += `
                <tr class="${rowClass}">
                    <td><span>${index + 1}</span></td>
                    <td>
                        <span>
                            ${iconMarkup}
                            ${teamName}
                        </span>
                    </td>
                    <td><span><strong>${wins}-${losses}-${ties}</strong></span></td>
                    <td><span>${avgPf}</span></td>
                    <td><span>${avgPa}</span></td>
                    <td><span>$${bbid}</span></td>
                </tr>
            `;
        });

        tableHtml += `
                    </tbody>
                </table>
            </div>
        `;

        // 3. Inject the compiled element into your target page placeholder
        tableContainer.innerHTML = tableHtml;

    } catch (error) {
        console.error("HTML Generation Breakdown:", error);
        tableContainer.innerHTML = `<div class="reportwrapper"><p>Standings dashboard generation failed parsing configuration.</p></div>`;
    }
}
