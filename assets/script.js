$(function () {
    populateSearchHistory()
    displayWeatherCards()
});

let x = 5;
let searchButtonEl = $('#search-button');
let searchInputEl = $('#search-input');
let searchHistory = []
if (window.localStorage.getItem('citySearchHistory')) {
    searchHistory = JSON.parse(window.localStorage.getItem('citySearchHistory'));
}
let weatherCard = $('#five-day-cards');
let currentDate = new Date();
let currentDayIndex = currentDate.getDay();
let daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
let currentDay = daysOfWeek[currentDayIndex];
let month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
let day = currentDate.getDate().toString().padStart(2, '0');
let year = currentDate.getFullYear();
let formattedDate = `${month}/${day}/${year}`;
let tomorrow_dt = Math.floor(new Date().getTime() / 1000) + 86400;

// console.log("Today is:", currentDay);

searchButtonEl.on('click', () => {
    weatherCard.empty();
    displayWeatherCards();
    searchInputEl.attr("placeholder", "Search: City");
})
searchInputEl.on('keypress', (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        weatherCard.empty();
        displayWeatherCards();
        searchInputEl.attr('placeholder', '');
    }
})

function saveLocalStorage(toSave) {
    if (!searchHistory.includes(toSave)) {
        searchHistory.push(toSave)
    }
    console.log(searchHistory)
    window.localStorage.setItem('citySearchHistory', JSON.stringify(searchHistory))
}

function populateSearchHistory() {
    $('#search-history').empty();
    $('#search-history').append(`<p>Search History</p>`);
    if (searchHistory) {
        for (let i = 0; i < searchHistory.length; i++) {
            const city = searchHistory[i]
            $('#search-history').append(`<li onclick="displayWeatherCards(event)" id="city-${i}">${city}</li>`);
        }
    }
}




function displayWeatherCards(event) {
    let city = searchInputEl.val();
    if (!city) {
        city = searchHistory[searchHistory.length - 1];
    }
    if (event) {
        let index = event.target.id.toString().split('-')[1];
        city = searchHistory[index];
    }

    var fiveDayApikey = '5a48e8bfa31d3c2a506e7232ebe1fe5c';
    let geocodingApiUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${fiveDayApikey}`;

    if (searchInputEl) {
        // Fetch geocoding data
        let geocodingPromise = fetch(geocodingApiUrl)
            .then(response => response.json())
            .then(geocodingData => {
                return {
                    data: geocodingData,
                    city: `${geocodingData[0].name}, ${geocodingData[0].state}`
                };
            });

        let oneDayForecastPromise = geocodingPromise
            .then(({ data, city }) => {
                const lon = data[0].lon;
                const lat = data[0].lat;
                let oneDayForcast = `https://api.openweathermap.org/data/2.5/weather?units=imperial&lat=${lat}&lon=${lon}&appid=${fiveDayApikey}`;
                return fetch(oneDayForcast)
                    .then(response => response.json())
                    .then(oneDayForecastData => {
                        return {
                            city: city,
                            oneDayForecastData: oneDayForecastData
                        };
                    });
            });

        let fiveDayForecastPromise = geocodingPromise
            .then(({ data, city }) => {
                const lon = data[0].lon;
                const lat = data[0].lat;
                let fiveDayForcast = `http://api.openweathermap.org/data/2.5/forecast?&units=imperial&lat=${lat}&lon=${lon}&appid=${fiveDayApikey}`;
                return fetch(fiveDayForcast)
                    .then(response => response.json())
                    .then(fiveDayForcastData => {
                        return {
                            city: city,
                            fiveDayForcastData: fiveDayForcastData
                        };
                    });
            });

        Promise.all([oneDayForecastPromise, fiveDayForecastPromise])
            .then(([oneDayResult, fiveDayResult]) => {
                const oneDayForecastData = oneDayResult.oneDayForecastData;
                const fiveDayForcastData = fiveDayResult.fiveDayForcastData;
                const cityState = oneDayResult.city;

                console.log(oneDayForecastData);
                console.log(fiveDayForcastData);
                weatherCard.empty();

                let dt = oneDayForecastData.dt
                let currentDate = new Date(dt * 1000)
                let monthToday = (currentDate.getMonth() + 1).toString().padStart(2, '0');
                let dayToday = currentDate.getDate().toString().padStart(2, '0');
                let yearToday = currentDate.getFullYear();
                let formattedDateToday = `${monthToday}/${dayToday}/${yearToday}`;
                let tempToday = oneDayForecastData.main.temp + "°F";
                let humidityToday = oneDayForecastData.main.humidity + "%";
                let windToday = oneDayForecastData.wind.speed + " MPH";
                weatherCard.append(`
                <div class="single-cards" class='side-by-side'>
                    <p id="day-1">Today ${formattedDateToday}</p>
                    <ul class="weather-card">
                        <p class="weather-detail">${cityState}</p>
                        <p class="weather-detail">Temp: ${tempToday}</p>
                        <p class="weather-detail">Humidity: ${humidityToday}</p>
                        <p class="weather-detail">Wind: ${windToday}</p>
                    </ul>
                </div>`);


                let j = currentDayIndex + 1;
                if (j == 7) j = 0
                let newDaySeconds = 0

                for (let i = 0; i < 40; i += (24 / 3)) {
                    newDaySeconds += 84600
                    let dateTomorrow = new Date((dt + newDaySeconds) * 1000)
                    let monthTomorrow = (dateTomorrow.getMonth() + 1).toString().padStart(2, '0');
                    let dayTomorrow = dateTomorrow.getDate().toString().padStart(2, '0');
                    let yearTomorrow = dateTomorrow.getFullYear();
                    let formattedDateTomorrow= `${monthTomorrow}/${dayTomorrow}/${yearTomorrow}`;
                    // var fiveDayDates = `${month}/${day}/${year}`;
                    let temp = fiveDayForcastData.list[i].main.temp + "°F";
                    let humidity = fiveDayForcastData.list[i].main.humidity + "%";
                    let wind = fiveDayForcastData.list[i].wind.speed + " MPH";
                    console.log(dateTomorrow, temp, humidity, wind);

                    weatherCard.append(`
                        <div class="single-cards" class='side-by-side'>
                            <p id="day-1">${daysOfWeek[j]} ${formattedDateTomorrow}</p>
                            <ul class="weather-card">
                            <p class="weather-detail">${cityState}</p>
                                <p class="weather-detail">Temp: ${temp}</p>
                                <p class="weather-detail">Humidity: ${humidity}</p>
                                <p class="weather-detail">Wind: ${wind}</p>
                            </ul>
                        </div>`);
                    j++
                    i++
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
}




function appendSearchResult(append, searchInput, tag) {
    $('#search-history').append(`<${tag}>${searchInput}<${tag}>`);
}
