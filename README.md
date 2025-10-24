# **🎮 Arcadia: The Web Game Portal**

<p align="center">  
<strong>A modern, full-stack web application featuring a suite of 8 classic, playable games with user accounts and a persistent global leaderboard.</strong>  
</p>  
<p align="center"> 
<img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">  
<img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">  
<img src="https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E" alt="JavaScript">  
<img src="https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white" alt="PHP">  
<img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL">  
<img src="https://img.shields.io/badge/Tailwind-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">  
<img src="https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white" alt="Google Gemini"> 
</p>  
<img src="https://img.shields.io/badge/Xampp-F37623?style=for-the-badge&logo=xampp&logoColor=white" alt="XAMPP"> 
<p align="center">  
<!--  
NOTE TO USER:  
It's highly recommended to add a screenshot of your project here!  
A great one would be the dashboard.png (like the one you sent me).  
You can add it like this:  
<img src="https." alt="Arcadia Game Dashboard">  
-->  
</p>

## **🌟 About The Project**

Arcadia is a complete web-based gaming platform built from the ground up. It provides a seamless user experience, allowing players to register, log in, and compete in a variety of classic games. The core of the project is a PHP-powered RESTful API that handles user authentication and a persistent, cumulative scoring system, feeding a dynamic global leaderboard for each game.

This project was built to demonstrate a full-stack development workflow, combining a sleek, responsive frontend with a robust, session-based PHP backend and a MySQL database.

## **✨ Key Features**

* **Full User Authentication:** Secure registration and login system with PHP sessions.  
* **Dynamic Game Dashboard:** A central hub that dynamically loads and displays all available games.  
* **8 Fully-Playable Games:** A diverse suite of games, each with polished UI and scoring.  
* **Persistent Scoring System:** Scores are saved to the database *cumulatively*, adding to a player's total for each game.  
* **Global Leaderboards:** A dynamic leaderboard page that can be filtered to show the top players for each individual game.  
* **Sleek & Responsive UI:** A modern, dark-themed UI built with Tailwind CSS that looks great on both desktop and mobile.  
* **RESTful API Backend:** The JavaScript frontend communicates with the PHP backend via fetch requests to api/ endpoints to save scores, log in users, and get leaderboard data without page reloads.

## **🕹️ The Games**

Arcadia comes packed with 8 classic games, each fully implemented and integrated into the scoring system.

| Game | Description |
| :---- | :---- |
| **2048** | The classic tile-merging puzzle game, built with smooth animations. |
| **Tic-Tac-Toe** | Play against a challenging computer opponent. |
| **Rock Paper Scissors** | A "best of three" match against the AI to test your luck. |
| **Wordle** | A full-featured clone of the viral word-guessing game with all the classic mechanics. |
| **Unscramble Words** | A fast-paced, timed game to unscramble as many words as you can. |
| **Math Riddles** | Solve math problems against the clock across three difficulty levels (Easy, Medium, Hard). |
| **Sudoku** | A complete Sudoku experience with a robust, valid puzzle generator, timer, and keyboard controls. |
| **Flappy Bird** | The iconic, challenging arcade game, rebuilt from scratch in HTML5 Canvas. |

## **💻 Technology Stack**

This project utilizes a classic, powerful, and reliable stack for web development.

### **Frontend**

* **HTML5:** Semantic markup for all pages and game structures.  
* **CSS3:** Custom styling for games, animations, and modals.  
* **JavaScript (ES6+):** Powers all game logic, user interactions, and API communication (fetch).  
* **Tailwind CSS (CDN):** Used for the main application layout, dashboard, and headers to ensure a consistent, responsive, and modern design.  
* **Lucide Icons:** Provides clean, beautiful icons for the dashboard and UI elements.

### **Backend**

* **PHP:** The core of the backend. Used to manage sessions, handle user authentication, and process API requests.  
* **RESTful API:** A custom-built API in the /api directory handles all data requests (e.g., login.php, save\_score.php, get\_scores.php).

### **Database**

* **MySQL:** Stores all persistent data, including user credentials (hashed passwords) and cumulative game scores.

### **Environment**

* **XAMPP:** The development environment, providing Apache as the web server and phpMyAdmin for database management.

## **🚀 Getting Started**

To get a local copy up and running, follow these simple steps.

### **Prerequisites**

You must have a local server environment with PHP and MySQL. The easiest way is to install **XAMPP**.

* [Download XAMPP](https://www.apachefriends.org/index.html)

### **Installation**

1. **Start XAMPP:** Open the XAMPP Control Panel and start the **Apache** and **MySQL** modules.  
2. **Clone the Repo:** Clone this project into your htdocs folder (the default web directory for XAMPP).  
   * Find your htdocs folder (e.g., C:/xampp/htdocs/)  
   * git clone https://github.com/your-username/arcadia.git  
   * (Or just download the ZIP and extract it into htdocs as a folder named arcadia)  
3. **Import the Database:**  
   * Open your browser and go to http://localhost/phpmyadmin/.  
   * Click on the **New** button in the left sidebar to create a new database.  
   * Name the database arcadia and click **Create**.  
   * Select the arcadia database you just created.  
   * Click on the **Import** tab at the top.  
   * Click "Choose File" and select the arcadia.sql file from the project's root directory.  
   * Scroll down and click **Go**. This will create the users and scores tables.  
4. **Configure Database Connection (Optional):**  
   * The project is configured by default to connect to a MySQL server on localhost with the username root and *no password*.  
   * If your MySQL setup is different, open /api/db\_connect.php and update the $servername, $username, $password, and $dbname variables.  
5. **Run the Project:**  
   * You're all set\! Open your browser and navigate to:  
   * http://localhost/arcadia/  
   * You can start by registering a new account.

## **🤝 Acknowledgements**

This project was a fantastic journey. A huge thanks to Google's Gemini, which served as an AI collaborator and development partner. It helped generate the boilerplate code, debug complex logic, iterate on UI/UX, and bring this entire project from a simple idea to a fully functional platform.