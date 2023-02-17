'use strict';

var clientUtils = {};

// owm globals
var latestWeather = {};
var owmUnits = '';
var owmZip = '';
var owmKey = '';

// graph globals
var graphWidth = 0;
var graphHeight = 0;
var graphRadius = 0;
var graphOverlaySGV = '0';
var graphHours = 0;
var accumSGV = [];

clientUtils.pluginInfo = function pluginInfo() {
  var pluginDisplayValue = '';

  if (window.Nightscout.client.latestProperties.iob && window.Nightscout.client.latestProperties.iob.display) {
    pluginDisplayValue += ' iob:' + window.Nightscout.client.latestProperties.iob.display.toLowerCase();
  }
  if (window.Nightscout.client.latestProperties.basal && window.Nightscout.client.latestProperties.basal.display) {
    pluginDisplayValue += ' ' + window.Nightscout.client.latestProperties.basal.display.toLowerCase().replace(/ /g,'');
  }
  if (window.Nightscout.client.latestProperties.dbsize && window.Nightscout.client.latestProperties.dbsize.display) {
    pluginDisplayValue += ' db:' + window.Nightscout.client.latestProperties.dbsize.display.toLowerCase();
  }
  if (window.Nightscout.client.latestProperties.cage && window.Nightscout.client.latestProperties.cage.display) {
    if (window.Nightscout.client.latestProperties.cage.level > 0) {
      pluginDisplayValue += ' <div class="cage" style="background-color:grey; color:black; display: inline-block; border: 1px solid white;">CAGE:' +
        window.Nightscout.client.latestProperties.cage.display.toLowerCase() + '</div>';
    } else {
      pluginDisplayValue += ' cage:' + window.Nightscout.client.latestProperties.cage.display.toLowerCase();
    }
  }
  if (window.Nightscout.client.latestProperties.sage && window.Nightscout.client.latestProperties.sage['Sensor Start'] &&
      window.Nightscout.client.latestProperties.sage['Sensor Start'].display) {
    if (window.Nightscout.client.latestProperties.sage['Sensor Start'].level > 0) {
      pluginDisplayValue += ' <div class="sage" style="background-color:grey; color:black; display: inline-block; border: 1px solid white;">SAGE:' +
        window.Nightscout.client.latestProperties.sage['Sensor Start'].display.toLowerCase() + '</div>';
    } else {
      pluginDisplayValue += ' sage:' + window.Nightscout.client.latestProperties.sage['Sensor Start'].display.toLowerCase();
    }
  }
  if (window.Nightscout.client.latestProperties.iage && window.Nightscout.client.latestProperties.iage.display) {
    if (window.Nightscout.client.latestProperties.iage.level > 0) {
      pluginDisplayValue += ' <div class="iage" style="background-color:grey; color:black; display: inline-block; border: 1px solid white;">IAGE:' +
        window.Nightscout.client.latestProperties.iage.display.toLowerCase() + '</div>';
    } else {
      pluginDisplayValue += ' iage:' + window.Nightscout.client.latestProperties.iage.display.toLowerCase();
    }
  }
  if (window.Nightscout.client.latestProperties.bage && window.Nightscout.client.latestProperties.bage.display) {
    if (window.Nightscout.client.latestProperties.bage.level > 0) {
      pluginDisplayValue += ' <div class="bage" style="background-color:grey; color:black; display: inline-block; border: 1px solid white;">BAGE:' +
        window.Nightscout.client.latestProperties.bage.display.toLowerCase() + '</div>';
    } else {
      pluginDisplayValue += ' bage:' + window.Nightscout.client.latestProperties.bage.display.toLowerCase();
    }
  }
  if (window.Nightscout.client.latestProperties.upbat && window.Nightscout.client.latestProperties.upbat.display) {
    if (window.Nightscout.client.latestProperties.upbat.level <= 25) {
      pluginDisplayValue += ' <div class="upbat" style="background-color:grey; color:black; display: inline-block; border: 1px solid white;">UP:' +
        window.Nightscout.client.latestProperties.upbat.display.toLowerCase() + '</div>';
    } else {
      pluginDisplayValue += ' up:' + window.Nightscout.client.latestProperties.upbat.display.toLowerCase();
    }
  }
  if (window.Nightscout.client.latestProperties.pump && window.Nightscout.client.latestProperties.pump.data &&
      window.Nightscout.client.latestProperties.pump.data.status && window.Nightscout.client.latestProperties.pump.data.status.display) {
    if (window.Nightscout.client.latestProperties.pump.data.level > 0) {
      pluginDisplayValue += ' <div class="pump" style="background-color:grey; color:black; display: inline-block; border: 1px solid white;">P:' +
        window.Nightscout.client.latestProperties.pump.data.status.display + '</div>';
    } else {
      pluginDisplayValue += ' p:' + window.Nightscout.client.latestProperties.pump.data.status.display.toLowerCase();
    }
    if (window.Nightscout.client.latestProperties.pump.data.reservoir && window.Nightscout.client.latestProperties.pump.data.reservoir.display) {
      if (window.Nightscout.client.latestProperties.pump.data.reservoir.level > 0) {
        pluginDisplayValue += ' <div class="reservoir" style="background-color:grey; color:black; display: inline-block; border: 1px solid white;">R:' +
          window.Nightscout.client.latestProperties.pump.data.reservoir.display.toLowerCase() + '</div>';
      } else {
        pluginDisplayValue += ' r:' + window.Nightscout.client.latestProperties.pump.data.reservoir.display.toLowerCase();
      }
    }
    if (window.Nightscout.client.latestProperties.pump.data.battery && window.Nightscout.client.latestProperties.pump.data.battery.display) {
      if (window.Nightscout.client.latestProperties.pump.data.battery.level > 0) {
        pluginDisplayValue += ' <div class="pumpbat" style="background-color:grey; color:black; display: inline-block; border: 1px solid white;">PB:' +
          window.Nightscout.client.latestProperties.pump.data.battery.display.toLowerCase() + '</div>';
      } else {
        pluginDisplayValue += ' pb:' + window.Nightscout.client.latestProperties.pump.data.battery.display.toLowerCase();
      }
    }
  }
  if (window.Nightscout.client.latestProperties.openaps && window.Nightscout.client.latestProperties.openaps.status &&
      window.Nightscout.client.latestProperties.openaps.status.symbol) {
    if ((window.Nightscout.client.latestProperties.openaps.status.symbol !== '⌁') &&
        (window.Nightscout.client.latestProperties.openaps.status.symbol !== '↻')) {
      pluginDisplayValue += ' <div class="openaps" style="background-color:grey; color:black; display: inline-block; border: 1px solid white;">OAPS:' +
        window.Nightscout.client.latestProperties.openaps.status.symbol + '</div>';
    } else {
      pluginDisplayValue += ' oaps:' + window.Nightscout.client.latestProperties.openaps.status.symbol;
    }
  }
  if (window.Nightscout.client.latestProperties.sensorState && window.Nightscout.client.latestProperties.sensorState.lastStateStringShort) {
    if (window.Nightscout.client.latestProperties.sensorState.level > 0) {
      pluginDisplayValue += ' <div class="sensorstate" style="background-color:grey; color:black; display: inline-block; border: 1px solid white;">CGM:' +
        window.Nightscout.client.latestProperties.sensorState.lastStateStringShort;
      if (window.Nightscout.client.latestProperties.sensorState.lastVoltageB !== undefined) {
        pluginDisplayValue += ' VB:' + window.Nightscout.client.latestProperties.sensorState.lastVoltageB;
      }
      pluginDisplayValue += '</div>';
    } else {
      pluginDisplayValue += ' cgm:' + window.Nightscout.client.latestProperties.sensorState.lastStateStringShort.toLowerCase();
      if (window.Nightscout.client.latestProperties.sensorState.lastVoltageB !== undefined) {
        pluginDisplayValue += ' vb:' + window.Nightscout.client.latestProperties.sensorState.lastVoltageB;
      }
    }
  }

  return pluginDisplayValue;
}

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
      window.Nightscout.client.render();
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
