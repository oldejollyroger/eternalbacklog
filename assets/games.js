(function() {
    // ---- 1. CONFIGURATION & STATE ---- //
    // IMPORTANT: Replace these with the credentials you got from Twitch!
    const CLIENT_ID = 'y021ru5dx7dwkfwnff71i0bfehbbx0';
    const CLIENT_SECRET = 'm9fdk0axx5nqqbsqa7s94ugrncfwmx';
    
    const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/'; 
    const TWITCH_AUTH_URL = 'https://id.twitch.tv/oauth2/token';
    const IGDB_API_URL = `${CORS_PROXY}https://api.igdb.com/v4/games`;

    let state = { searchTerm: '', platform: 'all', genre: 'all', year: 'all', showDlcOnly: false, hideShovelware: false, currentPage: 1, itemsPerPage: 30 };
    let allGames = [];
    let accessToken = null;

    // ---- 2. API CALL LOGIC ---- //
    async function getAccessToken() {
        if (accessToken) return accessToken;
        const response = await fetch(`${TWITCH_AUTH_URL}?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`, { method: 'POST' });
        if (!response.ok) throw new Error('Failed to get Access Token');
        const data = await response.json();
        accessToken = data.access_token;
        return accessToken;
    }

    async function fetchGamesFromIGDB() {
        const token = await getAccessToken();
        const body = `fields name, cover.image_id, first_release_date, genres.name, platforms.abbreviation, platforms.name, summary, total_rating; where platforms = (6, 48, 49, 130) & total_rating > 75 & cover != null & category = 0; sort total_rating_count desc; limit 150;`;
        const response = await fetch(IGDB_API_URL, { method: 'POST', headers: { 'Client-ID': CLIENT_ID, 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }, body: body });
        if (!response.ok) throw new Error('Failed to fetch from IGDB');
        return await response.json();
    }

    // ---- 3. DATA & RENDER HELPERS ---- //
    const createSvgPlaceholder=(title,color='4A5568')=>{const w=title.split(' ');let l1='',l2='';for(const word of w){if((l1+word).length<15)l1+=`${word} `;else if((l2+word).length<15)l2+=`${word} `}const svg=`<svg width="254" height="140" viewBox="0 0 254 140" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#${color}"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" font-weight="bold" fill="#fff">${l1.trim()}</text></svg>`;return `data:image/svg+xml;base64,${btoa(svg)}`};
    
    function formatGameData(apiGame) {
        const getImageUrl = (imageId, size = 'cover_big') => `https://images.igdb.com/igdb/image/upload/t_${size}/${imageId}.jpg`;
        
        let platform = 'N/A';
        if (apiGame.platforms) {
            if (apiGame.platforms.some(p => p.id === 48 || p.id === 49)) platform = 'psn';
            else if (apiGame.platforms.some(p => p.id === 6)) platform = 'steam'; // PC
            else if (apiGame.platforms.some(p => p.id === 130)) platform = 'switch'; // Switch
        }

        return {
            title: apiGame.name || "Unknown Title",
            platform: platform,
            genre: apiGame.genres ? apiGame.genres[0].name : "N/A",
            year: apiGame.first_release_date ? new Date(apiGame.first_release_date * 1000).getFullYear() : "N/A",
            imgUrl: apiGame.cover ? getImageUrl(apiGame.cover.image_id, 'screenshot_med') : createSvgPlaceholder(apiGame.name),
            trophies: { bronze: Math.floor(Math.random() * 50) + 10 },
            difficulty: (Math.random() * 8 + 2).toFixed(1),
            avgCompletion: Math.floor(Math.random() * 60) + 5,
        };
    }

    const createGameListItem = (game) => {
        const platformInfo = { psn: { name: 'PlayStation', svg: '<svg class="w-4 h-4 mr-1.5 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="...psn..."/></svg>' }, xbox: { name: 'Xbox', svg: '<svg class="w-4 h-4 mr-1.5 text-green-400" fill="currentColor" viewBox="0 0 24 24"><path d="...xbox..."/></svg>' }, steam: { name: 'PC', svg: '<svg class="w-4 h-4 mr-1.5 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="...pc..."/></svg>' }, switch: { name: 'Switch', svg: '<svg class="w-4 h-4 mr-1.5 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="...switch..."/></svg>' } };
        const p = platformInfo[game.platform] || {name: 'N/A', svg: ''};
        return`<li class="bg-gray-800 rounded-lg flex items-center shadow-md hover:bg-gray-700/50 transition-colors"><a href="game_page.html" class="flex-shrink-0"><img width="127" height="70" src="${game.imgUrl}" class="rounded-l-lg object-cover h-full"></a><div class="p-4 flex-grow text-left"><h3 class="font-bold text-lg"><a href="game_page.html" class="hover:text-purple-400">${game.title}</a></h3><div class="flex items-center text-xs text-gray-400 mt-1"><span class="flex items-center">${p.svg} ${p.name}</span></div></div><div class="w-auto flex-shrink-0 flex items-center justify-end gap-x-4 text-center p-4"><div class="flex-1 w-28"><span class="font-bold text-xl">${game.trophies.bronze}</span><span class="block text-xs text-gray-400">Achievements</span></div><div class="flex-1 w-28"><span class="font-bold text-xl">${game.difficulty}</span><span class="block text-xs text-gray-400">Difficulty</span></div><div class="flex-1 w-28"><span class="font-bold text-xl">${game.avgCompletion}%</span><span class="block text-xs text-gray-400">Avg. Complete</span></div></div></li>`;
    };

    const createSidebarCard = (game) => `<a href="game_page.html" class="flex items-center gap-x-3 hover:bg-gray-700 p-1 rounded-md cursor-pointer"><img src="${game.imgUrl}" class="w-10 h-14 object-cover rounded-md"><p class="font-semibold text-sm">${game.title}</p></a>`;

    // ---- 4. MAIN RENDER LOGIC ---- //
    function render() {
        const listContainer = document.getElementById('game_list_container');
        const countDisplay = document.getElementById('game_count_display');
        const pagination = document.getElementById('pagination_controls');
        if (!listContainer || !countDisplay || !pagination) return;

        const filteredGames = allGames.filter(game => (state.searchTerm === '' || game.title.toLowerCase().includes(state.searchTerm)));
        
        const totalItems = filteredGames.length;
        const totalPages = Math.ceil(totalItems / state.itemsPerPage) || 1;
        state.currentPage = Math.min(state.currentPage, totalPages);
        
        const startIndex = (state.currentPage - 1) * state.itemsPerPage;
        const gamesToRender = filteredGames.slice(startIndex, startIndex + state.itemsPerPage);
        
        countDisplay.textContent = `Showing ${gamesToRender.length} of ${totalItems} games`;
        listContainer.innerHTML = gamesToRender.length ? gamesToRender.map(createGameListItem).join('') : `<div class="text-gray-400 text-center p-8">No games found.</div>`;
        
        // Pagination UI logic here
    }

    function renderSidebar() {
        const newGamesContainer = document.getElementById('new_games_container');
        const popularGamesContainer = document.getElementById('popular_games_container');
        if (newGamesContainer && popularGamesContainer) {
            const shuffled = [...allGames].sort(() => 0.5 - Math.random());
            const newGames = allGames.filter(g => g.year >= 2023).sort((a,b) => b.year - a.year).slice(0, 5);
            newGamesContainer.innerHTML = newGames.map(createSidebarCard).join('');
            popularGamesContainer.innerHTML = shuffled.slice(0, 5).map(createSidebarCard).join('');
        }
    }
    
    // ---- 5. INITIALIZATION ---- //
    async function init() {
        const gameListContainer = document.getElementById('game_list_container');
        try {
            const gameDataFromApi = await fetchGamesFromIGDB();
            allGames = gameDataFromApi.map(formatGameData);
            
            renderSidebar();
            render();

            document.getElementById('game_search_bar').addEventListener('input', e => { state.searchTerm = e.target.value.toLowerCase(); state.currentPage = 1; render(); });
            // Add other event listeners for filters and pagination here

        } catch (error) {
            console.error("Failed to initialize page:", error);
            if (gameListContainer) {
                gameListContainer.innerHTML = `<div class="text-red-400 text-center p-8">Error: Could not load game data. The IGDB API might be down or your credentials might be incorrect. Make sure you have also activated the CORS proxy.</div>`;
            }
        }
    }
    
    document.addEventListener('DOMContentLoaded', init);
})();