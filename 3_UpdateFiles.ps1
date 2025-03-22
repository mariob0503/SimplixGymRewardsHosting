# Define the project path
$projectPath = "C:\Users\mario\OneDrive\Dokumente\SimplixGymRewardsHosting"

# Verify the project directory exists
if (-not (Test-Path -Path $projectPath)) {
    Write-Error "Project directory not found at $projectPath"
    exit
}

# Navigate to the project directory
Set-Location -Path $projectPath

# Define file paths
$publicPath = Join-Path -Path $projectPath -ChildPath "public"
$cssPath = Join-Path -Path $projectPath -ChildPath "css"
$gamesPath = Join-Path -Path $projectPath -ChildPath "games\game1\js"

# Controller HTML content (Version 0.3)
$controllerContentV03 = @'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Controller - Simplix Gym Rewards</title>
  <style>
    body {
      background-color: #000;
      color: #fff;
      font-family: Arial, sans-serif;
      margin: 20px;
      padding: 20px;
    }
    h1 {
      text-align: center;
    }
    #info {
      text-align: center;
      margin-bottom: 20px;
    }
    textarea, button, input {
      font-size: 1em;
      padding: 10px;
      margin: 10px 0;
      width: 100%;
      max-width: 500px;
      display: block;
      margin-left: auto;
      margin-right: auto;
    }
    button {
      background-color: #00BFFF;
      color: #fff;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }
    button:hover {
      background-color: #009acd;
    }
    #contentFrame {
      width: 100%;
      height: 70vh;
      border: none;
      margin-top: 20px;
    }
    .placeholder-buttons {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      justify-content: center;
      margin-top: 20px;
    }
    .placeholder-buttons button {
      background-color: #00BFFF;
      border: none;
      padding: 15px 25px;
      font-size: 1em;
      color: #fff;
      cursor: pointer;
      border-radius: 5px;
      transition: background-color 0.3s ease;
    }
  </style>
</head>
<body>
  <h1>Controller</h1>
  <p id="info">Preparing connection...</p>
  <input type="url" id="urlInput" placeholder="Enter website URL to mirror" />
  <button id="loadUrlButton">Load Website</button>
  <textarea id="contentInput" rows="4" placeholder="Or type your message here"></textarea>
  <button id="updateButton">Update Display</button>
  <iframe id="contentFrame"></iframe>

  <div class="placeholder-buttons">
    <button onclick="placeholderGame1()">Game 1</button>
    <button onclick="placeholderGame2()">Game 2</button>
    <button onclick="placeholderQrCodeLogin()">QR Code Login</button>
    <button onclick="placeholderLeaderboard()">Leaderboard</button>
  </div>

  <script src="https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js"></script>
  <script src="https://www.gstatic.com/firebasejs/8.10.0/firebase-database.js"></script>
  <script>
    function getQueryParam(param) {
      var params = new URLSearchParams(window.location.search);
      return params.get(param);
    }

    var displayId = getQueryParam("display");
    if (!displayId) {
      document.getElementById("info").textContent = "Error: No display ID found in URL.";
    } else {
      document.getElementById("info").textContent = "Controlling display: " + displayId;
    }

    var firebaseConfig = {
      authDomain: "simplixgymrewards.firebaseapp.com",
      databaseURL: "https://simplixgymrewards-default-rtdb.europe-west1.firebasedatabase.app",
      projectId: "simplixgymrewards",
      storageBucket: "simplixgymrewards.appspot.com",
      messagingSenderId: "821049711023"
    };
    firebase.initializeApp(firebaseConfig);

    var displaysRef = firebase.database().ref("displays");

    window.addEventListener("DOMContentLoaded", function() {
      if (displayId) {
        displaysRef.child(displayId).set({ content: "CONNECTED" })
          .then(function(){
            console.log("Connection message sent for display " + displayId);
          })
          .catch(function(error){
            console.error("Error sending connection message: " + error);
          });
      }
    });

    document.getElementById("loadUrlButton").addEventListener("click", function() {
      var url = document.getElementById("urlInput").value;
      if (url && displayId) {
        try {
          new URL(url);
          document.getElementById("contentFrame").style.display = "none";
          document.getElementById("info").textContent = "Loading website...";
          
          const frame = document.getElementById("contentFrame");
          frame.onload = function() {
            document.getElementById("info").textContent = "Website loaded";
            frame.style.display = "block";
            displaysRef.child(displayId).set({ 
              url: url,
              timestamp: Date.now()
            });
          };
          
          frame.onerror = function() {
            document.getElementById("info").textContent = "Error loading website";
            alert("There was an error loading the website. Some websites may not allow being displayed in frames.");
          };
          
          frame.src = url;
        } catch(e) {
          alert("Please enter a valid URL including http:// or https://");
        }
      }
    });

    document.getElementById("updateButton").addEventListener("click", function(){
      var content = document.getElementById("contentInput").value;
      if (displayId) {
        displaysRef.child(displayId).set({ content: content })
          .then(function(){
            console.log("Display updated!");
          })
          .catch(function(error){
            console.error("Error updating display: " + error);
          });
      } else {
        alert("No display ID specified. Cannot update display.");
      }
    });

    function placeholderGame1() {
      if (displayId) {
        // Redirect to game1 with displayId
        window.location.href = `/games/game1/index.html?display=${encodeURIComponent(displayId)}`;
      } else {
        alert("No display ID specified. Please connect first.");
      }
    }

    function placeholderGame2() {
      if (displayId) {
        displaysRef.child(displayId).set({ content: "GAME2" });
      }
    }
    function placeholderQrCodeLogin() {
      if (displayId) {
        displaysRef.child(displayId).set({ content: "LOGIN" });
      }
    }
    function placeholderLeaderboard() {
      if (displayId) {
        displaysRef.child(displayId).set({ content: "LEADERBOARD" });
      }
    }
  </script>
