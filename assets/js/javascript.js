const apiKey = '2e25b7b78602bbe9ec38b631de37c904';
const searchForm = document.getElementById('search-bar');
const cityInput = document.getElementById('city-input');

searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const city = cityInput.value.trim();
    getCoordinates(city);
});

// FUNCTION TO GET CITY COORDINATES TO DISPLAY WEATHER ACCURATELY

function getCoordinates(city) {
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;
    fetch(geoUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.length === 0) {
                throw new Error('City not found');
            }
            const { lat, lon } = data[0];
            getWeather(lat, lon, city);
        })
        .catch(error => {
            console.error(`Error fetching coordinates:`, error);
            alert(`There was an error fetching the coordinates: ${error.message}`);
        });
}

// FUNCTION THAT FETCHES WEATHER FROM OUR API

function getWeather(lat, lon, city) {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;
    fetch(weatherUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.json();
        })
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
        <h2>${city} (${new Date(data.list[0].dt * 1000).toLocaleDateString()}) <img src="https://openweathermap.org/img/wn/${data.list[0].weather[0].icon}.png" alt="${data.list[0].weather[0].description}"></h2>
        <p>Temp: ${data.list[0].main.temp}°F</p>
        <p>Wind: ${data.list[0].wind.speed} MPH</p>
        <p>Humidity: ${data.list[0].main.humidity} %</p>
    `;

    // HANDLES CREATING A 5 DAY FORECAST
    
    const forecastDiv = document.getElementById('forecast');
    forecastDiv.innerHTML = `<h2>5-Day Forecast:</h2>`;
    for (let i = 0; i < data.list.length; i += 8) {
        forecastDiv.innerHTML += `
            <div>
                <h3>${new Date(data.list[i].dt * 1000).toLocaleDateString()}</h3>
                <img src="https://openweathermap.org/img/wn/${data.list[i].weather[0].icon}.png" alt="${data.list[i].weather[0].description}">
                <p>Temp: ${data.list[i].main.temp}°F</p>
                <p>Wind: ${data.list[i].wind.speed} MPH</p>
                <p>Humidity: ${data.list[i].main.humidity} %</p>
            </div>
        `;
    }
}
