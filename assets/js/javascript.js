const apiKey = '2e25b7b78602bbe9ec38b631de37c904';
const searchForm = document.getElementById('search-bar');
const cityInput = document.getElementById('city-input');

searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const city = cityInput.value.trim();
    getCoordinates(city);
});

// FUNCTION TO GET CITY COORDINATES TO DISPLAY WEATHER ACCURATELY :D

function getCoordinates(city) {
    const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;
    fetch(geoUrl)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const { lat, lon } = data[0];
                getWeather(lat, lon, city);
            } else {
                alert(`City not found: ${city}`);
            }
        })
        .catch(error => console.error(`Error fetching coordinates:`, error));
}

// FUNCTION THAT FETCHES WEATHER FROM OUR API

function getWeather(lat, lon, city) {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;
    fetch(weatherUrl)
        .then(response => response.json())
        .then(data => {
            displayWeather(data, city);
            saveSearchHistory(city);
        })
        .catch(error => console.error(`Error fetching weather data:`, error));
}

// FUNCTION TO SAVE SEARCH HISTORY IN LOCAL STORAGE AND CALLS FOR IT TO BE DISPLAYED AS A BUTTON AT THE BOTTOM

// SERVES AS QUICK LINKS

function saveSearchHistory(city) {
    let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
    if (!searchHistory.includes(city)) {
        searchHistory.push(city);
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
        displaySearchHistory();
    }
}

// FUNCTION TO HANDLE DISPLAYING OUR SEARCH HISTORY A.K.A RECENT CITIES VIEWED

// FUNCTION IS CALLED ABOVE

function displaySearchHistory() {
    const searchHistoryDiv = document.getElementById('history');
    searchHistoryDiv.innerHTML = '';
    let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
    searchHistory.forEach(city => {
        const cityBtn = document.createElement('button');
        cityBtn.textContent = city;
        cityBtn.addEventListener('click', () => {
            cityInput.value = city;
            getCoordinates(city);
        });
        searchHistoryDiv.appendChild(cityBtn);
    });
}

document.addEventListener('DOMContentLoaded', displaySearchHistory);

// FUNCTION THAT FETCHES WEATHER AND DISPLAYS ON THE PAGE

function displayWeather(data, city) {
    const currentWeatherDiv = document.getElementById('current-weather');
    currentWeatherDiv.innerHTML = `
        <h2>Current Weather in ${city}</h2>
        <p>Date: ${new Date(data.list[0].dt * 1000).toLocaleDateString()}</p>
        <p>Temperature: ${data.list[0].main.temp}°F</p>
        <p>Humidity: ${data.list[0].main.humidity}%</p>
        <p>Wind Speed: ${data.list[0].wind.speed} mph</p>
        <img src="http://openweathermap.org/img/wn/${data.list[0].weather[0].icon}.png" alt="${data.list[0].weather[0].description}">
    `;

    // HANDLES CREATING A 5 DAY FORECAST
    
    const forecastDiv = document.getElementById('forecast');
    forecastDiv.innerHTML = `<h2>5-Day Forecast</h2>`;
    for (let i = 0; i < data.list.length; i += 8) {
        forecastDiv.innerHTML += `
            <div>
                <h3>${new Date(data.list[i].dt * 1000).toLocaleDateString()}</h3>
                <p>Temperature: ${data.list[i].main.temp}°F</p>
                <p>Humidity: ${data.list[i].main.humidity}%</p>
                <p>Wind Speed: ${data.list[i].wind.speed} mph</p>
                <img src="http://openweathermap.org/img/wn/${data.list[i].weather[0].icon}.png" alt="${data.list[i].weather[0].description}">
            </div>
        `;
    }
}