</body>
</html>
'@

# Index HTML content (Version 0.3)
$indexContentV03 = @'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Lift and Earn - Display</title>
  <style>
    body {
      background-color: #000;
      color: #fff;
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    header {
      border: 2px solid #00BFFF;
      padding: 20px;
      text-align: center;
      width: 100%;
      max-width: 800px;
      margin-bottom: 30px;
    }
    .qr-container {
      margin: 20px 0;
    }
    #qrCode {
      border: 2px solid #00BFFF;
      padding: 10px;
      background-color: #111;
    }
    #mirroredContent {
      font-size: 28px;
      margin-bottom: 20px;
    }
    #mirroredFrame {
      width: 100vw;
      height: 100vh;
      border: none;
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 1000;
      background: #fff;
    }
    #timer {
      font-size: 22px;
      color: #00BFFF;
      margin-bottom: 30px;
    }
    .placeholder-buttons {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      justify-content: center;
    }
    .placeholder-buttons button {
      background-color: #00BFFF;
      border: none;
      padding: 15px 25px;
      font-size: 1em;
      color: #fff;
      cursor: pointer;
      border-radius: 5px;
      transition: background-color 0.3s ease;
    }
    .placeholder-buttons button:hover {
      background-color: #009acd;
    }
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
</head>
<body>
  <header>
    <h1>Lift and Earn</h1>
    <h3>Simplix Gym Rewards</h3>
  </header>
  <div class="qr-container">
    <div id="qrCode"></div>
  </div>
  <div id="mirroredContent">Waiting for connection...</div>
  <div id="timer"></div>
  <iframe id="mirroredFrame"></iframe>
  
  <div class="placeholder-buttons">
    <button onclick="placeholderGame1()">Game 1</button>
    <button onclick="placeholderGame2()">Game 2</button>
    <button onclick="placeholderQrCodeLogin()">QR Code Login</button>
    <button onclick="placeholderLeaderboard()">Leaderboard</button>
  </div>

  <script src="https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js"></script>
  <script src="https://www.gstatic.com/firebasejs/8.10.0/firebase-database.js"></script>
  <script>
    var firebaseConfig = {
      authDomain: "simplixgymrewards.firebaseapp.com",
      databaseURL: "https://simplixgymrewards-default-rtdb.europe-west1.firebasedatabase.app",
      projectId: "simplixgymrewards",
      storageBucket: "simplixgymrewards.appspot.com",
      messagingSenderId: "821049711023"
    };
    firebase.initializeApp(firebaseConfig);
    
    var displayId = localStorage.getItem("displayId");
    if (!displayId) {
      displayId = "display_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("displayId", displayId);
    }

    var displaysRef = firebase.database().ref("displays");

    window.addEventListener("DOMContentLoaded", function() {
      displaysRef.child(displayId).set({ content: "" });
      document.getElementById("mirroredContent").textContent = "Waiting for connection...";
      document.getElementById("timer").textContent = "";
      
      // Generate QR code with conditional URL
      var baseUrl = window.location.hostname === "localhost" 
        ? "http://localhost:5000"
        : "https://simplixgymrewards.web.app";
      var controllerUrl = baseUrl + "/controller.html?display=" + encodeURIComponent(displayId);
      
      new QRCode(document.getElementById("qrCode"), {
        text: controllerUrl,
        width: 256,
        height: 256,
        colorDark: "#FFFFFF",
        colorLight: "#000000"
      });
    });

    var timerInterval;
    function startTimer(duration) {
      var timer = duration;
      var display = document.getElementById("timer");
      if (timerInterval) clearInterval(timerInterval);
      timerInterval = setInterval(function () {
        display.textContent = "Time remaining: " + timer + " seconds";
        if (--timer < 0) {
          clearInterval(timerInterval);
          display.textContent = "Timer finished.";
        }
      }, 1000);
    }

    displaysRef.child(displayId).on("value", function(snapshot) {
      var data = snapshot.val();
      if (data) {
        if (data.content === "CONNECTED") {
          document.getElementById("mirroredContent").textContent = "Connection successful!";
          startTimer(90);
          document.getElementById("qrCode").style.display = "none";
        } else if (data.url) {
          document.getElementById("mirroredContent").style.display = "none";
          document.getElementById("mirroredFrame").style.display = "block";
          document.getElementById("mirroredFrame").src = data.url;
        } else if (data.content) {
          document.getElementById("mirroredContent").textContent = data.content;
          document.getElementById("mirroredFrame").style.display = "none";
          document.getElementById("mirroredContent").style.display = "block";
        }
      }
    });

    function placeholderGame1() {
      alert("Button Game 1 pushed");
    }
    function placeholderGame2() {
      alert("Button Game 2 pushed");
    }
    function placeholderQrCodeLogin() {
      alert("Button QR Code Login pushed");
    }
    function placeholderLeaderboard() {
      alert("Button Leaderboard pushed");
    }
  </script>
