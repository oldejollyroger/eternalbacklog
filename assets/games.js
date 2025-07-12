// This is the simplest possible working version to fetch and display games.
// It uses the AllOrigins proxy to bypass CORS issues reliably.

document.addEventListener('DOMContentLoaded', async function() {

    // ---- 1. CONFIGURATION ---- //
    // IMPORTANT: Replace these with your actual credentials from Twitch!
    const CLIENT_ID = 'y021ru5dx7dwkfwnff71i0bfehbbx0';
    const CLIENT_SECRET = 'm9fdk0axx5nqqbsqa7s94ugrncfwmx';

    // The AllOrigins proxy URL. We will prepend this to the IGDB URL.
    const PROXY_URL = 'https://api.allorigins.win/raw?url=';
    const TWITCH_AUTH_URL = 'https://id.twitch.tv/oauth2/token';
    const IGDB_API_URL = 'https://api.igdb.com/v4/games';

    // ---- 2. GET HTML ELEMENTS ---- //
    const gameListContainer = document.getElementById('game-list-container');
    const loadingMessage = document.getElementById('loading-message');

    if (!gameListContainer) {
        console.error("Fatal Error: Could not find the #game-list-container element on the page.");
        return;
    }

    // ---- 3. API CALL LOGIC ---- //
    async function getAccessToken() {
        // We do NOT proxy the Twitch auth call. It's already configured for browser use.
        const url = `${TWITCH_AUTH_URL}?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`;
        const response = await fetch(url, { method: 'POST' });
        if (!response.ok) {
            throw new Error('Could not get Access Token from Twitch. Check your Client ID and Secret.');
        }
        const data = await response.json();
        return data.access_token;
    }

    async function fetchGames(token) {
        const body = 'fields name, cover.image_id; where platforms = (6,48,49,167,169) & total_rating_count > 500 & cover != null; limit 30;';
        
        // ** THIS IS THE KEY CHANGE **
        // We prepend the PROXY_URL to the IGDB_API_URL.
        const response = await fetch(`${PROXY_URL}${IGDB_API_URL}`, {
            method: 'POST',
            headers: {
                'Client-ID': CLIENT_ID,
                'Authorization': `Bearer ${token}`,
                // We send the 'body' as a string in the header for the proxy to forward it.
                // This is a specific requirement for how this proxy handles POST requests.
                'X-Request-Body': body,
            }
        });

        if (!response.ok) {
            throw new Error('Could not fetch game data from IGDB via proxy.');
        }
        // The AllOrigins proxy returns the raw text, so we need to parse it as JSON ourselves.
        const responseText = await response.text();
        return JSON.parse(responseText);
    }

    // ---- 4. RENDER FUNCTION ---- //
    function createGameListItem(game) {
        const imageUrl = game.cover ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg` : 'https://placehold.co/90x120?text=No+Art';
        return `
            <li class="bg-gray-800 p-4 rounded-lg flex items-center gap-4">
                <img src="${imageUrl}" alt="${game.name}" class="w-16 h-20 object-cover rounded-md flex-shrink-0">
                <h3 class="font-bold text-lg text-white">${game.name || 'Unknown Title'}</h3>
            </li>
        `;
    }

    // ---- 5. MAIN EXECUTION ---- //
    try {
        const token = await getAccessToken();
        const games = await fetchGames(token);

        if (games && games.length > 0) {
            const gamesHtml = games.map(createGameListItem).join('');
            gameListContainer.innerHTML = gamesHtml; // This will replace the "Loading..." message
        } else {
            loadingMessage.textContent = "No games found.";
        }
    } catch (error) {
        console.error("A critical error occurred:", error);
        loadingMessage.innerHTML = `
            <div class="text-red-400 text-center">
                <strong>Error: Could not load games.</strong>
                <p class="text-sm mt-2">${error.message}</p>
            </div>
        `;
    }
});