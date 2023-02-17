'use strict';

var clientUtils = {};
var latestWeather = {};
var owmUnits = '';
var owmZip = '';
var owmKey = '';

clientUtils.queryOWM = function queryOWM () {
  if (owmKey === '') {
    return;
  }
  let units = 'imperial';
  if (owmUnits === 'C') {
    units = 'metric';
  }
  var src = 'https://api.openweathermap.org/data/2.5/weather?zip=' + owmZip + '&units=' + units + '&APPID=' + owmKey;
  $.ajax(src, {
    error: function gotError (err) {
      console.error(err);
    }
    , success: function gotData (data) {
      latestWeather = data;
      client.render();
    }
  });
}

clientUtils.setOWMParams = function setOWMParams(inOWMUnits, inOWMZip, inOWMKey) {
  owmUnits = inOWMUnits;
  owmZip = inOWMZip;
  owmKey = inOWMKey;
}

clientUtils.weatherInfo = function weatherInfo () {
  let weatherDisplayValue = "";
  if (latestWeather.main && latestWeather.weather && latestWeather.main.temp && latestWeather.weather[0] && latestWeather.weather[0].main) {
    weatherDisplayValue = latestWeather.main.temp.toFixed(0) + "°" + owmUnits;
    if (latestWeather.main.feels_like && latestWeather.main.feels_like.toFixed(0) !== latestWeather.main.temp.toFixed(0)) {
      weatherDisplayValue += " (" + latestWeather.main.feels_like.toFixed(0) + "°" + owmUnits + ")";
    }
    weatherDisplayValue += " " + latestWeather.weather[0].main.toLowerCase();
  }
  return weatherDisplayValue;
}

module.exports = clientUtils;