</body>
</html>
'@

# Controller HTML content (current active version, matching Version 0.3 for now)
$controllerContent = $controllerContentV03

# Index HTML content (current active version, matching Version 0.3 for now)
$indexContent = $indexContentV03

# Display CSS content (minimal styling)
$displayCssContent = @'
body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #f0f0f0;
}

h1 {
    color: #333;
    text-align: center;
}

#status {
    text-align: center;
    margin-top: 20px;
    font-size: 1.2em;
    color: #666;
}
'@

# Game JS content (from your provided FruitSequenceGame class)
$gameJsContent = @'
class FruitSequenceGame {
    constructor() {
        this.score = 0;
        this.round = 1;
        this.timeLimit = 10;
        this.sequence = [];
        this.playerSequence = [];
        this.fruits = Array.from({length: 10}, (_, i) => `Fruit${i + 1}.svg`);
        this.database = window.DATABASE;

        // Bind all methods
        this.setupGame = this.setupGame.bind(this);
        this.updateScore = this.updateScore.bind(this);
        this.setupEventListeners = this.setupEventListeners.bind(this);
        this.startRound = this.startRound.bind(this);
        this.generateSequence = this.generateSequence.bind(this);
        this.displaySequence = this.displaySequence.bind(this);
        this.displayAvailableFruits = this.displayAvailableFruits.bind(this);
        this.handleFruitClick = this.handleFruitClick.bind(this);
        this.checkSequence = this.checkSequence.bind(this);
        this.startTimer = this.startTimer.bind(this);
        this.completeRound = this.completeRound.bind(this);
        this.endGame = this.endGame.bind(this);

        this.setupGame();
    }

