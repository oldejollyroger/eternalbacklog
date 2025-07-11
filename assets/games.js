(function() {
    // ---- 1. CONFIGURATION & STATE ---- //
    // IMPORTANT: Replace these with the credentials you just got from Twitch!
    const CLIENT_ID = 'y021ru5dx7dwkfwnff71i0bfehbbx0';
    const CLIENT_SECRET = 'm9fdk0axx5nqqbsqa7s94ugrncfwmx'; // Replace with your actual Client Secret
    
    // This is a proxy to bypass browser CORS issues. It's a free, open-source tool.
    const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/'; 
    const TWITCH_AUTH_URL = 'https://id.twitch.tv/oauth2/token';
    const IGDB_API_URL = `${CORS_PROXY}https://api.igdb.com/v4/games`;

    let state = { /* ... state object from previous version ... */ };
    let allGames = []; // This will be populated by the API.
    let accessToken = null;

    // ---- 2. API CALL LOGIC ---- //
    
    /**
     * First, we need to get an Access Token from Twitch.
     * We send our Client ID and Secret to get this temporary password.
     */
    async function getAccessToken() {
        if (accessToken) return accessToken; // Don't fetch a new one if we already have one.

        const response = await fetch(`${TWITCH_AUTH_URL}?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`, {
            method: 'POST',
        });
        const data = await response.json();
        accessToken = data.access_token;
        return accessToken;
    }

    /**
     * This is the main function to fetch games from IGDB.
     * It uses a special query language called APICalypse.
     */
    async function fetchGamesFromIGDB() {
        const token = await getAccessToken();
        if (!token) {
            console.error("Could not retrieve Access Token!");
            return [];
        }

        // This is our query to IGDB. We ask for specific fields.
        // We filter for games with a cover, a rating of over 75, and from major platforms.
        const body = `
            fields name, cover.image_id, first_release_date, genres.name, platforms.abbreviation, summary, total_rating;
            where platforms = (6, 48, 49) & total_rating > 75 & cover != null;
            sort total_rating_count desc;
            limit 150;
        `;

        const response = await fetch(IGDB_API_URL, {
            method: 'POST',
            headers: {
                'Client-ID': CLIENT_ID,
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
            body: body
        });
        
        const gamesData = await response.json();
        return gamesData;
    }

    // ---- 3. DATA & RENDER HELPERS ---- //
    
    // Function to convert the API data into our internal format.
    function formatGameData(apiGame) {
        // Helper to get a full image URL from an image_id
        const getImageUrl = (imageId) => `https://images.igdb.com/igdb/image/upload/t_cover_big/${imageId}.jpg`;
        
        return {
            title: apiGame.name || "Unknown Title",
            platform: apiGame.platforms ? apiGame.platforms[0].abbreviation.toLowerCase() : 'N/A',
            genre: apiGame.genres ? apiGame.genres[0].name : "N/A",
            year: apiGame.first_release_date ? new Date(apiGame.first_release_date * 1000).getFullYear() : "N/A",
            imgUrl: apiGame.cover ? getImageUrl(apiGame.cover.image_id) : createSvgPlaceholder(apiGame.name),
            // We'll mock the rest of the data for now
            trophies: { bronze: Math.floor(Math.random() * 50) + 10 },
            difficulty: (Math.random() * 8 + 2).toFixed(1),
            avgCompletion: Math.floor(Math.random() * 60) + 5,
            length: Math.floor(Math.random() * 80) + 10,
        };
    }

    // Your createGameListItem and createSidebarCard functions are the same as before
    const createGameListItem = (game) => { /* ... Paste from previous working version ... */ };
    const createSidebarCard = (game) => { /* ... Paste from previous working version ... */ };
    const createSvgPlaceholder=(title,color='4A5568')=>{const w=title.split(' ');let l1='',l2='';for(const word of w){if((l1+word).length<15)l1+=`${word} `;else if((l2+w).length<15)l2+=`${word} `}const svg=`<svg width="254" height="140" viewBox="0 0 254 140" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#${color}"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" font-weight="bold" fill="#fff">${l1.trim()}</text></svg>`;return `data:image/svg+xml;base64,${btoa(svg)}`};


    // ---- 4. MAIN RENDER LOGIC ---- //
    // render() and renderSidebar() functions are also the same as before
    function render() { /* ... Paste from previous working version ... */ }
    function renderSidebar() { /* ... Paste from previous working version ... */ }

    // ---- 5. INITIALIZATION ---- //
    async function init() {
        try {
            const gameDataFromApi = await fetchGamesFromIGDB();
            allGames = gameDataFromApi.map(formatGameData); // Convert API data to our format
            
            renderSidebar();
            render(); // Initial render with real data!

            // Setup event listeners after data has loaded
            // ... Your event listeners for filters, search, and pagination go here ...

        } catch (error) {
            console.error("Failed to initialize page:", error);
            const gameListContainer = document.getElementById('game_list_container');
            if(gameListContainer) {
                gameListContainer.innerHTML = `<div class="text-red-400 text-center p-8">Failed to load game data. Please try again later.</div>`;
            }
        }
    }
    
    document.addEventListener('DOMContentLoaded', init);
})();