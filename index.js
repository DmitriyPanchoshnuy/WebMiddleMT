const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');
const socketIo = require('socket.io');

const API_KEY = "9539fdcafd9f4ccd19a252e6a1ab354e";

const server = http.createServer((req, res) => {
  const filePath = req.url === '/' ? '/index.html' : req.url;
  const ext = path.extname(filePath);
  const contentType = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
  }[ext] || 'text/plain';

  const fullPath = path.join(__dirname, 'public', filePath);
  fs.readFile(fullPath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

const io = socketIo(server);

io.on('connection', (socket) => {
  console.log('Клієнт підключився');

  socket.on('getWeather', (city) => {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=ua`;

    https.get(url, (apiRes) => {
      let data = '';
      apiRes.on('data', chunk => data += chunk);
      apiRes.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.cod === '200') {
            socket.emit('weatherData', json);
          } else {
            socket.emit('weatherError', 'Місто не знайдено');
          }
        } catch {
          socket.emit('weatherError', 'Помилка при обробці відповіді');
        }
      });
    }).on('error', () => {
      socket.emit('weatherError', 'Помилка запиту до API');
    });
  });
});

server.listen(9999);