    setupGame() {
        this.score = 0;
        this.updateScore();
        this.setupEventListeners();
        this.startRound();
    }

    updateScore() {
        document.getElementById("score").textContent = this.score;
    }

    setupEventListeners() {
        document.getElementById("playAgain").addEventListener("click", () => {
            document.getElementById("gameOver").classList.add("hidden");
            this.setupGame();
        });

        document.getElementById("returnToGame").addEventListener("click", () => {
            document.getElementById("leaderboard").classList.add("hidden");
            this.setupGame();
        });
    }

    startRound() {
        this.sequence = this.generateSequence(3);
        this.playerSequence = [];
        this.displaySequence();
        this.startTimer();
    }

    generateSequence(length) {
        return Array.from({length}, () => 
            this.fruits[Math.floor(Math.random() * this.fruits.length)]
        );
    }

    displaySequence() {
        const targetDiv = document.getElementById("targetFruits");
        targetDiv.innerHTML = "";
        this.sequence.forEach(fruit => {
            const img = document.createElement("img");
            img.src = `assets/images/${fruit}`;
            img.classList.add("fruit");
            targetDiv.appendChild(img);
        });

        this.displayAvailableFruits();
    }

    displayAvailableFruits() {
        const fruitsDiv = document.getElementById("availableFruits");
        fruitsDiv.innerHTML = "";
        this.fruits.forEach(fruit => {
            const img = document.createElement("img");
            img.src = `assets/images/${fruit}`;
            img.classList.add("fruit");
            img.addEventListener("click", () => this.handleFruitClick(fruit));
            fruitsDiv.appendChild(img);
        });
    }

    handleFruitClick(fruit) {
        this.playerSequence.push(fruit);
        const isCorrect = this.checkSequence();
        
        if (!isCorrect) {
            this.endGame();
        } else if (this.playerSequence.length === this.sequence.length) {
            this.completeRound();
        }
    }

    checkSequence() {
        return this.playerSequence.every((fruit, index) => 
            fruit === this.sequence[index]
        );
    }

    startTimer() {
        let timeLeft = this.timeLimit;
        document.getElementById("timer").textContent = timeLeft.toFixed(1);

        this.timer = setInterval(() => {
            timeLeft -= 0.1;
            document.getElementById("timer").textContent = timeLeft.toFixed(1);

            if (timeLeft <= 0) {
                this.endGame();
            }
        }, 100);
    }

    completeRound() {
        clearInterval(this.timer);
        const roundPoints = this.round + 1;
        this.score += roundPoints;
        this.updateScore();
        this.round++;
        this.timeLimit *= 0.75;
        
        setTimeout(() => this.startRound(), 1000);
    }

    endGame() {
        clearInterval(this.timer);
        document.getElementById("gameOver").classList.remove("hidden");
        document.getElementById("finalScore").textContent = this.score;
    }
}

// Start the game when the page loads
document.addEventListener("DOMContentLoaded", () => {
    try {
        new FruitSequenceGame();
    } catch (error) {
        console.error("Failed to initialize game:", error);
    }
});
'@

# Save the versioned files
$controllerPathV03 = Join-Path -Path $publicPath -ChildPath "controller.v0.3.html"
$indexPathV03 = Join-Path -Path $publicPath -ChildPath "index.v0.3.html"
$controllerPath = Join-Path -Path $publicPath -ChildPath "controller.html"
$indexPath = Join-Path -Path $publicPath -ChildPath "index.html"
Sorry about that, something didn't go as planned. Please try again, and if you're still seeing this message, go ahead and restart the app.