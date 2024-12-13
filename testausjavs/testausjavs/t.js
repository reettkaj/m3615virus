document.addEventListener('DOMContentLoaded', () => {
    const menuSection = document.getElementById('menu-section');
    const nameEntrySection = document.getElementById('name-entry-section');
    const cockpitSection = document.getElementById('cockpit-section');
    const mapSection = document.getElementById('map-section');
    const countryEventSection = document.getElementById('country-event-section');
    const leaderboardSection = document.getElementById('leaderboard-section');
    const story = document.getElementById('story');
    const storybtn = document.getElementById('storyBtn');
    const startBtn = document.getElementById('startBtn');
    const submitNameBtn = document.getElementById('submitNameBtn');
    const quitBtn = document.getElementById('quitBtn');
    const leaderboardBtn = document.getElementById('leaderboardBtn');
    const backToMenuBtn = document.getElementById('backToMenuBtn');
    const mapBtn = document.getElementById('mapBtn');
    const backToCockpitBtn = document.getElementById('backToCockpitBtn');
    const backToMapBtn = document.getElementById('backToMapBtn');
    const countryList = document.getElementById('country-list');
    const eventTitle = document.getElementById('event-title');
    const eventDescription = document.getElementById('event-description');
    const continueBtn = document.getElementById('continueBtn');
    const taskOrEventDisplay = document.getElementById('taskOrEventDisplay');
    let gameState = {
        currentCountry: null, // Starting country
        visitedCountries: [],
        health: 10, // Starting health
        antidotes: 0, // Collected antidotes
        totalAntidotesNeeded: 9,
        countries: ["FI", "SE", "NO", "EE", "LV", "LT", "PL", "SK", "HU", "AT", "DE", "CH", "CZ", "BE", "NL", "FR", "DK", "GB", "IE", "IS"]
    };
    let startTime = 0
    // Arrays to store all events and tasks
    let allEvents;
    let allTasks;
    const BACKEND_URL = "http://127.0.0.1:5000";  // URL for the Flask backend

    async function fetchAPIData(endpoint) {
        try {
            const response = await fetch(endpoint);
            if (!response.ok) {
                throw new Error(`Failed to fetch data from ${endpoint}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error(error);
            return null;
        }
    }
    // Function to fetch all events and tasks once and store them
    async function initializeGameData() {
        const eventsData = await fetchAPIData(`${BACKEND_URL}/events`);
        const tasksData = await fetchAPIData(`${BACKEND_URL}/tasks`);
        allEvents = eventsData
        allTasks = tasksData
    }

    // Function to get a random event
    function getRandomEvent() {
        if (allEvents.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * allEvents.length);
        return allEvents[randomIndex];
    }

    // Function to get a random task
    function getRandomTask() {
        if (allTasks.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * allTasks.length);
        return allTasks[randomIndex];
    }
    // Start Game
    startBtn.addEventListener('click', async () => {
        // You can perform async operations here
        try {
            // Example async operation (like fetching data)
            startTime = Date.now();
            await initializeGameData();  // Assuming this is an async function

            // Once the data is fetched, hide the menu and show the name entry section
            menuSection.style.display = 'none';
            nameEntrySection.style.display = 'block';
        } catch (error) {
            console.error('Error initializing game data:', error);
            // You can show an error message or handle the error here
        }
    });
    submitNameBtn.addEventListener('click', () => {
        playerName = document.getElementById('playerName').value.trim();
        if (playerName) {
            nameEntrySection.style.display = 'none';
            story.style.display = 'block';

        } else {
            alert('Please enter your name.');
        }
    });
    function updateCockpitUI() {
        const healthElement = document.getElementById('health');
        const antidotesElement = document.getElementById('antidotes');
        const visitedElement = document.getElementById('visited');

        // Update health
        if (healthElement) {
            healthElement.textContent = `Health: ${gameState.health}`;
        }

        // Update antidotes
        if (antidotesElement) {
            antidotesElement.textContent = `Antidotes: ${gameState.antidotes}/${gameState.totalAntidotesNeeded}`;
        }

        // Update visited countries
        if (visitedElement) {
            const visitedCountries = gameState.visitedCountries.length
                ? gameState.visitedCountries.join(', ')
                : 'None';
            visitedElement.textContent = `Visited Countries: ${visitedCountries}`;
        }
    }

    storybtn.addEventListener('click', () => {
        story.style.display = 'none';
        cockpitSection.style.display = 'block';
        updateCockpitUI()
    });

    // Function to display the leaderboard
    function showLeaderboard(data) {
        const leaderboardSection = document.getElementById('leaderboard-section');
        const leaderboardBody = document.getElementById('leaderboard-body');
        menuSection.style.display = 'none';

        // Clear any existing rows
        leaderboardBody.innerHTML = '';
        const leaderboardArray = Object.values(data);
        console.log(leaderboardArray)
        // Populate the table with leaderboard data
        leaderboardArray.forEach(player => {
            player.forEach(player => {
                const row = document.createElement('tr');
                row.innerHTML = `
                <td>${player.player_id}</td>
                <td>${player.time}</td>
                <td>${player.healthbar_final}</td>
            `;
                leaderboardBody.appendChild(row);
            })
        });

        // Show the leaderboard section
        leaderboardSection.style.display = 'block';
    }

    // Fetch leaderboard data and display it
    document.getElementById('leaderboardBtn').addEventListener('click', async () => {
        try {
            const response = await fetch('http://127.0.0.1:5000/leaderboard');
            const data = await response.json();
            console.log("Leaderboard data:", typeof data.leaderboard)

            if (data.leaderboard) {
                showLeaderboard(data);
            } else {
                console.error('Error: Invalid leaderboard data', data);
            }
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        }
    });

    // Close the leaderboard
    document.getElementById('closeLeaderboardBtn').addEventListener('click', () => {
        document.getElementById('leaderboard-section').style.display = 'none';
        menuSection.style.display = 'block';
    });

    // quit game 
    quitBtn.addEventListener('click', () => {
        const userConfirmed = confirm("Do you really want to quit the game?");

        if (userConfirmed) {
            cockpitSection.style.display = 'none';

            menuSection.style.display = 'none';
        }
    });
    mapBtn.addEventListener('click', () => {
        cockpitSection.style.display = 'none';
        mapSection.style.display = 'block';
        populateCountryList();
    });

    backToCockpitBtn.addEventListener('click', () => {
        mapSection.style.display = 'none';
        cockpitSection.style.display = 'block';
    });

    backToMapBtn.addEventListener('click', () => {
        countryEventSection.style.display = 'none';
        mapSection.style.display = 'block';
        updateCockpitUI();
        populateCountryList();
    });

    async function populateCountryList() {
        const countryGrid = document.getElementById('country-grid');
        countryGrid.innerHTML = '';

        gameState.countries.forEach(country => {
            const countryButton = document.createElement('div'); // Use 'div' for grid layout
            countryButton.textContent = country;
            countryButton.className = 'country-btn';

            if (gameState.visitedCountries.includes(country)) {
                countryButton.classList.add('visited');
                countryButton.disabled = true;
            } else {
                countryButton.addEventListener('click', () => openCountryEvent(country));
            }

            countryGrid.appendChild(countryButton);
        });
    }
    function checkHealthStatus() {
        if (gameState.health < 5 && gameState.antidotes > 0) {
            const choiceContainer = document.getElementById('choice-container');

            choiceContainer.innerHTML = '';

            const useAntidoteButton = document.createElement('button');
            useAntidoteButton.textContent = 'Use Antidote';
            useAntidoteButton.className = 'antidote-btn';

            const ignoreButton = document.createElement('button');
            ignoreButton.textContent = 'Ignore';
            ignoreButton.className = 'ignore-btn';

            useAntidoteButton.addEventListener('click', () => {
                if (gameState.antidotes > 0) {
                    gameState.antidotes--;
                    gameState.health += 3;
                    if (gameState.health > 10) gameState.health = 10;
                    updateHealthBar();
                    alert('You used an antidote! Health restored.');
                } else {
                    alert('No antidotes left!');
                }
                choiceContainer.innerHTML = '';
            });

            ignoreButton.addEventListener('click', () => {
                alert('You chose to ignore the antidote!');
                choiceContainer.innerHTML = '';
            });

            choiceContainer.appendChild(useAntidoteButton);
            choiceContainer.appendChild(ignoreButton);
        }
    } function updateHealthBar() {
        let healthBarContainer = document.getElementById('health-bar');
        if (!healthBarContainer) {
            console.warn("Health bar container not found! Creating a new one.");

            healthBarContainer = document.createElement('div');
            healthBarContainer.id = 'health-bar';
            healthBarContainer.style.width = '100%';
            healthBarContainer.style.backgroundColor = '#4caf50';
            healthBarContainer.style.borderRadius = '8px';
            healthBarContainer.style.height = '25px';
            healthBarContainer.style.boxShadow = 'inset 0 4px 6px rgba(0, 0, 0, 0.2)';
            healthBarContainer.style.marginTop = '10px';

            const healthDisplay = document.getElementById('health-display');
            if (!healthDisplay) {
                console.error("Health display container not found! Cannot create health bar.");
                return;
            }
            healthDisplay.appendChild(healthBarContainer);
        }

        let healthProgress = document.getElementById('health-progress');
        if (!healthProgress) {
            console.warn("Health progress bar element not found! Creating a new one.");

            healthProgress = document.createElement('div');
            healthProgress.id = 'health-progress';
            healthProgress.style.backgroundColor = '#ff9800';
            healthProgress.style.height = '100%';
            healthProgress.style.borderRadius = '8px';
            healthProgress.style.width = '100%';
            healthProgress.style.transition = 'width 0.3s ease';

            healthBarContainer.appendChild(healthProgress);
        }

        const healthPercentage = (gameState.health / 10) * 100;
        healthProgress.style.width = `${healthPercentage}%`;
    }
    function decreaseHealth(amount = 1) {
        gameState.health -= amount;

        if (gameState.health < 0) {
            gameState.health = 0;
        }

        updateHealthBar();

        if (gameState.health <= 0) {
            checkGameOver();
        }
    }
    async function openCountryEvent(country) {
        mapSection.style.display = 'none';
        countryEventSection.style.display = 'block';

        eventTitle.textContent = `You have selected this country: ${country}`;

        eventDescription.textContent = 'You land the plane safely. Time to see what happens!';
        eventDescription.style.color = 'black';
        updateHealthBar();
        gameState.visitedCountries.push(country);
        decreaseHealth(1)
        const continueButton = document.createElement('button');
        continueButton.textContent = 'Continue';
        continueButton.className = 'continue-btn';

        continueButton.addEventListener('click', () => {
            continueButton.style.display = 'none';

            const randomValue = Math.random();
            if (randomValue < 0.5) {
                const event = getRandomEvent();
                console.log(event);
                if (event) {
                    eventDescription.textContent = event.description;
                    handleEventOutcome(event);
                } else {
                    eventDescription.textContent = 'No events available right now. Continue your journey!';
                }
            } else if (randomValue < 0.6) {
                const task = getRandomTask();
                console.log(task);
                if (task) {
                    eventDescription.textContent = task.description;
                    handleTaskOutcome(task);
                } else {
                    eventDescription.textContent = 'No tasks available right now. Continue your journey!';
                }
            } else {
                eventDescription.textContent = 'Nothing happens this time. Rest up and prepare for the next destination!';
            }
            checkGameOver();
        });
        checkHealthStatus();
        countryEventSection.appendChild(continueButton);
    }

    function handleEventOutcome(event) {
        if (!event || !event.choices || Object.keys(event.choices).length === 0) return;
        clearChoices();
        let choicesArray = event.choices
        choicesArray = JSON.parse(choicesArray);
        options = JSON.parse(event.outcomes);
        choicesArray.forEach(choice => {
            const choiceButton = document.createElement('button');
            choiceButton.textContent = choice.text;
            choiceButton.className = 'choice-btn';
            choiceButton.addEventListener('click', () => {
                const outcomeText = options[choice.option];
                eventDescription.textContent = outcomeText;

                const healthImpact = event.health_impact[choice.option] || 0;
                updateHealth(healthImpact);
                clearChoices();
            });
            countryEventSection.appendChild(choiceButton);
        });
    }

    function handleTaskOutcome(task) {
        if (!task || !task.choices || Object.keys(task.choices).length === 0) return;

        clearChoices();
        let choicesArray = task.choices
        choicesArray = JSON.parse(choicesArray);
        options = JSON.parse(task.outcomes);
        console.log(task.outcomes[1])
        choicesArray.forEach(choice => {
            const choiceButton = document.createElement('button');
            choiceButton.textContent = choice.text;
            choiceButton.className = 'choice-btn';
            choiceButton.addEventListener('click', () => {
                const outcomeText = options[choice.option] || 'Outcome not found';
                eventDescription.textContent = outcomeText;

                const healthChange = task.reward_health + task.penalty_health
                updateHealth(healthChange);

                clearChoices();
            });
            countryEventSection.appendChild(choiceButton);
        });
    }

    function clearChoices() {
        const choiceButtons = document.querySelectorAll('.choice-btn');
        choiceButtons.forEach(button => button.remove());
    }
    function useAntidote() {
        if (gameState.antidotes > 0) {
            gameState.health = Math.min(gameState.health + 3, 10);
            gameState.antidotes -= 1;
            console.log(`You used an antidote! Your health is now ${gameState.health}. You have ${gameState.antidotes} antidotes left.`);
            updateHealthUI();
            updateAntidoteUI();
        } else {
            console.log('You have no antidotes to use!');
        }
    }
    function checkHealthStatus() {
        if (gameState.health <= 0) {
            endGame();
        }

        if (gameState.health < 5 && gameState.antidotes > 0) {
            const choiceContainer = document.getElementById('choice-container');

            choiceContainer.innerHTML = '';

            const useAntidoteButton = document.createElement('button');
            useAntidoteButton.textContent = 'Use Antidote';
            useAntidoteButton.className = 'antidote-btn';

            const ignoreButton = document.createElement('button');
            ignoreButton.textContent = 'Ignore';
            ignoreButton.className = 'ignore-btn';

            useAntidoteButton.addEventListener('click', () => {
                if (gameState.antidotes > 0) {
                    gameState.antidotes--;
                    gameState.health += 3;
                    if (gameState.health > 10) gameState.health = 10;
                    updateHealthBar();
                    alert('You used an antidote! Health restored.');
                } else {
                    alert('No antidotes left!');
                }
                choiceContainer.innerHTML = '';
            });


            ignoreButton.addEventListener('click', () => {
                alert('You chose to ignore the antidote!');
                choiceContainer.innerHTML = '';
            });

            choiceContainer.appendChild(useAntidoteButton);
            choiceContainer.appendChild(ignoreButton);
        } else if (gameState.health < 5 && gameState.antidotes === 0) {
            alert('Your health is critically low! You need an antidote to survive!');
        }
    }

    function updateHealth(healthChange) {
        gameState.health += healthChange;
        gameState.health = Math.max(gameState.health, 10)

        if (gameState.health <= 0) {
            gameState.health = 0;
            endGame();
        }

        updateHealthDisplay();
    }

    function updateHealthDisplay() {
        const healthDisplay = document.getElementById('health-display');

        if (healthDisplay) {
            healthDisplay.textContent = `Health: ${gameState.health}`;
        }
    }
    function restartGame() {
        gameState = {
            currentCountry: null,
            visitedCountries: [],
            health: 10,
            antidotes: 0,
            totalAntidotesNeeded: 9,
            countries: ["FI", "SE", "NO", "EE", "LV", "LT", "PL", "SK", "HU", "AT", "DE", "CH", "CZ", "BE", "NL", "FR", "DK", "GB", "IE", "IS"],
        };

        const gameOverScreen = document.querySelector('.game-over-screen');
        if (gameOverScreen) {
            gameOverScreen.remove();
        }

        mapSection.style.display = 'none';
        countryEventSection.style.display = 'none';
        cockpitSection.style.display = 'none';
        menuSection.style.display = 'block'
    }

    function checkGameOver() {
        if (gameState.health <= 0) {
            endGame();
        }
    }

    function endGame() {
        mapSection.style.display = 'none';
        countryEventSection.style.display = 'none';
        cockpitSection.style.display = 'none';

        const gameOverScreen = document.createElement('div');
        gameOverScreen.classList.add('game-over-screen');

        const gameOverMessage = document.createElement('h1');
        gameOverMessage.textContent = 'Game Over';

        const message = document.createElement('p');
        message.textContent = 'Your journey has ended. Better luck next time!';

        const restartButton = document.createElement('button');
        restartButton.textContent = 'Restart';
        restartButton.onclick = restartGame;

        gameOverScreen.appendChild(gameOverMessage);
        gameOverScreen.appendChild(message);
        gameOverScreen.appendChild(restartButton);

        document.body.appendChild(gameOverScreen);
    }
    function checkWinCondition() {
        if (gameState.visitedCountries.length === gameState.countries.length && gameState.health > 0) {
            displayWinningScreen();
        }
    }
    function displayWinningScreen() {
        mapSection.style.display = 'none';
        countryEventSection.style.display = 'none';
        cockpitSection.style.display = 'none';

        const winningScreen = document.createElement('div');
        winningScreen.classList.add('winning-screen');
        winningScreen.innerHTML = `
            <h1>Congratulations, You Won!</h1>
            <p>Your journey has come to an end. Well done!</p>
            <button id="go-to-leaderboard-btn">Go to Leaderboard</button>
        `;

        document.body.appendChild(winningScreen);

        const leaderboardButton = document.getElementById('go-to-leaderboard-btn');
        leaderboardButton.addEventListener('click', () => {
            savePlayerDataToBackend();
            window.location.href = '/leaderboard';
        });
    }
    function savePlayerDataToBackend() {
        const playerData = {
            name: gameState.playerName,
            health: gameState.health,
            time: Math.floor((Date.now() - startTime) / 1000)
        };

        fetch('/api/save-player-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(playerData),
        })
            .then(response => response.json())
            .then(data => {
                console.log('Player data saved:', data);
            })
            .catch(error => {
                console.error('Error saving player data:', error);
            });
    }

});
