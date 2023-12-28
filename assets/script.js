let x = 5;
let searchButtonEl = $('#search-button');
let searchInputEl = $('#search-input');

searchButtonEl.on('click', async () => {
    let city = searchInputEl.val();

    var fiveDayApikey = '5a48e8bfa31d3c2a506e7232ebe1fe5c';
    let geocodingApiUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${fiveDayApikey}`;

    let data;

    if (searchInputEl) {
        try {
            const geocodingResponse = await fetch(geocodingApiUrl);
            data = await geocodingResponse.json();

            if (data && data.length > 0) {
                const lon = data[0].lon;
                const lat = data[0].lat;
                const cityState = `${data[0].name}, ${data[0].state}`;
                let fiveDayForcast = `http://api.openweathermap.org/data/2.5/forecast?cnt=35&units=imperial&lat=${lat}&lon=${lon}&appid=${fiveDayApikey}`;

                $('#search-history').append(`<p>${cityState}</p>`);

                const forecastResponse = await fetch(fiveDayForcast);
                const fiveDayForcastData = await forecastResponse.json();

                const weatherCard = $('#five-day-cards');

                for (let i = 0; i < 35; i += 8) {
                    var date = fiveDayForcastData.list[i].dt_txt;
                    var temp = fiveDayForcastData.list[i].main.temp + " °F";
                    var humidity = fiveDayForcastData.list[i].main.humidity + "%";
                    var wind = fiveDayForcastData.list[i].wind.speed + " MPH";
                    console.log(date, temp, humidity, wind);

                    weatherCard.append(`
                        <div class="single-cards" class='side-by-side'>
                            <p id="day-1">Monday</p>
                            <ul class="weather-card">
                                <p class="weather-detail">${cityState}</p>
                                <p class="weather-detail">Temperature: ${temp}</p>
                                <p class="weather-detail">Humidity: ${humidity}</p>
                                <p class="weather-detail">Wind Speed: ${wind}</p>
                            </ul>
                        </div>
                    `);
                }
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
});

function appendSearchResult(append, searchInput, tag) {
    $('#search-history').append(`<${tag}>${searchInput}<${tag}>`);
}
