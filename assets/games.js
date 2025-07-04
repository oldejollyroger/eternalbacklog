// This function runs only after the entire HTML page is loaded and ready.
document.addEventListener('DOMContentLoaded', function() {

    // ---- 1. SIMPLE MOCK DATA ---- //
    // A small, hardcoded list of games. This cannot fail.
    const MOCK_GAMES = [
        { title: 'Elden Ring', platform: 'psn', totalAchievements: 42, difficulty: 9.2, avgCompletion: 15 },
        { title: 'Halo Infinite', platform: 'xbox', totalAchievements: 119, difficulty: 6.5, avgCompletion: 25 },
        { title: "Baldur's Gate 3", platform: 'steam', totalAchievements: 53, difficulty: 7.8, avgCompletion: 12 },
        { title: 'God of War Ragnarök', platform: 'psn', totalAchievements: 36, difficulty: 7.5, avgCompletion: 45 },
        { title: 'Forza Horizon 5', platform: 'xbox', totalAchievements: 98, difficulty: 4.0, avgCompletion: 30 },
        { title: 'Cyberpunk 2077', platform: 'steam', totalAchievements: 63, difficulty: 6.0, avgCompletion: 35 }
    ];

    // ---- 2. HTML RENDER FUNCTION ---- //
    // This function takes a single game object and returns an HTML string.
    function createGameListItem(game) {
        // Simple data for platforms
        const platformInfo = {
            psn: { name: 'PlayStation', color: 'text-blue-400' },
            xbox: { name: 'Xbox', color: 'text-green-400' },
            steam: { name: 'Steam', color: 'text-gray-400' }
        };
        const platformData = platformInfo[game.platform];

        // This is a special type of string in JavaScript (a template literal)
        // that makes creating multi-line HTML very easy.
        return `
            <li class="bg-gray-800 rounded-lg flex items-center p-3 gap-x-4">
                <div class="flex-shrink-0 w-24 h-24 bg-gray-700 rounded-md flex items-center justify-center">
                    <span class="text-gray-500 text-sm">IMG</span>
                </div>
                <div class="flex-grow">
                    <h3 class="font-bold text-lg">${game.title}</h3>
                    <p class="text-xs ${platformData.color}">${platformData.name}</p>
                </div>
                <div class="flex items-center gap-x-6 text-center">
                    <div class="w-28">
                        <span class="font-bold text-xl">${game.totalAchievements}</span>
                        <span class="block text-xs text-gray-400">Achievements</span>
                    </div>
                    <div class="w-28">
                        <span class="font-bold text-xl">${game.difficulty}</span>
                        <span class="block text-xs text-gray-400">Difficulty</span>
                    </div>
                    <div class="w-28">
                        <span class="font-bold text-xl">${game.avgCompletion}%</span>
                        <span class="block text-xs text-gray-400">Avg. Complete</span>
                    </div>
                </div>
            </li>
        `;
    }

    // ---- 3. THE MAIN ACTION ---- //
    // Get the container element from the HTML.
    const gameListContainer = document.getElementById('game-list-container');
    const loadingMessage = document.getElementById('loading-message');

    // Check if the container actually exists on the page. This is a safety check.
    if (gameListContainer) {
        // Use the map() function to run our createGameListItem function on every game in our MOCK_GAMES array.
        // This creates an array of HTML strings.
        const gameHtmlArray = MOCK_GAMES.map(createGameListItem);
        
        // Use the join('') function to combine the array of HTML strings into one single, giant string.
        const fullHtml = gameHtmlArray.join('');
        
        // Remove the "Loading..." message.
        loadingMessage.remove();

        // Set the inner HTML of our container to the giant string of game cards.
        // The browser will then parse this string and display the content.
        gameListContainer.innerHTML = fullHtml;
    }

});