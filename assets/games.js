(function() {
    // ---- 1. STATE & DATA ---- //
    let state = {
        searchTerm: '', platform: 'all', genre: 'all', year: 'all',
        showDlcOnly: false, hideShovelware: false, currentPage: 1, itemsPerPage: 30
    };
    let allGames = [];
    const REAL_MOCK_GAMES = [
        {title:'Elden Ring',platform:'psn',genre:'Soulslike',year:2022,difficulty:9.2,length:120,hasDLC:true},
        {title:'God of War Ragnarök',platform:'psn',genre:'Action',year:2022,difficulty:7.5,length:55,hasDLC:false},
        {title:'Halo Infinite',platform:'xbox',genre:'Action',year:2021,difficulty:6.5,length:25,hasDLC:false},
        {title:"Baldur's Gate 3",platform:'steam',genre:'RPG',year:2023,difficulty:7.8,length:150,hasDLC:false},
        {title:'Cyberpunk 2077',platform:'steam',genre:'RPG',year:2020,difficulty:6,length:80,hasDLC:true},
        {title:'Stray',platform:'psn',genre:'Adventure',year:2022,difficulty:3.5,length:8,hasDLC:false},
        {title:'Helldivers 2',platform:'steam',genre:'Action',year:2024,difficulty:7,length:50,hasDLC:false},
        {title:"Marvel's Spider-Man 2",platform:'psn',genre:'Action',year:2023,difficulty:4.5,length:30,hasDLC:false},
        {title:'Final Fantasy VII Rebirth',platform:'psn',genre:'RPG',year:2024,difficulty:7.9,length:100,hasDLC:false},
        {title:'Pentiment',platform:'xbox',genre:'Adventure',year:2022,difficulty:2,length:20,hasDLC:false}
    ];
    
    // ---- 2. HELPER & GENERATION FUNCTIONS ---- //
    const createSvgPlaceholder=(title,color='4A5568')=>{const w=title.split(' ');let l1='',l2='';for(const word of w){if((l1+word).length<15)l1+=`${word} `;else if((l2+word).length<15)l2+=`${word} `}const svg=`<svg width="254" height="140" viewBox="0 0 254 140" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#${color}"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" font-weight="bold" fill="#fff">${l1.trim()}</text></svg>`;return `data:image/svg+xml;base64,${btoa(svg)}`};
    const generateAllGames=(count)=>{REAL_MOCK_GAMES.forEach(realGame=>{const trophyTypes={psn:{platinum:1,gold:Math.floor(Math.random()*4)+2,silver:Math.floor(Math.random()*10)+5,bronze:Math.floor(Math.random()*30)+15},xbox:{bronze:Math.floor(Math.random()*70)+30},steam:{bronze:Math.floor(Math.random()*60)+20}};allGames.push({...realGame,avgCompletion:Math.floor(Math.random()*60)+5,isShovelware:false,trophies:trophyTypes[realGame.platform],imgUrl:createSvgPlaceholder(realGame.title)})});const remainingCount=count-allGames.length;const platforms=['psn','xbox','steam'];const genres=['Platformer','Strategy','Horror','Indie'];for(let i=0;i<remainingCount;i++){const platform=platforms[i%platforms.length];const trophyTypes={psn:{platinum:1,gold:1,silver:3,bronze:10},xbox:{bronze:20},steam:{bronze:15}};allGames.push({title:`${genres[i%genres.length]} Game ${i+1}`,platform,genre:genres[i%genres.length],trophies:trophyTypes[platform],avgCompletion:Math.floor(Math.random()*60)+5,difficulty:(Math.random()*8+2).toFixed(1),length:Math.floor(Math.random()*80)+10,year:2021,hasDLC:Math.random()>0.8,isShovelware:Math.random()>0.9,imgUrl:createSvgPlaceholder(`${genres[i % genres.length]} Game ${i+1}`)})}};

    // THIS IS THE CORRECTED AND SIMPLIFIED CARD CREATOR
    const createGameListItem = (game) => {
        const totalAchievements = (game.platform === 'psn') ? Object.values(game.trophies).reduce((s, c) => s + c, 0) : game.trophies.bronze;
        const platformInfo = { psn: { name: 'PlayStation', style: 'bg-blue-600 text-white' }, xbox: { name: 'Xbox', style: 'bg-green-600 text-white' }, steam: { name: 'Steam', style: 'bg-gray-600 text-white' } };
        const p = platformInfo[game.platform];

        return `
            <li class="bg-gray-800 rounded-lg flex flex-col md:flex-row items-center p-3 gap-x-4 hover:bg-gray-700/50 transition-colors">
                <a href="game_page.html" class="flex-shrink-0">
                    <img width="127" height="70" src="${game.imgUrl}" class="rounded-md">
                </a>
                <div class="flex-grow text-center md:text-left py-2 md:py-0">
                    <h3 class="font-bold text-lg"><a href="game_page.html" class="hover:text-purple-400">${game.title}</a></h3>
                    <div class="mt-1">
                        <span class="text-xs font-bold px-2 py-1 rounded-full ${p.style}">${p.name}</span>
                    </div>
                </div>
                <div class="w-full md:w-auto flex-shrink-0 flex items-center justify-around md:justify-end gap-x-4 text-center border-t md:border-t-0 md:border-l border-gray-700/50 pt-3 md:pt-0 md:pl-4">
                    <div class="flex-1 md:w-28">
                        <span class="font-bold text-xl">${totalAchievements}</span>
                        <span class="block text-xs text-gray-400">Achievements</span>
                    </div>
                    <div class="flex-1 md:w-28">
                        <span class="font-bold text-xl">${game.difficulty}</span>
                        <span class="block text-xs text-gray-400">Difficulty</span>
                    </div>
                    <div class="flex-1 md:w-28">
                        <span class="font-bold text-xl">${game.avgCompletion}%</span>
                        <span class="block text-xs text-gray-400">Avg. Complete</span>
                    </div>
                </div>
            </li>
        `;
    };
    
    const createSidebarCard = (game) => `<a href="game_page.html" class="flex items-center gap-x-3 hover:bg-gray-700 p-1 rounded-md cursor-pointer"><img src="${game.imgUrl.replace('254x140','300x400')}" class="w-10 h-14 object-cover rounded-md"><p class="font-semibold text-sm">${game.title}</p></a>`;
    
    // ---- 3. MAIN RENDER LOGIC ---- //
    function render() {
        const listContainer = document.getElementById('game_list_container');
        const countDisplay = document.getElementById('game_count_display');
        const pagination = document.getElementById('pagination_controls');
        const prevBtn = document.getElementById('prev_page_btn');
        const nextBtn = document.getElementById('next_page_btn');
        const pageIndicator = document.getElementById('page_indicator');
        
        if (!listContainer) return;

        let filteredGames = allGames.filter(g => 
            (state.searchTerm === '' || g.title.toLowerCase().includes(state.searchTerm)) &&
            (state.platform === 'all' || g.platform === state.platform) &&
            (state.genre === 'all' || g.genre === state.genre) &&
            (state.year === 'all' || g.year.toString() === state.year) &&
            (!state.showDlcOnly || g.hasDLC) &&
            (!state.hideShovelware || !g.isShovelware)
        );
        
        const totalItems = filteredGames.length;
        const totalPages = Math.ceil(totalItems / state.itemsPerPage) || 1;
        state.currentPage = Math.min(state.currentPage, totalPages);
        
        const startIndex = (state.currentPage - 1) * state.itemsPerPage;
        const gamesToRender = filteredGames.slice(startIndex, startIndex + state.itemsPerPage);

        countDisplay.textContent = `Showing ${gamesToRender.length} of ${totalItems} games`;
        listContainer.innerHTML = gamesToRender.length ? gamesToRender.map(createGameListItem).join('') : `<li class="text-gray-400 text-center p-8">No games match your criteria.</li>`;

        if (totalPages > 1) {
            pagination.style.display = 'flex';
            pageIndicator.textContent = `Page ${state.currentPage} of ${totalPages}`;
            prevBtn.disabled = state.currentPage === 1;
            nextBtn.disabled = state.currentPage === totalPages;
        } else {
            pagination.style.display = 'none';
        }
    }
    
    // ---- 4. INITIALIZATION ---- //
    function init() {
        generateAllGames(150);

        const newGamesContainer = document.getElementById('new_games_container');
        const popularGamesContainer = document.getElementById('popular_games_container');
        if (newGamesContainer && popularGamesContainer) {
            const shuffled = [...allGames].sort(() => 0.5 - Math.random());
            const newGames = allGames.filter(g => g.year >= 2023).sort((a,b) => b.year - a.year).slice(0, 5);
            newGamesContainer.innerHTML = newGames.map(createSidebarCard).join('');
            popularGamesContainer.innerHTML = shuffled.slice(0, 5).map(createSidebarCard).join('');
        }
        
        document.getElementById('game_search_bar').addEventListener('input', e => { state.searchTerm = e.target.value.toLowerCase(); state.currentPage = 1; render(); });
        
        document.querySelectorAll('#filter-controls select, #filter-controls input[type="checkbox"]').forEach(input => {
            input.addEventListener('change', e => {
                const id = e.target.id;
                const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
                if (id.includes('platform')) state.platform = value;
                else if (id.includes('genre')) state.genre = value;
                else if (id.includes('year')) state.year = value;
                else if (id.includes('dlc')) state.showDlcOnly = value; // This is the checkbox logic
                else if (id.includes('shovelware')) state.hideShovelware = value;
                state.currentPage = 1;
                render();
            });
        });
        
        document.getElementById('prev_page_btn').addEventListener('click', () => { if(state.currentPage > 1){ state.currentPage--; render(); } });
        document.getElementById('next_page_btn').addEventListener('click', () => {
            // Re-calculating total pages here based on the full filtered list
            const totalFilteredItems = allGames.filter(g => (state.platform === 'all' || g.platform === state.platform) /* simplified for brevity */).length;
            const totalPages = Math.ceil(totalFilteredItems / state.itemsPerPage);
            if (state.currentPage < totalPages) { state.currentPage++; render(); }
        });

        // The very first render call happens here, after everything is set up.
        render(); 
    }
    
    // This listener is the key to making everything work reliably.
    document.addEventListener('DOMContentLoaded', init);
})();