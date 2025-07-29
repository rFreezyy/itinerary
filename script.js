// Dark Mode Toggle
document.getElementById('themeToggle').addEventListener('click', function() {
    // Toggle dark mode on the body element
    document.body.classList.toggle('dark-mode');
    
    // Save the dark mode state to sessionStorage to persist it across reloads
    if (document.body.classList.contains('dark-mode')) {
        sessionStorage.setItem('darkMode', 'enabled');
    } else {
        sessionStorage.removeItem('darkMode');
    }
});

// Check if dark mode was previously enabled and apply it
if (sessionStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
}

// Weather Widget (fetches weather from OpenWeather)
function getWeather() {
    const apiKey = 'YOUR_API_KEY';  // Replace with your OpenWeather API key
    const weatherAPI = `https://api.openweathermap.org/data/2.5/onecall?lat=36.1699&lon=-115.1398&exclude=minutely&appid=${apiKey}&units=imperial`; // Use 'imperial' for Fahrenheit, 'metric' for Celsius

    fetch(weatherAPI)
        .then(response => response.json())
        .then(data => {
            const currentTemp = data.current.temp; // Current temperature
            const feelsLike = data.current.feels_like; // Feels like temperature
            const weatherDescription = data.current.weather[0].description; // Weather description
            const icon = data.current.weather[0].icon; // Weather icon
            const humidity = data.current.humidity; // Humidity
            const windSpeed = data.current.wind_speed; // Wind speed
            const pressure = data.current.pressure; // Pressure
            const hourlyData = data.hourly.slice(0, 6); // Get the next 6 hours of weather data
            const dailyData = data.daily.slice(0, 5); // Get the next 5 days of weather data

            // Display the current weather information in the widget
            let weatherHTML = `
                <h3>Weather in Las Vegas</h3>
                <img src="http://openweathermap.org/img/wn/${icon}.png" alt="weather icon" />
                <p class="temp">${currentTemp}°F</p>
                <p>${weatherDescription}</p>
                <p><strong>Feels Like:</strong> ${feelsLike}°F</p>
                <p><strong>Humidity:</strong> ${humidity}%</p>
                <p><strong>Wind Speed:</strong> ${windSpeed} mph</p>
                <p><strong>Pressure:</strong> ${pressure} hPa</p>
                <div class="hourly">
                    ${hourlyData.map(hour => `
                        <div class="hour">
                            <img src="http://openweathermap.org/img/wn/${hour.weather[0].icon}.png" alt="icon" />
                            <p>${new Date(hour.dt * 1000).getHours()}:00</p>
                            <p>${Math.round(hour.temp)}°</p>
                        </div>
                    `).join('')}
                </div>
                <h4>Daily Forecast</h4>
                <div class="daily">
                    ${dailyData.map(day => `
                        <div class="day">
                            <p><strong>${new Date(day.dt * 1000).toLocaleDateString()}</strong></p>
                            <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="icon" />
                            <p>${Math.round(day.temp.day)}°F</p>
                            <p>${Math.round(day.temp.night)}°F (Night)</p>
                            <p>${day.weather[0].description}</p>
                        </div>
                    `).join('')}
                </div>
            `;

            document.getElementById('weatherWidget').innerHTML = weatherHTML;
        })
        .catch(error => {
            console.error("Error fetching weather data:", error);
            document.getElementById('weatherWidget').textContent = "Weather data unavailable";
        });
}

getWeather();

// Function to reset the entire itinerary
function resetItinerary() {
    document.getElementById('confirmPopup').style.display = 'flex';  // Show confirmation popup
}

// Confirm reset action
function confirmReset() {
    localStorage.removeItem('itinerary'); // Remove itinerary from localStorage
    location.reload(); // Reload the page to reflect changes
    closePopup(); // Close the popup after confirming
}

// Close the popup
function closePopup() {
    document.getElementById('confirmPopup').style.display = 'none'; // Hide the popup
}

// Save the itinerary to LocalStorage
function saveItinerary() {
    let itinerary = {};

    // Loop through each day and get the activities
    document.querySelectorAll('.day').forEach(day => {
        let activities = [];
        day.querySelectorAll('li').forEach(li => {
            let activityText = li.textContent.trim();
            // Only add unique activities
            if (!activities.includes(activityText)) {
                activities.push(activityText);
            }
        });
        itinerary[day.id] = activities;
    });

    // Clear the existing saved itinerary before saving the new one
    localStorage.setItem('itinerary', JSON.stringify(itinerary));

    // Display the saved itinerary after it's saved
    displayItinerary();
}

// Display saved itinerary on page load
function displayItinerary() {
    let savedItinerary = JSON.parse(localStorage.getItem('itinerary'));
    if (savedItinerary) {
        for (let dayId in savedItinerary) {
            let day = document.getElementById(dayId);
            let activityList = day.querySelector('.activity-list');
            
            // Clear existing activities to avoid duplicates
            activityList.innerHTML = ''; // Clear the list before appending new activities
            
            savedItinerary[dayId].forEach(activity => {
                let li = document.createElement('li');
                li.textContent = activity;
                activityList.appendChild(li);
            });
        }
    }
}

// Add activity to list on Enter or comma
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' || event.key === ',') { // Only "Enter" and "," are considered
            event.preventDefault(); // Prevent default action
            addActivityToItinerary(input);
        }
    });
});

// Add the activity to the day's list
function addActivityToItinerary(input) {
    let activity = input.value.trim();
    if (activity) {
        let day = input.closest('.day');
        let activityList = day.querySelector('.activity-list');

        // Check if the activity already exists in the list to avoid duplication
        let activityExists = Array.from(activityList.children).some(li => li.textContent.trim() === activity);
        if (!activityExists) {
            // Create new list item for the activity
            let li = document.createElement('li');
            li.textContent = activity;
            activityList.appendChild(li);
        }

        // Clear the input field
        input.value = '';

        // Update the order in LocalStorage
        updateActivityOrder(day.id);
    }
}

// Update the activity order in LocalStorage after reordering
function updateActivityOrder(dayId) {
    let activities = [];
    const day = document.getElementById(dayId);
    const activityList = day.querySelector('.activity-list');
    
    // Loop through the list and get the text content of each activity
    activityList.querySelectorAll('li').forEach(li => {
        activities.push(li.textContent.trim());
    });

    // Update the day's activity list in localStorage
    let savedItinerary = JSON.parse(localStorage.getItem('itinerary')) || {};
    savedItinerary[dayId] = activities;

    // Save the updated itinerary back to localStorage
    localStorage.setItem('itinerary', JSON.stringify(savedItinerary));
}

// Drag and drop reordering
document.querySelectorAll('.activity-list').forEach(list => {
    new Sortable(list, {
        animation: 150,
        onEnd: function(evt) {
            updateActivityOrder(evt.from.id); // Save the new order after drag
        }
    });
});




