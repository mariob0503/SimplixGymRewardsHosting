// This script helps set up the gyms collection in Firestore
// Run this script once to populate your database with gym locations

// Sample gym data - replace with your actual gym locations
const gymLocations = [
  {
    name: "Simplix Fitness Berlin",
    address: "Berliner Str. 123, 10115 Berlin",
    phone: "+49 30 12345678",
    hours: "Mon-Fri: 6am-10pm, Sat-Sun: 8am-8pm"
  },
  {
    name: "Simplix Gym Hamburg",
    address: "Hamburger Allee 45, 20095 Hamburg",
    phone: "+49 40 87654321",
    hours: "Mon-Fri: 6am-11pm, Sat-Sun: 8am-9pm"
  },
  {
    name: "Simplix Fitness München",
    address: "Münchener Platz 7, 80331 München",
    phone: "+49 89 23456789",
    hours: "Mon-Fri: 5am-10pm, Sat-Sun: 7am-8pm"
  },
  {
    name: "Simplix Gym Frankfurt",
    address: "Frankfurter Ring 28, 60311 Frankfurt",
    phone: "+49 69 34567890",
    hours: "Mon-Fri: 6am-10pm, Sat-Sun: 8am-8pm"
  },
  {
    name: "Simplix Fitness Köln",
    address: "Kölner Str. 55, 50667 Köln",
    phone: "+49 221 45678901",
    hours: "Mon-Fri: 6am-10pm, Sat-Sun: 8am-8pm"
  }
];

// Global variables
let existingGyms = {};

// Function to load and display gyms
window.loadGyms = async function() {
  const gymListElement = document.querySelector('.gym-list');
  const gymSelect = document.getElementById('gymSelect');
  if (!gymListElement) return;
  
  gymListElement.innerHTML = '<p>Loading gyms...</p>';
  
  try {
    // Get Firestore instance from the compat version
    const db = firebase.firestore();
    
    // Get all gyms
    const gymsSnapshot = await db.collection('gyms').get();
    
    // Reset existing gyms object
    existingGyms = {};
    
    // Reset select options
    gymSelect.innerHTML = '<option value="new">-- Add New Gym --</option>';
    
    if (gymsSnapshot.empty) {
      gymListElement.innerHTML = '<p>No gyms found. Use the form above to add gym locations.</p>';
      return;
    }
    
    // Build HTML for gym list
    let gymListHTML = '<h3>Current Gym Locations</h3>';
    
    gymsSnapshot.forEach(doc => {
      const gym = doc.data();
      existingGyms[doc.id] = gym;
      
      // Add to select options
      gymSelect.innerHTML += `<option value="${doc.id}">${gym.name}</option>`;
      
      gymListHTML += `
        <div class="gym-item">
          <h4>${gym.name}</h4>
          <p><small>Last updated: ${gym.lastUpdated ? new Date(gym.lastUpdated.toDate()).toLocaleString() : 'Unknown'}</small></p>
        </div>
      `;
    });
    
    gymListElement.innerHTML = gymListHTML;
    
  } catch (error) {
    console.error("Error loading gyms:", error);
    gymListElement.innerHTML = `<p class="error">Error loading gyms: ${error.message}</p>`;
  }
};

// Function to handle gym selection change
function handleGymSelection(event) {
  const selectedGymId = event.target.value;
  const gymNameInput = document.getElementById('gymName');
  
  if (selectedGymId === 'new') {
    // Clear form for new gym
    gymNameInput.value = '';
    gymNameInput.removeAttribute('readonly');
  } else {
    // Fill form with existing gym data
    const gym = existingGyms[selectedGymId];
    if (gym) {
      gymNameInput.value = gym.name;
      gymNameInput.setAttribute('readonly', true);
    }
  }
}

// Function to handle form submission
async function handleGymFormSubmit(event) {
  event.preventDefault();
  const statusElement = document.getElementById('gymStatus');
  const selectedGymId = document.getElementById('gymSelect').value;
  
  try {
    const db = firebase.firestore();
    const gymData = {
      name: document.getElementById('gymName').value,
      lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    if (selectedGymId === 'new') {
      // Add new gym
      gymData.created = firebase.firestore.FieldValue.serverTimestamp();
      await db.collection('gyms').add(gymData);
      statusElement.textContent = 'New gym added successfully!';
    } else {
      // Update existing gym
      await db.collection('gyms').doc(selectedGymId).update(gymData);
      statusElement.textContent = 'Gym updated successfully!';
    }
    
    statusElement.className = 'status success';
    
    // Reset form and refresh gym list
    document.getElementById('gymForm').reset();
    window.loadGyms();
    
  } catch (error) {
    console.error("Error saving gym:", error);
    statusElement.textContent = `Error: ${error.message}`;
    statusElement.className = 'status error';
  }
}

// Add event listeners when the page loads
document.addEventListener('DOMContentLoaded', () => {
  // Load initial gym data
  if (document.querySelector('.gym-list')) {
    window.loadGyms();
  }
  
  // Add event listener for gym selection
  const gymSelect = document.getElementById('gymSelect');
  if (gymSelect) {
    gymSelect.addEventListener('change', handleGymSelection);
  }
  
  // Add event listener for form submission
  const gymForm = document.getElementById('gymForm');
  if (gymForm) {
    gymForm.addEventListener('submit', handleGymFormSubmit);
  }
});