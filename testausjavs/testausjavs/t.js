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
    const BACKEND_URL = "http://127.0.0.1:5000";  // URL for the Flask 

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

        // If the user clicks "Yes", go back to the main menu
        if (userConfirmed) {
            // Hide the current game section (cockpit)
            cockpitSection.style.display = 'none';

            // Show the menu section
            menuSection.style.display = 'none';
        }
        // If the user clicks "No", do nothing and keep them in the current section
    });
    // Open Map
    mapBtn.addEventListener('click', () => {
        cockpitSection.style.display = 'none';
        mapSection.style.display = 'block';
        populateCountryList();
    });

    // Back to Cockpit
    backToCockpitBtn.addEventListener('click', () => {
        mapSection.style.display = 'none';
        cockpitSection.style.display = 'block';
    });

    // Back to Map
    backToMapBtn.addEventListener('click', () => {
        countryEventSection.style.display = 'none';
        mapSection.style.display = 'block';
        updateCockpitUI();
        populateCountryList();
    });

    // Function to populate the country grid dynamically
    async function populateCountryList() {
        const countryGrid = document.getElementById('country-grid');
        countryGrid.innerHTML = ''; // Clear previous entries

        // Loop through the countries in gameState
        gameState.countries.forEach(country => {
            const countryButton = document.createElement('div'); // Use 'div' for grid layout
            countryButton.textContent = country;
            countryButton.className = 'country-btn';

            // Disable button or mark as visited if the country has been visited
            if (gameState.visitedCountries.includes(country)) {
                countryButton.classList.add('visited');  // Add visited class to style it differently
                countryButton.disabled = true;           // Disable the button to prevent interaction
            } else {
                // Add click event to open country-specific event
                countryButton.addEventListener('click', () => openCountryEvent(country));
            }

            // Append the button to the grid
            countryGrid.appendChild(countryButton);
        });
    }
    function checkHealthStatus() {
        if (gameState.health < 5 && gameState.antidotes > 0) {
            const choiceContainer = document.getElementById('choice-container');

            // Clear any existing buttons in the container
            choiceContainer.innerHTML = '';

            // Create buttons for using the antidote or ignoring
            const useAntidoteButton = document.createElement('button');
            useAntidoteButton.textContent = 'Use Antidote';
            useAntidoteButton.className = 'antidote-btn';

            const ignoreButton = document.createElement('button');
            ignoreButton.textContent = 'Ignore';
            ignoreButton.className = 'ignore-btn';

            // Add event listener for "Use Antidote"
            useAntidoteButton.addEventListener('click', () => {
                if (gameState.antidotes > 0) {
                    gameState.antidotes--; // Reduce antidotes
                    gameState.health += 3; // Heal the player (adjust value as needed)
                    if (gameState.health > 10) gameState.health = 10; // Cap health at maximum
                    updateHealthBar();
                    alert('You used an antidote! Health restored.');
                } else {
                    alert('No antidotes left!');
                }
                // Clear buttons after action
                choiceContainer.innerHTML = '';
            });

            // Add event listener for "Ignore"
            ignoreButton.addEventListener('click', () => {
                alert('You chose to ignore the antidote!');
                // Clear buttons after action
                choiceContainer.innerHTML = '';
            });

            // Append buttons to the container
            choiceContainer.appendChild(useAntidoteButton);
            choiceContainer.appendChild(ignoreButton);
        }
    } function updateHealthBar() {
        // Check if the health-bar container exists
        let healthBarContainer = document.getElementById('health-bar');
        if (!healthBarContainer) {
            console.warn("Health bar container not found! Creating a new one.");

            // Create the health-bar container
            healthBarContainer = document.createElement('div');
            healthBarContainer.id = 'health-bar';
            healthBarContainer.style.width = '100%';
            healthBarContainer.style.backgroundColor = '#4caf50';
            healthBarContainer.style.borderRadius = '8px';
            healthBarContainer.style.height = '25px';
            healthBarContainer.style.boxShadow = 'inset 0 4px 6px rgba(0, 0, 0, 0.2)';
            healthBarContainer.style.marginTop = '10px';

            // Append the container to its parent
            const healthDisplay = document.getElementById('health-display');
            if (!healthDisplay) {
                console.error("Health display container not found! Cannot create health bar.");
                return;
            }
            healthDisplay.appendChild(healthBarContainer);
        }

        // Check if the health-progress bar exists
        let healthProgress = document.getElementById('health-progress');
        if (!healthProgress) {
            console.warn("Health progress bar element not found! Creating a new one.");

            // Create the health-progress element
            healthProgress = document.createElement('div');
            healthProgress.id = 'health-progress';
            healthProgress.style.backgroundColor = '#ff9800';
            healthProgress.style.height = '100%';
            healthProgress.style.borderRadius = '8px';
            healthProgress.style.width = '100%'; // Default full width
            healthProgress.style.transition = 'width 0.3s ease'; // Smooth transition

            // Append it to the health-bar container
            healthBarContainer.appendChild(healthProgress);
        }

        // Update the width based on the current health percentage
        const healthPercentage = (gameState.health / 10) * 100; // Assuming max health is 10
        healthProgress.style.width = `${healthPercentage}%`;
    }
    function decreaseHealth(amount = 1) {
        // Decrease health by the specified amount (default is 1)
        gameState.health -= amount;

        // Ensure health does not drop below 0
        if (gameState.health < 0) {
            gameState.health = 0;
        }

        // Update the health bar display
        updateHealthBar();

        // Check if the player has lost all health
        if (gameState.health <= 0) {
            checkGameOver();
        }
    }
    async function openCountryEvent(country) {
        mapSection.style.display = 'none';
        countryEventSection.style.display = 'block';

        // Update the event title with the selected country
        eventTitle.textContent = `You have selected this country: ${country}`;

        // First, set the default event description
        eventDescription.textContent = 'You land the plane safely. Time to see what happens!';
        eventDescription.style.color = 'black';
        // Update the health display
        updateHealthBar();
        // Mark the country as visited in the game state
        gameState.visitedCountries.push(country);
        decreaseHealth(1)
        // Create and append the continue button
        const continueButton = document.createElement('button');
        continueButton.textContent = 'Continue';
        continueButton.className = 'continue-btn';

        continueButton.addEventListener('click', () => {
            // Hide the continue button after it is clicked
            continueButton.style.display = 'none'; // This hides the button after click

            // Determine if the player encounters an event or a task
            const randomValue = Math.random(); // Generates a value between 0 and 1
            if (randomValue < 0.5) {
                // Show an event (50% chance)
                const event = getRandomEvent();
                console.log(event);
                if (event) {
                    eventDescription.textContent = event.description;
                    handleEventOutcome(event);
                } else {
                    eventDescription.textContent = 'No events available right now. Continue your journey!';
                }
            } else if (randomValue < 0.6) {
                // Show a task (50% chance)
                const task = getRandomTask();
                console.log(task);
                if (task) {
                    eventDescription.textContent = task.description;
                    handleTaskOutcome(task);
                } else {
                    eventDescription.textContent = 'No tasks available right now. Continue your journey!';
                }
            } else {
                // Neither event nor task (20% chance)
                eventDescription.textContent = 'Nothing happens this time. Rest up and prepare for the next destination!';
            }
            // Check if the player is out of health
            checkGameOver();
        });
        checkHealthStatus();
        // Append the button to the event section
        countryEventSection.appendChild(continueButton);
    }

    function handleEventOutcome(event) {
        if (!event || !event.choices || Object.keys(event.choices).length === 0) return;

        // Clear previous choices if any
        clearChoices();
        let choicesArray = event.choices
        choicesArray = JSON.parse(choicesArray);
        options = JSON.parse(event.outcomes);
        // Create buttons for each choice based on options
        choicesArray.forEach(choice => {
            const choiceButton = document.createElement('button');
            choiceButton.textContent = choice.text; // Display the text of the choice
            choiceButton.className = 'choice-btn';
            choiceButton.addEventListener('click', () => {
                // When a choice is made, show the outcome
                const outcomeText = options[choice.option];
                eventDescription.textContent = outcomeText;

                // Update the player's health based on the choice
                const healthImpact = event.health_impact[choice.option] || 0;
                updateHealth(healthImpact);
                // Disable the choice buttons after selection
                clearChoices();
            });
            countryEventSection.appendChild(choiceButton);
        });
    }

    function handleTaskOutcome(task) {
        if (!task || !task.choices || Object.keys(task.choices).length === 0) return;

        // Clear previous choices if any
        clearChoices();
        // Ensure task.choices is an array of objects
        let choicesArray = task.choices
        choicesArray = JSON.parse(choicesArray);
        options = JSON.parse(task.outcomes);
        console.log(task.outcomes[1])
        // Create buttons for each choice based on options
        choicesArray.forEach(choice => {
            const choiceButton = document.createElement('button');
            choiceButton.textContent = choice.text; // Display the text of the choice
            choiceButton.className = 'choice-btn';
            choiceButton.addEventListener('click', () => {
                // When a choice is made, show the outcome
                const outcomeText = options[choice.option] || 'Outcome not found';
                eventDescription.textContent = outcomeText;

                // Update the player's health based on the choice
                const healthChange = task.reward_health + task.penalty_health
                updateHealth(healthChange);

                // Disable the choice buttons after selection
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
            gameState.health = Math.min(gameState.health + 3, 10); // Heals 3 health points, max health is 10
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
            endGame();  // Call your end game function if health reaches 0
        }

        if (gameState.health < 5 && gameState.antidotes > 0) {
            const choiceContainer = document.getElementById('choice-container');

            // Clear any existing buttons in the container
            choiceContainer.innerHTML = '';

            // Create buttons for using the antidote or ignoring
            const useAntidoteButton = document.createElement('button');
            useAntidoteButton.textContent = 'Use Antidote';
            useAntidoteButton.className = 'antidote-btn';

            const ignoreButton = document.createElement('button');
            ignoreButton.textContent = 'Ignore';
            ignoreButton.className = 'ignore-btn';

            // Add event listener for "Use Antidote"
            useAntidoteButton.addEventListener('click', () => {
                if (gameState.antidotes > 0) {
                    gameState.antidotes--; // Reduce antidotes
                    gameState.health += 3; // Heal the player (adjust value as needed)
                    if (gameState.health > 10) gameState.health = 10; // Cap health at maximum
                    updateHealthBar();
                    alert('You used an antidote! Health restored.');
                } else {
                    alert('No antidotes left!');
                }
                // Clear buttons after action
                choiceContainer.innerHTML = '';
            });

            // Add event listener for "Ignore"
            ignoreButton.addEventListener('click', () => {
                alert('You chose to ignore the antidote!');
                // Clear buttons after action
                choiceContainer.innerHTML = '';
            });

            // Append buttons to the container
            choiceContainer.appendChild(useAntidoteButton);
            choiceContainer.appendChild(ignoreButton);
        } else if (gameState.health < 5 && gameState.antidotes === 0) {
            alert('Your health is critically low! You need an antidote to survive!');
        }
    }
    // Function to update the player's health
    function updateHealth(healthChange) {
        // Update the health value
        gameState.health += healthChange;
        gameState.health = Math.max(gameState.health, 10)

        // Ensure health doesn't go below 0
        if (gameState.health <= 0) {
            gameState.health = 0;
            endGame(); // Call the game over function if health is 0 or below
        }

        // Update the displayed health on the screen
        updateHealthDisplay();
    }

    // Function to update the health display on the screen
    function updateHealthDisplay() {
        const healthDisplay = document.getElementById('health-display');

        if (healthDisplay) {
            healthDisplay.textContent = `Health: ${gameState.health}`;
        }
    }
    // Function to reset the game state
    function restartGame() {
        // Reset the game state (e.g., health, antidotes, visited countries, etc.)
        gameState = {
            currentCountry: null,
            visitedCountries: [],
            health: 10,
            antidotes: 0,
            totalAntidotesNeeded: 9,
            countries: ["FI", "SE", "NO", "EE", "LV", "LT", "PL", "SK", "HU", "AT", "DE", "CH", "CZ", "BE", "NL", "FR", "DK", "GB", "IE", "IS"],
        };

        // Hide the game over screen and show the menu or starting screen again
        const gameOverScreen = document.querySelector('.game-over-screen');
        if (gameOverScreen) {
            gameOverScreen.remove(); // Remove the game over screen
        }

        // Reset other UI elements and show the starting screen (menu or cockpit)
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
        // Hide all game sections
        mapSection.style.display = 'none';
        countryEventSection.style.display = 'none';
        cockpitSection.style.display = 'none';

        // Create and style the game over screen
        const gameOverScreen = document.createElement('div');
        gameOverScreen.classList.add('game-over-screen');

        // Add game over message
        const gameOverMessage = document.createElement('h1');
        gameOverMessage.textContent = 'Game Over';

        const message = document.createElement('p');
        message.textContent = 'Your journey has ended. Better luck next time!';

        // Create the Restart button separately
        const restartButton = document.createElement('button');
        restartButton.textContent = 'Restart';
        restartButton.onclick = restartGame;  // Attach the restartGame function here

        // Append elements to the gameOverScreen
        gameOverScreen.appendChild(gameOverMessage);
        gameOverScreen.appendChild(message);
        gameOverScreen.appendChild(restartButton);

        // Append the game over screen to the body
        document.body.appendChild(gameOverScreen);
    }
    function checkWinCondition() {
        // For example, the player wins if they've visited all countries and have health left
        if (gameState.visitedCountries.length === gameState.countries.length && gameState.health > 0) {
            displayWinningScreen();
        }
    }
    function displayWinningScreen() {
        // Hide game sections
        mapSection.style.display = 'none';
        countryEventSection.style.display = 'none';
        cockpitSection.style.display = 'none';

        // Create winning screen
        const winningScreen = document.createElement('div');
        winningScreen.classList.add('winning-screen');
        winningScreen.innerHTML = `
            <h1>Congratulations, You Won!</h1>
            <p>Your journey has come to an end. Well done!</p>
            <button id="go-to-leaderboard-btn">Go to Leaderboard</button>
        `;

        // Append to the body
        document.body.appendChild(winningScreen);

        // Add event listener to the "Go to Leaderboard" button
        const leaderboardButton = document.getElementById('go-to-leaderboard-btn');
        leaderboardButton.addEventListener('click', () => {
            // Send the player's data to the backend
            savePlayerDataToBackend();
            // Redirect to the leaderboard
            window.location.href = '/leaderboard'; // Assuming this URL will display the leaderboard
        });
    }
    function savePlayerDataToBackend() {
        const playerData = {
            name: gameState.playerName, // Assuming you have a player name
            health: gameState.health,
            time: Math.floor((Date.now() - startTime) / 1000)
        };

        // Send player data to the backend
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
