// dnfl-api-client.js
const DNFLClient = {
    // ==========================================
    // 1. CACHE TIERS CONFIGURATION
    // ==========================================
    CACHE_CONFIGS: {
        weekly:    7 * 24 * 60 * 60 * 1000, // 7 days (For unchanging historical data)
        daily:     24 * 60 * 60 * 1000,     // 24 hours (For structures like general league rules)
        hourly:    1 * 60 * 60 * 1000,      // 1 hour (For active processing like trades/waivers)
        realtime:  30 * 1000                // 30 seconds (For live game-day scoring tracking)
    },

    // ==========================================
    // 2. DYNAMIC MFL REQUEST REGISTRY
    // Format: ['frequency', 'MflRequestType(case-sensitive)', includeLeague(true/false), 'mflArgs']
    // ==========================================
    MFL_REQUEST_REGISTRY: [
        ['daily',    'league',           true,  ''],
        ['daily',    'leagueStandings',  true,  '&COLUMN_NAMES=1&ALL=1']
        
        // Add Additional MFL API Requests Here (e.g. ['hourly', 'transactions', true, '&DAYS=30'])
    ],

    async fetchData(MflRequestType) {
        // 1. Scan the registry array to look up our specific configuration values
        const config = this.MFL_REQUEST_REGISTRY.find(row => row[1] === MflRequestType);
        
        if (!config) {
            console.error(`DNFL Client Error: Request type [${MflRequestType}] not defined in registry.`);
            return null;
        }

        // Destructure array parameters seamlessly to match our backend variable names
        const [frequency, , includeLeague, mflArgs] = config;

        // 2. Gather browser context variables natively supplied by MFL layout engine
        const leagueId = window.league_id || null;
        const targetYear = window.current_year || new Date().getFullYear();
        const apiKey = window.apiKey || new URLSearchParams(window.location.search).get('APIKEY') || null;

        if (includeLeague && !leagueId) {
            console.error(`DNFL Client Error: ${MflRequestType} requires an active League ID context.`);
            return null;
        }

        // 3. Setup local browser caching (localStorage) mechanics
        const leagueSegment = (includeLeague && leagueId) ? `L${leagueId}` : 'GLOBAL';
        const cacheKey = `dnfl_${MflRequestType}_${leagueSegment}_Y${targetYear}`;
        
        const cachedRecord = localStorage.getItem(cacheKey);
        const currentTime = Date.now();
        const allowedTtl = this.CACHE_CONFIGS[frequency];

        // CACHE HIT: If fresh data is saved locally, bypass MFL and return it instantly
        if (cachedRecord) {
            const parsedRecord = JSON.parse(cachedRecord);
            if (currentTime - parsedRecord.timestamp < allowedTtl) {
                console.log(`DNFL Cache Hit [${MflRequestType}] - Loading from browser storage.`);
                return parsedRecord.payload;
            }
        }

        // CACHE MISS: Query MFL directly from the user's secure, trusted browser IP connection
        try {
            let mflUrl = `https://myfantasyleague.com{targetYear}/export?TYPE=${MflRequestType}&JSON=1`;
            
            if (includeLeague && leagueId) mflUrl += `&L=${leagueId.toString().trim()}`;
            if (apiKey)                   mflUrl += `&APIKEY=${apiKey.toString().trim()}`;
            if (mflArgs)                  mflUrl += mflArgs.toString().trim();

            console.log(`DNFL Cache Miss [${MflRequestType}] - Fetching natively from trusted user IP: ${mflUrl}`);
            
            const response = await fetch(mflUrl);
            if (!response.ok) throw new Error(`MFL Server rejected connection request.`);
            
            const data = await response.json();

            // Store payload inside local browser memory storage
            const recordToCache = {
                timestamp: currentTime,
                payload: data
            };
            localStorage.setItem(cacheKey, JSON.stringify(recordToCache));

            return data;
        } catch (error) {
            console.error(`DNFL Network Exception [${MflRequestType}]:`, error.message);
            // Fallback: If MFL is down or rate-limiting, show the stale cache so the page stands
            if (cachedRecord) {
                console.warn(`Serving expired stale fallback cache data for [${MflRequestType}].`);
                return JSON.parse(cachedRecord).payload;
            }
            return null;
        }
    }
};
