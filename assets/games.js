(function() {
    // ---- 1. CONFIGURATION & STATE ---- //
    // IMPORTANT: Replace these with the credentials you got from the Twitch Developer Console.
    const CLIENT_ID = 'y021ru5dx7dwkfwnff71i0bfehbbx0';
    const CLIENT_SECRET = 'm9fdk0axx5nqqbsqa7s94ugrncfwmx';
    
    // This is a proxy to bypass browser CORS security issues. It's a free, open-source tool.
    const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/'; 
    const TWITCH_AUTH_URL = 'https://id.twitch.tv/oauth2/token';
    const IGDB_API_URL = `${CORS_PROXY}https://api.igdb.com/v4/games`;

    let state = { searchTerm: '', platform: 'all', genre: 'all', year: 'all', showDlcOnly: false, hideShovelware: false, currentPage: 1, itemsPerPage: 30 };
    let allGames = [];
    let accessToken = null;

    // ---- 2. API CALL LOGIC ---- //
    async function getAccessToken() {
        if (accessToken) return accessToken; // Use cached token if available
        const response = await fetch(`${TWITCH_AUTH_URL}?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`, { method: 'POST' });
        if (!response.ok) throw new Error('Failed to get Access Token from Twitch. Check your Client ID and Secret.');
        const data = await response.json();
        accessToken = data.access_token;
        return accessToken;
    }

    async function fetchGamesFromIGDB() {
        const token = await getAccessToken();
        // This query fetches popular, highly-rated games from major platforms that have cover art.
        const body = `
            fields name, cover.image_id, first_release_date, genres.name, platforms.abbreviation, platforms.name, total_rating;
            where platforms = (6, 48, 49, 130, 167, 169) & total_rating > 75 & cover != null & category = 0;
            sort total_rating_count desc;
            limit 200;
        `;
        const response = await fetch(IGDB_API_URL, { method: 'POST', headers: { 'Client-ID': CLIENT_ID, 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }, body });
        if (!response.ok) throw new Error('Failed to fetch game data from IGDB. The API might be down or experiencing issues.');
        return await response.json();
    }

    // ---- 3. DATA & RENDER HELPERS ---- //
    const createSvgPlaceholder=(title,color='4A5568')=>{const w=title.split(' ');let l1='',l2='';for(const word of w){if((l1+word).length<15)l1+=`${word} `;else if((l2+word).length<15)l2+=`${word} `}const svg=`<svg width="254" height="140" viewBox="0 0 254 140" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#${color}"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" font-weight="bold" fill="#fff">${l1.trim()}</text></svg>`;return `data:image/svg+xml;base64,${btoa(svg)}`};

    function formatGameData(apiGame) {
        const getImageUrl = (imageId) => `https://images.igdb.com/igdb/image/upload/t_screenshot_med/${imageId}.jpg`;
        
        let platform = 'steam'; // Default to PC/Steam
        let platformName = 'PC';
        if (apiGame.platforms) {
            if (apiGame.platforms.some(p => p.id === 48 || p.id === 49)) { platform = 'psn'; platformName = 'PlayStation'; }
            else if (apiGame.platforms.some(p => p.id === 167 || p.id === 169)) { platform = 'xbox'; platformName = 'Xbox'; }
        }

        return {
            title: apiGame.name || "Unknown Title",
            platform, platformName,
            genre: apiGame.genres ? apiGame.genres[0].name : "N/A",
            year: apiGame.first_release_date ? new Date(apiGame.first_release_date * 1000).getFullYear() : "N/A",
            imgUrl: apiGame.cover ? getImageUrl(apiGame.cover.image_id) : createSvgPlaceholder(apiGame.name),
            trophies: { bronze: Math.floor(Math.random() * 50) + 10 },
            difficulty: (apiGame.total_rating / 10).toFixed(1) || 5.0,
            avgCompletion: Math.floor(Math.random() * 40) + 5,
            hasDLC: Math.random() > 0.7,
            isShovelware: false,
        };
    }

    const createGameListItem = (game) => {
        const platformIcons={psn:'<svg class="w-4 h-4 mr-1.5 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-3.3 0-6 2.7-6 6v12c0 3.3 2.7 6 6 6s6-2.7 6-6V6c0-3.3-2.7-6-6-6zm-1 4h2v2h-2V4zm0 4h2v2h-2V8zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2zM8 4h2v2H8V4zm0 4h2v2H8V8zm0 4h2v2H8v-2zm0 4h2v2H8v-2zM4 12c0-2.2 1.8-4 4-4v8c-2.2 0-4-1.8-4-4zM20 12c0 2.2-1.8 4-4 4V8c2.2 0 4 1.8 4 4z"/></svg>',xbox:'<svg class="w-4 h-4 mr-1.5 text-green-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.09 15.37-3.3-3.3 1.41-1.41 1.89 1.89 4.24-4.24 1.41 1.41-5.65 5.65z"/></svg>',steam:'<svg class="w-4 h-4 mr-1.5 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm3.89 9.17c-.52.21-1.1.33-1.72.33-1.5 0-2.73-1.1-2.9-2.58H7v2.08h4.27c.17 1.48 1.4 2.58 2.9 2.58.62 0 1.2-.12 1.72-.33l3.72 3.72c-1.39 1.2-3.23 1.94-5.22 1.94-4.41 0-8-3.59-8-8s3.59-8 8-8c1.99 0 3.83.74 5.22 1.94l-3.72 3.72z"/></svg>'};
        const pSvg = platformIcons[game.platform] || platformIcons.steam;
        const totalAchievements=game.trophies.bronze;
        return`<li class="bg-gray-800 rounded-lg flex items-center shadow-md hover:bg-gray-700/50 transition-colors"><a href="game_page.html" class="flex-shrink-0 h-full"><img width="127" height="70" src="${game.imgUrl}" class="rounded-l-lg object-cover h-full w-[127px]"></a><div class="p-4 flex-grow text-left"><h3 class="font-bold text-lg"><a href="game_page.html" class="hover:text-purple-400">${game.title}</a></h3><div class="flex items-center text-xs text-gray-400 mt-1"><span class="flex items-center">${pSvg} ${game.platformName}</span></div></div><div class="w-auto flex-shrink-0 flex items-center justify-end gap-x-4 text-center p-4"><div class="flex-1 w-28"><span class="font-bold text-xl">${totalAchievements}</span><span class="block text-xs text-gray-400">Achievements</span></div><div class="flex-1 w-28"><span class="font-bold text-xl">${game.difficulty}</span><span class="block text-xs text-gray-400">Difficulty</span></div><div class="flex-1 w-28"><span class="font-bold text-xl">${game.avgCompletion}%</span><span class="block text-xs text-gray-400">Avg. Complete</span></div></div></li>`
    };

    const createSidebarCard=(game)=>`<a href="game_page.html" class="flex items-center gap-x-3 hover:bg-gray-700 p-1 rounded-md cursor-pointer"><img src="${game.imgUrl}" class="w-10 h-14 object-cover rounded-md"><p class="font-semibold text-sm">${game.title}</p></a>`;

    // ---- 4. MAIN RENDER LOGIC ---- //
    function render() {
        const listContainer = document.getElementById('game_list_container');
        const countDisplay = document.getElementById('game_count_display');
        const pagination = document.getElementById('pagination_controls');
        if (!listContainer || !countDisplay || !pagination) return;
        let filteredGames = allGames.filter(g => (state.searchTerm === '' || g.title.toLowerCase().includes(state.searchTerm)) && (state.platform === 'all' || g.platform === state.platform) && (state.genre === 'all' || g.genre === state.genre) && (state.year === 'all' || g.year.toString() === state.year) && (!state.showDlcOnly || g.hasDLC) && (!state.hideShovelware || !g.isShovelware));
        const totalItems = filteredGames.length;
        const totalPages = Math.ceil(totalItems / state.itemsPerPage) || 1;
        state.currentPage = Math.min(state.currentPage, totalPages);
        const startIndex = (state.currentPage - 1) * state.itemsPerPage;
        const gamesToRender = filteredGames.slice(startIndex, startIndex + state.itemsPerPage);
        countDisplay.textContent = `Showing ${gamesToRender.length} of ${totalItems} games`;
        listContainer.innerHTML = gamesToRender.length ? `<ul class="space-y-3">${gamesToRender.map(createGameListItem).join('')}</ul>` : `<p class="text-gray-400 text-center p-8">No games match your criteria.</p>`;
        const pageIndicator = document.getElementById('page_indicator');
        const prevBtn = document.getElementById('prev_page_btn');
        const nextBtn = document.getElementById('next_page_btn');
        if (totalPages > 1) { pagination.style.display = 'flex'; pageIndicator.textContent = `Page ${state.currentPage} of ${totalPages}`; prevBtn.disabled = state.currentPage === 1; nextBtn.disabled = state.currentPage === totalPages; } else { pagination.style.display = 'none'; }
    }

    function renderSidebar(){const n=document.getElementById('new_games_container'),p=document.getElementById('popular_games_container');if(n&&p){const s=[...allGames].sort(()=>.5-Math.random()),g=allGames.filter(g=>g.year>=2023).sort((a,b)=>b.year-a.year).slice(0,5);n.innerHTML=g.map(createSidebarCard).join('');p.innerHTML=s.slice(0,5).map(createSidebarCard).join('')}}
    
    // ---- 5. INITIALIZATION ---- //
    async function init() {
        const listContainer = document.getElementById('game_list_container');
        try {
            const gameDataFromApi = await fetchGamesFromIGDB();
            allGames = gameDataFromApi.map(formatGameData);
            renderSidebar();
            render();
            document.getElementById('game_search_bar').addEventListener('input', e => { state.searchTerm = e.target.value.toLowerCase(); state.currentPage = 1; render(); });
            document.querySelectorAll('#filter-controls select, #filter-controls input[type="checkbox"]').forEach(input => { input.addEventListener('change', e => { const id = e.target.id; const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value; if(id.includes('platform')) state.platform = value; else if(id.includes('genre')) state.genre = value; else if(id.includes('year')) state.year = value; else if(id.includes('dlc')) state.showDlcOnly = value; else if(id.includes('shovelware')) state.hideShovelware = value; state.currentPage = 1; render(); }); });
            document.getElementById('prev_page_btn').addEventListener('click', () => { if(state.currentPage > 1){ state.currentPage--; render(); } });
            document.getElementById('next_page_btn').addEventListener('click', () => { state.currentPage++; render(); });
        } catch (error) {
            console.error("CRITICAL ERROR:", error);
            if(listContainer) {
                listContainer.innerHTML = `<div class="bg-red-900/50 border border-red-700 text-red-300 text-center p-8 rounded-lg"><strong>Failed to Load Games</strong><p class="text-sm mt-2">${error.message}</p><p class="text-xs mt-4">Please ensure your Client ID/Secret are correct and that you have activated the CORS proxy for this session.</p></div>`;
            }
        }
    }
    
    document.addEventListener('DOMContentLoaded', init);
})();