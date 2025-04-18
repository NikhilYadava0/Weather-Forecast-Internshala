document.addEventListener('DOMContentLoaded', () => {
    const apiKey = 'e5103872dfd9472df7a1fd116bcf67b8';
  
    document.getElementById('search-btn').addEventListener('click', handleCitySearch);
    document.getElementById('current-location-btn').addEventListener('click', getCurrentLocationWeather);
    document.getElementById('city-input').addEventListener('focus', displayRecentSearches);
  
    function handleCitySearch() {
      const city = document.getElementById('city-input').value.trim(); 
      if (city) {
        saveRecentSearch(city);
        fetchWeatherDataByCity(city);
      } else {
        alert('Please enter a valid city name'); 
      }
    }
  
    function getCurrentLocationWeather() {
      if (navigator.geolocation) { 
        navigator.geolocation.getCurrentPosition(position => {
          const { latitude, longitude } = position.coords; 
          fetchWeatherDataByCoords(latitude, longitude); 
        }, error => {
          alert('Error fetching location: ' + error.message); 
        });
      } else {
        alert('Geolocation is not supported by this browser.'); 
      }
    }
  
    function fetchWeatherDataByCity(city) {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
      fetch(url)
        .then(response => {
          if (!response.ok) { 
            throw new Error(`HTTP error! status: ${response.status}`); 
          }
          return response.json(); 
        })
        .then(data => {
          if (data.cod === 200) { 
            const { coord } = data; 
            fetchWeatherDataByCoords(coord.lat, coord.lon); 
          } else {
            alert(data.message);
          }
        })
        .catch(error => {
          alert('Failed to fetch weather data'); 
        });
    }
  
    function fetchWeatherDataByCoords(lat, lon) {
      const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`; // API URL for fetching current weather data by coordinates
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`; // API URL for fetching forecast data by coordinates
  
      fetch(currentWeatherUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`); 
          }
          return response.json(); 
        })
        .then(data => {
          displayCurrentWeather(data); 
        })
        .catch(error => {
          alert('Failed to fetch current weather data');
        });
  
      fetch(forecastUrl)
        .then(response => {
          if (!response.ok) { 
            throw new Error(`HTTP error! status: ${response.status}`); 
          }
          return response.json(); 
        })
        .then(data => {
          displayExtendedForecast(data.list); 
        })
        .catch(error => {
          alert('Failed to fetch forecast data'); 
        });
    }
  
    function displayCurrentWeather(data) {
      if (!data || !data.weather || data.weather.length === 0) { 
        alert('Failed to fetch current weather data'); 
        return;
      }
  
      const weatherDataDiv = document.getElementById('weather-data');
      const weatherSection = document.getElementById('weather-section');
      weatherSection.classList.remove('hidden');
      const currentDate = new Date(); 
      const formattedDate = `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;
      weatherDataDiv.innerHTML = `
        <div class=" flex items-center justify-between w-full text-white">
          <div class="flex flex-col justify-center gap-2">
            <div class="flex gap-4">
              <h2 class="text-xl md:text-2xl lg:text-4xl font-bold mb-4">${data.name}</h2>
              <h3 class="text-xl md:text-2xl lg:text-4xl font-bold mb-4">(${formattedDate})</h3>
            </div>
            <p class="text-lg md:text-xl lg:text-2xl">Temperature: ${data.main.temp} °C</p>
            <p class="text-lg md:text-xl lg:text-2xl">Feels Like: ${data.main.feels_like} °C</p>
            <p class="text-lg md:text-xl lg:text-2xl">Humidity: ${data.main.humidity} %</p>
            <p class="text-lg md:text-xl lg:text-2xl">Wind Speed: ${data.wind.speed} m/s</p>
          </div>
          <div class="flex flex-col">
            <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].description}" class="w-20 h-20 ml-4">
            <p class="text-xl md:text-2xl font-bold">${data.weather[0].description}</p>
          </div>
        </div>
      `;
    }
  
    function displayExtendedForecast(forecastList) {
      if (!forecastList || forecastList.length === 0) { 
        alert('Failed to fetch extended forecast data'); 
        return;
      }
  
      const forecastDiv = document.getElementById('extended-forecast'); 
      forecastDiv.innerHTML = forecastList.filter((_, index) => index % 8 === 0).slice(0, 7).map(day => `
        <div class="bg-blue-300 text-black  rounded-lg shadow-md text-center ">
          <h3 class="text-xl font-bold">${new Date(day.dt * 1000).toLocaleDateString()}</h3>
          <div class="flex justify-center pl-20">
            <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="${day.weather[0].description}" class="w-20 h-20">
          </div>
          <p class="text-lg lg:text-xl">Temp: ${day.main.temp} °C</p>
          <p class="text-lg lg:text-xl">Wind: ${day.wind.speed} m/s</p>
          <p class="text-lg lg:text-xl">Humidity: ${day.main.humidity} %</p>
        </div>
      `).join('');
    }
  
    function saveRecentSearch(city) {
      let recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];
      recentSearches = recentSearches.filter(search => search.toLowerCase() !== city.toLowerCase()); 
      recentSearches.unshift(city);
      if (recentSearches.length > 5) recentSearches.pop();
      localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    }
  
    function displayRecentSearches() {
      const recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];
      const recentSearchesDropdown = document.getElementById('recent-searches-dropdown');
      if (recentSearches.length > 0) {
        recentSearchesDropdown.innerHTML = recentSearches.map(city => `
          <option value="${city}">${city}</option>
        `).join('');
        recentSearchesDropdown.size = recentSearches.length; 
        recentSearchesDropdown.classList.remove('hidden'); 
      } else {
        recentSearchesDropdown.classList.add('hidden');
      }
    }
  
    document.getElementById('city-input').addEventListener('blur', () => {
      setTimeout(() => {
        document.getElementById('recent-searches-dropdown').classList.add('hidden');
      }, 200); 
    });
  
    document.getElementById('recent-searches-dropdown').addEventListener('change', (event) => {
      document.getElementById('city-input').value = event.target.value; 
      document.getElementById('recent-searches-dropdown').classList.add('hidden'); 
    });
  });
  