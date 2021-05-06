const pm2 = require('pm2');
const app = require('./src/main');

pm2.connect(function (err) {
  if (err) {
    throw err;
  }
  pm2.start({
    script: __dirname + '/./src/main.js',
    name: 'vaccine_notifier'
  }, function (err, apps) {
    if (err) throw err
    app.runScript();
    // Disconnects from PM2
    pm2.disconnect();
  });
});