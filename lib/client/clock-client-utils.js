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

clientUtils.pluginInfo = function pluginInfo(iob, basal, dbsize, cage, sage, iage, bage, upbat, pump, openaps, sensorState) {
  var pluginDisplayValue = '';

  if (iob && iob.display) {
    pluginDisplayValue += ' iob:' + iob.display.toLowerCase();
  }
  if (basal && basal.display) {
    pluginDisplayValue += ' ' + basal.display.toLowerCase().replace(/ /g,'');
  }
  if (dbsize && dbsize.display) {
    pluginDisplayValue += ' db:' + dbsize.display.toLowerCase();
  }
  if (cage && cage.display) {
    if (cage.level > 0) {
      pluginDisplayValue += ' <div class="cage" style="background-color:grey; color:black; display: inline-block; border: 1px solid white;">CAGE:' +
        cage.display.toLowerCase() + '</div>';
    } else {
      pluginDisplayValue += ' cage:' + cage.display.toLowerCase();
    }
  }
  if (sage && sage['Sensor Start'] && sage['Sensor Start'].display) {
    if (sage['Sensor Start'].level > 0) {
      pluginDisplayValue += ' <div class="sage" style="background-color:grey; color:black; display: inline-block; border: 1px solid white;">SAGE:' +
        sage['Sensor Start'].display.toLowerCase() + '</div>';
    } else {
      pluginDisplayValue += ' sage:' + sage['Sensor Start'].display.toLowerCase();
    }
  }
  if (iage && iage.display) {
    if (iage.level > 0) {
      pluginDisplayValue += ' <div class="iage" style="background-color:grey; color:black; display: inline-block; border: 1px solid white;">IAGE:' +
        iage.display.toLowerCase() + '</div>';
    } else {
      pluginDisplayValue += ' iage:' + iage.display.toLowerCase();
    }
  }
  if (bage && bage.display) {
    if (bage.level > 0) {
      pluginDisplayValue += ' <div class="bage" style="background-color:grey; color:black; display: inline-block; border: 1px solid white;">BAGE:' +
        bage.display.toLowerCase() + '</div>';
    } else {
      pluginDisplayValue += ' bage:' + bage.display.toLowerCase();
    }
  }
  if (upbat && upbat.display) {
    if (upbat.level <= 25) {
      pluginDisplayValue += ' <div class="upbat" style="background-color:grey; color:black; display: inline-block; border: 1px solid white;">UP:' +
        upbat.display.toLowerCase() + '</div>';
    } else {
      pluginDisplayValue += ' up:' + upbat.display.toLowerCase();
    }
  }
  if (pump && pump.data && pump.data.status && pump.data.status.display) {
    if (pump.data.level > 0) {
      pluginDisplayValue += ' <div class="pump" style="background-color:grey; color:black; display: inline-block; border: 1px solid white;">P:' +
        pump.data.status.display + '</div>';
    } else {
      pluginDisplayValue += ' p:' + pump.data.status.display.toLowerCase();
    }
    if (pump.data.reservoir && pump.data.reservoir.display) {
      if (pump.data.reservoir.level > 0) {
        pluginDisplayValue += ' <div class="reservoir" style="background-color:grey; color:black; display: inline-block; border: 1px solid white;">R:' +
          pump.data.reservoir.display.toLowerCase() + '</div>';
      } else {
        pluginDisplayValue += ' r:' + pump.data.reservoir.display.toLowerCase();
      }
    }
    if (pump.data.battery && pump.data.battery.display) {
      if (pump.data.battery.level > 0) {
        pluginDisplayValue += ' <div class="pumpbat" style="background-color:grey; color:black; display: inline-block; border: 1px solid white;">PB:' +
          pump.data.battery.display.toLowerCase() + '</div>';
      } else {
        pluginDisplayValue += ' pb:' + pump.data.battery.display.toLowerCase();
      }
    }
  }
  if (openaps && openaps.status && openaps.status.symbol) {
    if ((openaps.status.symbol !== '⌁') && (openaps.status.symbol !== '↻')) {
      pluginDisplayValue += ' <div class="openaps" style="background-color:grey; color:black; display: inline-block; border: 1px solid white;">OAPS:' +
        openaps.status.symbol + '</div>';
    } else {
      pluginDisplayValue += ' oaps:' + openaps.status.symbol;
    }
  }
  if (sensorState && sensorState.lastStateStringShort) {
    if (sensorState.level > 0) {
      pluginDisplayValue += ' <div class="sensorstate" style="background-color:grey; color:black; display: inline-block; border: 1px solid white;">CGM:' +
        sensorState.lastStateStringShort;
      if (sensorState.lastVoltageB !== undefined) {
        pluginDisplayValue += ' VB:' + sensorState.lastVoltageB;
      }
      pluginDisplayValue += '</div>';
    } else {
      pluginDisplayValue += ' cgm:' + sensorState.lastStateStringShort.toLowerCase();
      if (sensorState.lastVoltageB !== undefined) {
        pluginDisplayValue += ' vb:' + sensorState.lastVoltageB;
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
