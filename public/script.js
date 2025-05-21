const socket = io();

function getWeather(fromSearch = false) {
  const city = fromSearch
    ? document.getElementById('search').value
    : document.getElementById('city-select').value;

  document.getElementById('weather-info').innerHTML = '';
  document.getElementById('error-message').textContent = '';

  socket.emit('getWeather', city);
}

socket.on('weatherData', (data) => {
  const today = data.list[0];
  const weather = today.weather[0].main.toLowerCase();

  document.getElementById('weather-info').innerHTML = `
    <h2>${data.city.name}</h2>
    <p>Температура: ${today.main.temp} °C</p>
    <p>Погода: ${today.weather[0].description}</p>
    <p>Вітер: ${today.wind.speed} м/с</p>
    <p>Хмарність: ${today.clouds.all} %</p>
  `;
});

socket.on('weatherError', (msg) => {
  document.getElementById('error-message').textContent = msg;
});

window.onload = () => getWeather();
