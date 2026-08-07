// dnfl-header-script.js
(function() {
    // ==========================================
    // 1. MASTER SCRIPT REGISTRY
    // Add script names to load
    // ==========================================
    const SCRIPTS_TO_LOAD = [
        "dnfl-api-client.js",
        "dnfl-standings.js"
        
        // Add Additional MFL Script Components Here (e.g., "dnfl-transactions.js")
    ];

    // ==========================================
    // 2. CHRONOLOGICAL INJECTION ENGINE
    // Forces the browser to load scripts in the exact order they are listed
    // ==========================================
    const baseUrl = "https://dnfl.live";
    // Use a unique version cache-buster string based on the current date/time
    const cacheBuster = "?v=" + new Date().getTime(); 

    function loadScriptSequentially(index) {
        if (index >= SCRIPTS_TO_LOAD.length) {
            console.log("🚀 All DNFL Framework Modules initialized successfully.");
            return;
        }

        const scriptName = SCRIPTS_TO_LOAD[index];
        const scriptElement = document.createElement("script");
        
        scriptElement.src = baseUrl + scriptName + cacheBuster;
        scriptElement.type = "text/javascript";
        
        // When this file finishes loading, trigger the next file in line immediately
        scriptElement.onload = function() {
            loadScriptSequentially(index + 1);
        };

        scriptElement.onerror = function() {
            console.error("❌ DNFL Loader Exception: Failed to execute layer " + scriptName);
            // Skip the broken file and continue loading the remaining scripts
            loadScriptSequentially(index + 1);
        };

        // Append the script element tag to the page layout head container block
        document.head.appendChild(scriptElement);
    }

    // Kick off the loading sequence starting at the first script (Index 0)
    loadScriptSequentially(0);
})();
