// Initialize Google Map
let map;
function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 36.1699, lng: -115.1398 },  // Las Vegas Coordinates
        zoom: 12,
    });
}

// Function to add activities dynamically
function addActivity(dayId) {
    const activityList = document.getElementById(`activity-list-${dayId}`);
    const activityName = prompt("Enter activity name:");

    if (activityName) {
        const li = document.createElement("li");
        li.textContent = activityName;
        activityList.appendChild(li);

        // Enable drag-and-drop reordering
        new Sortable(activityList, {
            animation: 150,
            onEnd: function(evt) {
                saveItinerary();
            }
        });

        saveItinerary();
    }
}

// Save itinerary to localStorage
function saveItinerary() {
    const itinerary = {};
    document.querySelectorAll('.day').forEach(day => {
        const dayId = day.id;
        const activities = [];
        const activityList = day.querySelector('.activity-list');
        activityList.querySelectorAll('li').forEach(activity => {
            activities.push(activity.textContent);
        });
        itinerary[dayId] = activities;
    });

    localStorage.setItem('itinerary', JSON.stringify(itinerary));
}

// Load saved itinerary from localStorage
function loadItinerary() {
    const savedItinerary = JSON.parse(localStorage.getItem('itinerary')) || {};

    Object.keys(savedItinerary).forEach(dayId => {
        const activityList = document.getElementById(`activity-list-${dayId}`);
        savedItinerary[dayId].forEach(activity => {
            const li = document.createElement("li");
            li.textContent = activity;
            activityList.appendChild(li);
        });

        // Enable drag-and-drop reordering
        new Sortable(activityList, {
            animation: 150,
            onEnd: function(evt) {
                saveItinerary();
            }
        });
    });
}

// Initialize the page by loading the saved itinerary
window.onload = loadItinerary;

// Weather Widget (fetches weather from OpenWeather)
function getWeather() {
    const apiKey = '950b1bc75181e9ddcfbadc7b5f89da24';  // Replace with your OpenWeather API key
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
            document.getElementById('weatherWidget').style.right = '20px'; // Slide into view from the right side
        })
        .catch(error => {
            console.error("Error fetching weather data:", error);
            document.getElementById('weatherWidget').textContent = "Weather data unavailable";
        });
}

getWeather();
