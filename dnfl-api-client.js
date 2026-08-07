// dnfl-api-client.js
const DNFLClient = {
    // ==========================================
    // 1. CACHE TIERS CONFIGURATION
    // ==========================================
    CACHE_CONFIGS: {
        weekly:    7 * 24 * 60 * 60 * 1000, // 7 days
        daily:     24 * 60 * 60 * 1000,     // 24 hours
        hourly:    1 * 60 * 60 * 1000,      // 1 hour
        realtime:  30 * 1000                // 30 seconds
    },

    // ==========================================
    // 2. DYNAMIC MFL REQUEST REGISTRY
    // Format: ['frequency', 'MflRequestType(case-sensitive)', includeLeague(true/false), 'mflArgs']
    // ==========================================
    MFL_REQUEST_REGISTRY: [
        ['daily',    'league',           true,  ''],
        ['daily',    'leagueStandings',  true,  '&COLUMN_NAMES=1&ALL=1']
        
        // Add Additional MFL API Requests Here (Simply append a clean row matching this framework layout)
    ],

    async fetchData(MflRequestType) {
        // Find matching row mapping within your single-line registry array
        const config = this.MFL_REQUEST_REGISTRY.find(row => row[1] === MflRequestType);
        
        if (!config) {
            console.error("DNFL Client Error: Request type [" + MflRequestType + "] not defined in registry.");
            return null;
        }

        // Destructure array parameters sequentially by column index positions
        const [frequency, , includeLeague, mflArgs] = config;

        // Gather browser context variables natively supplied by MFL layout engine
        const leagueId = window.league_id || null;
        const apiKey = window.apiKey || new URLSearchParams(window.location.search).get('APIKEY') || null;

        // Dynamic Host Extractor: Grabs active server subdomain (e.g. '://myfantasyleague.com')
        const activeHost = window.location.hostname || "://myfantasyleague.com";

        // Smart Year Extractor: Inspects URL path bar to find the target year safely
        let targetYear = window.current_year || null;
        if (!targetYear) {
            const pathSegments = window.location.pathname.split('/');
            const foundYear = pathSegments.find(segment => /^20\d{2}$/.test(segment));
            targetYear = foundYear ? foundYear : new Date().getFullYear();
        }

        if (includeLeague && !leagueId) {
            console.error("DNFL Client Error: " + MflRequestType + " requires an active League ID context.");
            return null;
        }

        // Setup local browser caching (localStorage) mechanics keys
        const leagueSegment = (includeLeague && leagueId) ? "L" + leagueId : 'GLOBAL';
        const cacheKey = "dnfl_" + MflRequestType + "_" + leagueSegment + "_Y" + targetYear;
        
        const cachedRecord = localStorage.getItem(cacheKey);
        const currentTime = Date.now();
        const allowedTtl = this.CACHE_CONFIGS[frequency];

        // CACHE HIT: Securely loads from browser memory without exposing authorization key variables
        if (cachedRecord) {
            const parsedRecord = JSON.parse(cachedRecord);
            if (currentTime - parsedRecord.timestamp < allowedTtl) {
                console.log("[" + MflRequestType + "] - Loading from DNFL browser cache");
                return parsedRecord.payload;
            }
        }

        // CACHE MISS: Formats clean outbound connection string without attaching credential tokens
        try {
            console.log("[" + MflRequestType + "] - API request from https://" + activeHost + "/" + targetYear + "/export?TYPE=" + MflRequestType);
            
            let mflUrl = "https://" + activeHost + "/" + targetYear + "/export?TYPE=" + MflRequestType + "&JSON=1";
            
            if (includeLeague && leagueId) mflUrl += "&L=" + leagueId.toString().trim();
            if (apiKey)                   mflUrl += "&APIKEY=" + apiKey.toString().trim();
            if (mflArgs)                  mflUrl += mflArgs.toString().trim();
            
            const response = await fetch(mflUrl);
            if (!response.ok) throw new Error("MFL Server rejected connection request.");
            
            const data = await response.json();

            // Store payload inside local browser memory storage
            const recordToCache = {
                timestamp: currentTime,
                payload: data
            };
            localStorage.setItem(cacheKey, JSON.stringify(recordToCache));

            return data;
        } catch (error) {
            console.error("DNFL Network Exception [" + MflRequestType + "]:", error.message);
            if (cachedRecord) {
                console.warn("Serving expired stale fallback cache data for [" + MflRequestType + "].");
                return JSON.parse(cachedRecord).payload;
            }
            return null;
        }
    }
};
