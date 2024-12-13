from flask import Flask, jsonify, request
import random
import mysql.connector
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

db_config = {
    "host": "localhost",
    "user": "root",
    "password": "euch7soo",
    "database": "miafe"
}

# Sample leaderboard data
Leaderboard = [
    {'name': 'Player1', 'health': 100,'time':20},
    {'name': 'Player2', 'health': 80,'time':50},
]

# Sample random events/tasks
events_and_tasks = [
    {'name': 'Rescue Mission', 'description': 'Save the citizens trapped in a building!'},
    {'name': 'Antidote Search', 'description': 'Find the antidote hidden in the forest.'},
    {'name': 'Fuel Run', 'description': 'Refuel the plane at a nearby station.'}
]

# Database connection
def get_db_connection():
    try:
        conn = mysql.connector.connect(**db_config)
        return conn
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return None

# Start Game Endpoint
@app.route('/start_game', methods=['POST'])
def start_game():
    # Logic to start the game, for example resetting the game state
    game_state = {"health": 15, "antidotes": 0}
    return jsonify(game_state)

# Leaderboard Endpoint
@app.route('/leaderboard', methods=['GET'])
def get_leaderboard():
    # return jsonify(Leaderboard)
    try:
        # Connect to the database
        connection = get_db_connection()
        cursor = connection.cursor()

        # Fetch the leaderboard data from the database
        cursor.execute("SELECT * FROM leaderboard ORDER BY healthbar_final DESC, time ASC")
        leaderboard_data = cursor.fetchall()

        # Format the results into a list of dictionaries
        leaderboard = []
        for row in leaderboard_data:
            leaderboard.append({
                "leaderboard_id": row[0],
                "player_id": row[1],
                "healthbar_final": row[2],
                "time": row[3]
            })

        # Close the connection
        cursor.close()
        connection.close()

        return jsonify({"leaderboard": leaderboard}), 200

    except Error as e:
        # Handle MySQL errors
        return jsonify({"error": str(e)}), 500

# API Endpoint to get events 
@app.route('/events', methods=['GET'])
def get_events():
    """Fetch all events from the database."""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Failed to connect to the database'}), 500

    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM events")
        events = cursor.fetchall()
        return jsonify(events)
    except mysql.connector.Error as err:
        print(f"Error fetching events: {err}")
        return jsonify({'error': 'Failed to fetch events'}), 500
    finally:
        cursor.close()
        connection.close()
# API Endpoint to get etasks
@app.route('/tasks', methods=['GET'])
def get_tasks():
    """Fetch all tasks from the database."""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Failed to connect to the database'}), 500

    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM tasks")
        tasks = cursor.fetchall()
        return jsonify(tasks)
    except mysql.connector.Error as err:
        print(f"Error fetching tasks: {err}")
        return jsonify({'error': 'Failed to fetch tasks'}), 500
    finally:
        cursor.close()
        connection.close()
# Update leaderboard (post game result)
@app.route('/update_leaderboard', methods=['POST'])
def update_leaderboard():
    try:
        # Get the data from the POST request
        player_data = request.get_json()
        player_id = player_data['name']
        health = player_data['health']  # Assuming health is passed as a value
        time_spent = player_data['time']

        # Connect to the database
        connection = get_db_connection()
        cursor = connection.cursor()

        # Insert the data into the leaderboard table
        cursor.execute("""
            INSERT INTO leaderboard (player_id, healthbar_final, time) 
            VALUES (%s, %s, %s)
        """, (player_id, health, time_spent))

        # Commit changes to the database
        connection.commit()

        # Close the connection
        cursor.close()
        connection.close()

        # Return a success message
        return jsonify({"message": "Leaderboard updated successfully!"}), 200

    except Error as e:
        # Handle MySQL errors
        return jsonify({"error": str(e)}), 500

# Game-related functions
def get_airport():
    sql = """SELECT iso_country, ident, name, type, latitude_deg, longitude_deg
             FROM airport
             WHERE continent = 'EU' AND type = 'large_airport'
             AND iso_country IN ('FI', 'SE', 'NO', 'EE', 'LV', 'LT', 'PL', 'SK', 'HU', 'AT', 'DE', 'CH', 'CZ', 'BE', 'NL', 'FR', 'DK', 'GB', 'IE', 'IS')
             ORDER BY RAND() LIMIT 20"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(sql)
    results = cursor.fetchall()
    conn.close()
    return results

def create_game(username):
    health_bar = 10
    current_airport = random.randint(1, 20)
    countries_visited = 0
    collected_antidotes = {}
    sql = "INSERT INTO player (username, health_bar, current_airport, countries_visited, collected_antidotes) VALUES (%s, %s, %s, %s, %s)"
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(sql, (username, health_bar, current_airport, countries_visited, collected_antidotes))
    conn.commit()
    conn.close()

def add_to_leaderboard(username, score):
    sql = "INSERT INTO leaderboard (username, score) VALUES (%s, %s)"
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(sql, (username, score))
    conn.commit()
    conn.close()

def start_game_story():
    print("\n==============================")
    print("         GAME START")
    print("==============================")
    print("You have been infected by the deadly M3615 Virus!")
    print("To survive, you must travel across Europe to collect antidotes.")
    print("Select a country on the map to travel to. Complete tasks to collect antidotes.")
    print("Good luck, your journey starts now!")
    print("==============================")

def show_menu():
    while True:
        print("\n==============================")
        print("     WELCOME TO M3615 VIRUS")
        print("==============================")
        print("1. Start Game")
        print("2. Leaderboard")
        print("3. Quit")
        print("==============================")

        choice = input("Select an option (1/2/3): ")

        if choice == "1":
            username = input("Enter your name: ")
            start_game_story()
            # Here we can call other game logic like traveling, events, etc.
        elif choice == "2":
            display_leaderboard()
        elif choice == "3":
            quit_confirmation()
        else:
            print("\nInvalid option! Please choose again.")

# Leaderboard display
def display_leaderboard():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT username, score FROM leaderboard ORDER BY score DESC LIMIT 10")
        results = cursor.fetchall()
        conn.close()
        
        if not results:
            print("\nNo leaderboard data available.")
            return
        
        print("\n==============================")
        print("        LEADERBOARD")
        print("==============================")
        print(f"{'Rank':<5} {'Player':<15} {'Score':<10}")
        print("------------------------------")
        
        for idx, row in enumerate(results, start=1):
            print(f"{idx:<5} {row['username']:<15} {row['score']:<10}")
        
        print("==============================")
    
    except mysql.connector.Error as e:
        print(f"Error retrieving leaderboard: {e}")

def quit_confirmation():
    print("\n==============================")
    print("       QUIT THE GAME?")
    print("==============================")
    print("Do you really want to quit the game?")
    print("1. Yes")
    print("2. No")
    print("==============================")

    choice = input("Select an option (1/2): ")
    if choice == "1":
        print("\nThank you for playing! Goodbye.")
        exit()
    elif choice == "2":
        print("\nReturning to the game...")
    else:
        print("\nInvalid choice! Returning to the game...")

if __name__ == "__main__":
    app.run(debug=True)
