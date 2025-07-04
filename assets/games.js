(function() {
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

    const createSvgPlaceholder = (title, color = '4A5568') => {
        const words = title.split(' ');
        let line1 = '', line2 = '';
        for (const w of words) {
            if ((line1 + w).length < 15) { l1 += `${w} ` }
            else if ((l2 + w).length < 15) { l2 += `${w} ` }
        }
        const svg = `<svg width="254" height="140" viewBox="0 0 254 140" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#${color}"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" font-weight="bold" fill="#fff">${l1.trim()}</text></svg>`;
        return `data:image/svg+xml;base64,${btoa(svg)}`;
    };

    const generateAllGames = (count) => {
        REAL_MOCK_GAMES.forEach(realGame => {
            const trophyTypes = { psn: { platinum: 1, gold: Math.floor(Math.random() * 4) + 2, silver: Math.floor(Math.random() * 10) + 5, bronze: Math.floor(Math.random() * 30) + 15 }, xbox: { bronze: Math.floor(Math.random() * 70) + 30 }, steam: { bronze: Math.floor(Math.random() * 60) + 20 } };
            allGames.push({ ...realGame, avgCompletion: Math.floor(Math.random() * 60) + 5, isShovelware: false, trophies: trophyTypes[realGame.platform], imgUrl: createSvgPlaceholder(realGame.title) });
        });
        const remainingCount = count - allGames.length;
        const platforms = ['psn', 'xbox', 'steam'];
        const genres = ['Platformer', 'Strategy', 'Horror', 'Indie'];
        for (let i = 0; i < remainingCount; i++) {
            const platform = platforms[i % platforms.length];
            const trophyTypes = { psn: { platinum: 1, gold: 1, silver: 3, bronze: 10 }, xbox: { bronze: 20 }, steam: { bronze: 15 } };
            allGames.push({ title: `${genres[i%genres.length]} Game ${i+1}`, platform, genre: genres[i % genres.length], trophies: trophyTypes[platform], avgCompletion: Math.floor(Math.random() * 60) + 5, difficulty: (Math.random() * 8 + 2).toFixed(1), length: Math.floor(Math.random() * 80) + 10, year: 2021, hasDLC: Math.random() > 0.8, isShovelware: Math.random() > 0.9, imgUrl: createSvgPlaceholder(`${genres[i % genres.length]} Game ${i+1}`) });
        }
    };

    const createGameListItem = (game) => {
        const platformIcons = { psn: `<svg class="w-4 h-4 mr-1.5 text-blue-400" fill="currentColor" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill-rule="evenodd"><g transform="translate(-144.000000, -228.000000)"><g transform="translate(144.000000, 228.000000)"><path d="M12,0 C5.372583,0 0,5.372583 0,12 C0,18.627417 5.372583,24 12,24 C18.627417,24 24,18.627417 24,12 C24,5.372583 18.627417,0 12,0 Z M12,21.5 C6.7565,21.5 2.5,17.2435 2.5,12 C2.5,6.7565 6.7565,2.5 12,2.5 C17.2435,2.5 21.5,6.7565 21.5,12 C21.5,17.2435 17.2435,21.5 12,21.5 Z M8.13,10.615 L6.29,12.455 L8.13,14.295 L9.97,12.455 L8.13,10.615 Z M15.87,10.615 L14.03,12.455 L15.87,14.295 L17.71,12.455 L15.87,10.615 Z M13.25,5.25 L13.25,7.75 L10.75,7.75 L10.75,5.25 L13.25,5.25 Z M13.25,9 L13.25,11.5 L10.75,11.5 L10.75,9 L13.25,9 Z M13.25,12.75 L13.25,15.25 L10.75,15.25 L10.75,12.75 L13.25,12.75 Z M13.25,16.5 L13.25,19 L10.75,19 L10.75,16.5 L13.25,16.5 Z"></path></g></g></g></svg>`, xbox: `<svg class="w-4 h-4 mr-1.5 text-green-400" fill="currentColor" viewBox="0 0 512 512"><path d="M256 512c141.4 0 256-114.6 256-256S397.4 0 256 0S0 114.6 0 256s114.6 256 256 256zM142.3 125.1c11.3-1.6 22.3 4.1 26.8 14.8l52.1 123.4L337.3 134.7c10.4-5.2 22.3-.9 27.2 9.9s2.4 23.4-8 29.2L279.1 240l81.6 44.2c9.5 5.1 13.6 16.5 8.5 26.5s-16.5 13.6-26.5 8.5L256 280.9l-83.9 44.8c-10.5 5.6-23.3 2.1-28.5-8.5s-2.1-23.3 8.5-28.5l82.8-44.4-78-185.1c-4.3-10.2-1.3-22 7.8-27.9z"/></svg>`, steam: `<svg class="w-4 h-4 mr-1.5 text-gray-400" fill="currentColor" viewBox="0 0 496 512"><path d="M496 256c0 137-111 248-248 248S0 393 0 256 111 8 248 8s248 111 248 248zm-119.3-39.7c-3.2-12.7-15.6-21.7-28.7-18.5-13.1 3.2-21.7 15.6-18.5 28.7 8.3 33.6 12.9 68.6 12.9 104.2 0 35.8-4.6 70.9-12.9 104.3-3.2 13.1 5.4 25.5 18.5 28.7 13.1 3.2 25.5-5.4 28.7-18.5 9.4-37.5 14.4-77.2 14.4-114.5s-5-77-14.4-114.5zm-104.9-52.9c10.7-9.3 12-25.5 3.3-36.2l-10.2-12.4c-8.7-10.7-24.8-12-35.5-3.3-10.7 8.7-12 24.8-3.3 35.5l10.2 12.4c8.7 10.7 24.8 12 35.5 3.3zm-63.7 90.9c-29.4-8.8-54.2-28.3-68.2-57.2-3.2-6.5-9.4-10.9-16.4-12.4-14.3-3-28.3 6.1-31.3 20.3-8.8 42.4-6.3 86.8 7.3 128.5 3.2 9.6 12.2 15.6 22.2 15.6 13.2 0 24-10.8 24-24 0-33.1 16.1-63.8 42.5-80.8z"/></svg>`};
        const pInfo = { psn: { name: 'PlayStation', svg: platformIcons.psn }, xbox: { name: 'Xbox', svg: platformIcons.xbox }, steam: { name: 'Steam', svg: platformIcons.steam } };
        const p = pInfo[game.platform];
        const totalAchievements = (game.platform==='psn') ? Object.values(game.trophies).reduce((s,c)=>s+c,0) : game.trophies.bronze;
        return `<li class="bg-gray-800 rounded-lg flex flex-col md:flex-row items-center p-3 gap-x-4 hover:bg-gray-700/50 transition-colors"><a href="game_page.html" class="flex-shrink-0"><img width="127" height="70" src="${game.imgUrl}" class="rounded-md"></a><div class="flex-grow text-center md:text-left py-2 md:py-0"><h3 class="font-bold text-lg"><a href="game_page.html" class="hover:text-purple-400">${game.title}</a></h3><div class="flex justify-center md:justify-start items-center text-xs text-gray-400 mt-1"><span class="flex items-center">${p.svg}${p.name}</span></div></div><div class="w-full md:w-auto flex-shrink-0 flex items-center justify-center md:justify-end gap-x-4 text-center border-t md:border-t-0 md:border-l border-gray-700/50 pt-3 md:pt-0 md:pl-4"><div class="flex-1 md:w-28"><span class="font-bold text-xl">${totalAchievements}</span><span class="block text-xs text-gray-400">Achievements</span></div><div class="flex-1 md:w-28"><span class="font-bold text-xl">${game.difficulty}</span><span class="block text-xs text-gray-400">Difficulty</span></div><div class="flex-1 md:w-28"><span class="font-bold text-xl">${game.avgCompletion}%</span><span class="block text-xs text-gray-400">Avg. Complete</span></div></div></li>`;
    };
    
    const createSidebarCard = (game) => `<a href="game_page.html" class="flex items-center gap-x-3 hover:bg-gray-700 p-1 rounded-md cursor-pointer"><img src="${game.imgUrl.replace('254x140','300x400')}" class="w-10 h-14 object-cover rounded-md"><p class="font-semibold text-sm">${game.title}</p></a>`;
    
    function render() {
        const listContainer=document.getElementById('game_list_container'), countDisplay=document.getElementById('game_count_display'), pagination=document.getElementById('pagination_controls'), prevBtn=document.getElementById('prev_page_btn'), nextBtn=document.getElementById('next_page_btn'), pageIndicator=document.getElementById('page_indicator');
        if(!listContainer) return;
        let filteredGames = allGames.filter(g => (state.searchTerm===''||g.title.toLowerCase().includes(state.searchTerm)) && (state.platform==='all'||g.platform===state.platform) && (state.genre==='all'||g.genre===state.genre) && (state.year==='all'||g.year.toString()===state.year) && (!state.showDlcOnly||g.hasDLC) && (!state.hideShovelware||!g.isShovelware));
        const totalItems=filteredGames.length, totalPages=Math.ceil(totalItems/state.itemsPerPage)||1;
        state.currentPage=Math.min(state.currentPage,totalPages);
        const gamesToRender=filteredGames.slice((state.currentPage-1)*state.itemsPerPage, state.currentPage*state.itemsPerPage);
        countDisplay.textContent=`Showing ${gamesToRender.length} of ${totalItems} games`;
        listContainer.innerHTML=gamesToRender.length?gamesToRender.map(createGameListItem).join(''):`<li class="text-gray-400 text-center p-8">No games match your criteria.</li>`;
        if(totalPages>1){pagination.style.display='flex';pageIndicator.textContent=`Page ${state.currentPage} of ${totalPages}`;prevBtn.disabled=state.currentPage===1;nextBtn.disabled=state.currentPage===totalPages}else{pagination.style.display='none'}
    }
    
    function init() {
        generateAllGames(150);
        const newGamesContainer=document.getElementById('new_games_container'),popularGamesContainer=document.getElementById('popular_games_container');
        if(newGamesContainer&&popularGamesContainer){const shuffled=[...allGames].sort(()=>0.5-Math.random()),newGames=allGames.filter(g=>g.year>=2023).sort((a,b)=>b.year-a.year).slice(0,5);newGamesContainer.innerHTML=newGames.map(createSidebarCard).join('');popularGamesContainer.innerHTML=shuffled.slice(0,5).map(createSidebarCard).join('')}
        document.getElementById('game_search_bar').addEventListener('input',e=>{state.searchTerm=e.target.value.toLowerCase();state.currentPage=1;render()});
        document.querySelectorAll('#filter-controls select, #filter-controls input').forEach(input=>{input.addEventListener('change',e=>{const id=e.target.id,value=e.target.type==='checkbox'?e.target.checked:e.target.value;if(id.includes('platform'))state.platform=value;else if(id.includes('genre'))state.genre=value;else if(id.includes('year'))state.year=value;else if(id.includes('dlc'))state.showDlcOnly=value;else if(id.includes('shovelware'))state.hideShovelware=value;state.currentPage=1;render()})});
        document.getElementById('prev_page_btn').addEventListener('click',()=>{if(state.currentPage>1){state.currentPage--;render()}});
        document.getElementById('next_page_btn').addEventListener('click',()=>{const totalItems=allGames.filter(g=>(state.platform==='all'||g.platform===state.platform)).length;const totalPages=Math.ceil(totalItems/state.itemsPerPage);if(state.currentPage<totalPages){state.currentPage++;render()}})}
    render();
    document.addEventListener('DOMContentLoaded',init);
})();