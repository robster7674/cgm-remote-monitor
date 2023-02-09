'use strict';

var browserSettings = require('./browser-settings');
var client = {};
var latestProperties = {};
var latestWeather = {};
var owmUnits = '';
var owmZip = '';
var owmKey = '';
var graphWidth = 0;
var graphHeight = 0;
var graphRadius = 0;
var graphOverlaySGV = 0;
var graphHours = 0;
var accumSGV = [];

client.queryOWM = function queryOWM () {
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

client.query = function query () {
  var parts = (location.search || '?').substring(1).split('&');
  var token = '';
  parts.forEach(function(val) {
    if (val.startsWith('token=')) {
      token = val.substring('token='.length);
    }
  });

  var secret = localStorage.getItem('apisecrethash');
  var src = '/api/v2/properties'; // Use precalculated data from the backend

  if (secret) {
    var s = '?secret=' + secret;
    src += s;
  } else if (token) {
    var s2 = '?token=' + token;
    src += s2;
  }

  $.ajax(src, {
    error: function gotError (err) {
      console.error(err);
    }
    , success: function gotData (data) {
      latestProperties = data;
      client.render();
    }
  });
};

function pluginInfo() {
  var pluginDisplayValue = "";
  
  if (latestProperties.iob) {
    pluginDisplayValue += " iob:" + latestProperties.iob.display.toLowerCase();
  }
  if (latestProperties.basal) {
    pluginDisplayValue += " " + latestProperties.basal.display.toLowerCase().replace(/ /g,'');
  }
  if (latestProperties.dbsize) {
    pluginDisplayValue += " db:" + latestProperties.dbsize.display.toLowerCase();
  }
  if (latestProperties.cage) {
    if (latestProperties.cage.level > 0) {
      pluginDisplayValue += "<strong> CAGE:" + latestProperties.cage.display.toLowerCase() + "</strong>";
    } else {
      pluginDisplayValue += " cage:" + latestProperties.cage.display.toLowerCase();
    }
  }
  if (latestProperties.sage && latestProperties.sage["Sensor Start"]) {
    if (latestProperties.sage["Sensor Start"].level > 0) {
      pluginDisplayValue += "<strong> SAGE:" + latestProperties.sage["Sensor Start"].display.toLowerCase() + "</strong>";
    } else {
      pluginDisplayValue += " sage:" + latestProperties.sage["Sensor Start"].display.toLowerCase();
    }
  }
  if (latestProperties.iage) {
    if (latestProperties.iage.level > 0) {
      pluginDisplayValue += "<strong> IAGE:" + latestProperties.iage.display.toLowerCase() + "</strong>";
    } else {
      pluginDisplayValue += " iage:" + latestProperties.iage.display.toLowerCase();
    }
  }
  if (latestProperties.bage) {
    if (latestProperties.bage.level > 0) {
      pluginDisplayValue += "<strong> BAGE:" + latestProperties.bage.display.toLowerCase() + "</strong>";
    } else {
      pluginDisplayValue += " bage:" + latestProperties.bage.display.toLowerCase();
    }
  }
  if (latestProperties.upbat) {
    if (latestProperties.upbat.level <= 25) {
      pluginDisplayValue += "<strong> UP:" + latestProperties.upbat.display.toLowerCase() + "</strong>";
    } else {
      pluginDisplayValue += " up:" + latestProperties.upbat.display.toLowerCase();
    }
  }
  if (latestProperties.pump && latestProperties.pump.data) {
    if (latestProperties.pump.data.level > 0) {
      pluginDisplayValue += "<strong> P:" + latestProperties.pump.data.status.display + "</strong>";
    } else {
      pluginDisplayValue += " p:" + latestProperties.pump.data.status.display.toLowerCase();
    }
    if (latestProperties.pump.data.reservoir.level > 0) {
      pluginDisplayValue += "<strong> R:" + latestProperties.pump.data.reservoir.display.toLowerCase() + "</strong>";
    } else {
      pluginDisplayValue += " r:" + latestProperties.pump.data.reservoir.display.toLowerCase();
    }
    if (latestProperties.pump.data.battery.level > 0) {
      pluginDisplayValue += "<strong> PB:" + latestProperties.pump.data.battery.display.toLowerCase() + "</strong>";
    } else {
      pluginDisplayValue += " pb:" + latestProperties.pump.data.battery.display.toLowerCase();
    }
  }
  if (latestProperties.openaps) {
    if ((latestProperties.openaps.status.symbol !== "⌁") &&
        (latestProperties.openaps.status.symbol !== "↻")) {
      pluginDisplayValue += "<strong> OAPS:" + latestProperties.openaps.status.symbol + "</strong>";
    } else {
      pluginDisplayValue += " oaps:" + latestProperties.openaps.status.symbol.toLowerCase();
    }
  }
  if (latestProperties.sensorState) {
    if (latestProperties.sensorState.level > 0) {
      pluginDisplayValue += "<strong> CGM:" + latestProperties.sensorState.lastStateStringShort;
      if (latestProperties.sensorState.lastVoltageB !== undefined) {
        pluginDisplayValue += " VB:" + latestProperties.sensorState.lastVoltageB;
      }
      pluginDisplayValue += "</strong>";
    } else {
      pluginDisplayValue += " cgm:" + latestProperties.sensorState.lastStateStringShort.toLowerCase();
      if (latestProperties.sensorState.lastVoltageB !== undefined) {
        pluginDisplayValue += " vb:" + latestProperties.sensorState.lastVoltageB;
      }
    }
    //pluginDisplayValue += "<strong> TEST</strong>";
  }

  return pluginDisplayValue;
}

function graphInfo () {
  // TBD loop through latestProperties.buckets, add them to accumSGV, and then use accumSGV to create graph
  return '<div id="graph" style="width: 100%; height: 300px; border: 1px solid black; position: relative; background-color: black;"> \
          <div style="position: absolute; bottom: 5%; left: 20%; width: 30px; height: 30px; background-color: red; border-radius: 100%;"></div> \
          <div style="position: absolute; bottom: 25%; left: 40%; width: 30px; height: 30px; background-color: green; border-radius: 100%;"></div> \
          <div style="position: absolute; bottom: 75%; left: 60%; width: 30px; height: 30px; background-color: red; border-radius: 100%;"></div> \
          <div style="position: absolute; bottom: 12%; left: 80%; width: 30px; height: 30px; background-color: yellow; border-radius: 100%;"></div>';
}

client.render = function render () {

  if (!latestProperties.bgnow || !latestProperties.bgnow.sgvs) {
    console.error('BG data not available');
    return;
  }

  let rec = latestProperties.bgnow.sgvs[0];
  let deltaDisplayValue;

  if (latestProperties.delta) {
    deltaDisplayValue = latestProperties.delta.display;
  }

  let pluginDisplayValue = pluginInfo();

  // process latestWeather:
  let weatherDisplayValue = "";
  if (latestWeather.main && latestWeather.weather) {
    weatherDisplayValue = latestWeather.main.temp.toFixed(0) + "°" + owmUnits + " (" + latestWeather.main.feels_like.toFixed(0) + "°" + owmUnits + ") " + latestWeather.weather[0].main;
  }

  // process buckets for graph:
  let graphHTMLPre = "";
  let graphHTMLPost = "";
  if (latestProperties.buckets && graphHours > 0) {
    graphHTMLPre = graphInfo();
    graphHTMLPost = '</div>';
  }
  
  let $errorMessage = $('#errorMessage');
  let $inner = $('#inner');

  // If no one measured value found => show "-?-"
  if (!rec) {
    if (!$errorMessage.length) {
      $inner.after('<div id="errorMessage" title="No data found in DB">-?-</div>')
    } else {
      $errorMessage.show();
    }
    $inner.hide();
    return;
  } else {
    $errorMessage.length && $errorMessage.hide();
    $inner.show();
  }

  //Parse face parameters
  let face = $inner.data('face').toLowerCase();

  // Backward compatible
  if (face === 'clock-color') {
    face = 'c' + (window.serverSettings.settings.showClockLastTime ? 'y' : 'n') + '13-sg35-' + (window.serverSettings.settings.showClockDelta ? 'dt14-' : '') + 'nl-ar25-nl-ag6';
  } else if (face === 'clock') {
    face = 'bn0-sg40';
  } else if (face === 'bgclock') {
    face = 'b' + (window.serverSettings.settings.showClockLastTime ? 'y' : 'n') + '13-sg35-' + (window.serverSettings.settings.showClockDelta ? 'dt14-' : '') + 'nl-ar25-nl-ag6';
  } else if (face === 'config') {
    face = $inner.attr('data-face-config');
    $inner.empty();
  }

  let faceParams = face.split('-');
  let bgColor = false;
  let staleMinutes = 13;
  let alwaysShowTime = false;

  let clockCreated = ($inner.children().length > 0);

  for (let param in faceParams) {
    if (param === '0') {
      /* eslint-disable-next-line security/detect-object-injection */ // verified false positive
      let faceParam = faceParams[param];
      bgColor = (faceParam.substr(0, 1) === 'c'); // do we want colorful background?
      alwaysShowTime = (faceParam.substr(1, 1) === 'y'); // always show "stale time" text?
      staleMinutes = (faceParam.substr(2, 2) - 0 >= 0) ? faceParam.substr(2, 2) : 13; // threshold value (0=never)
    } else if (!clockCreated) {
      /* eslint-disable-next-line security/detect-object-injection */ // verified false positive
      let faceParam = faceParams[param];
      // XXXX let div = '<div class="' + faceParam.substr(0, 2) + '"' + ((faceParam.substr(2, 2) - 0 > 0) ? ' style="' + ((faceParam.substr(0, 2) === 'ar') ? 'height' : 'font-size') + ':' + faceParam.substr(2, 2) + 'vmin' + ((faceParam.substr(0, 2) === 'pl') ? '; background-color: black; color: grey;"' : '"') : '') + '></div>';
      let div = '<div class="' + faceParam.substr(0, 2) + '"' + ((faceParam.substr(2, 2) - 0 > 0) ? ' style="' + ((faceParam.substr(0, 2) === 'ar') ? 'height' : 'font-size') + ':' + faceParam.substr(2, 2) + 'vmin"' : '') + '></div>';
      $inner.append(div);
    }
  }

  let displayValue;
  if (graphOverlaySGV) {
    displayValue = graphHTMLPre + rec.scaled + graphHTMLPost;
  } else {
    displayValue = rec.scaled;
    $('.gr').html(graphHTMLPre + graphHTMLPost);
  }

  // Insert the delta value text.
  $('.dt').html(deltaDisplayValue);
  $('.ow').html(weatherDisplayValue);
  $('.pl').html(pluginDisplayValue);
  
  // Color background
  if (bgColor) {

    // These are the particular shades of red, yellow, green, and blue.
    let red = 'rgba(213,9,21,1)';
    let yellow = 'rgba(234,168,0,1)';
    let green = 'rgba(134,207,70,1)';
    let blue = 'rgba(78,143,207,1)';

    // Threshold values
    let bgHigh = client.settings.thresholds.bgHigh;
    let bgLow = client.settings.thresholds.bgLow;
    let bgTargetBottom = client.settings.thresholds.bgTargetBottom;
    let bgTargetTop = client.settings.thresholds.bgTargetTop;

    let bgNum = parseFloat(rec.mgdl);

    // Threshold background coloring.
    if (bgNum < bgLow) {
      $('body').css('background-color', red);
      $('.pl').css('background-color', 'red').css('color', 'white');
    }
    if ((bgLow <= bgNum) && (bgNum < bgTargetBottom)) {
      $('body').css('background-color', blue);
      $('.pl').css('background-color', 'blue').css('color', 'white');
    }
    if ((bgTargetBottom <= bgNum) && (bgNum < bgTargetTop)) {
      $('body').css('background-color', green);
      $('.pl').css('background-color', 'green').css('color', 'white');
    }
    if ((bgTargetTop <= bgNum) && (bgNum < bgHigh)) {
      $('body').css('background-color', yellow);
      $('.pl').css('background-color', 'yellow').css('color', 'white');
    }
    if (bgNum >= bgHigh) {
      $('body').css('background-color', red);
      $('.pl').css('background-color', 'red').css('color', 'white');
    }
  } else {
    $('body').css('background-color', 'black');
    $('.pl').css('background-color', 'black').css('color', 'grey');
  }
  if (pluginDisplayValue.includes('<strong>')) {
    $('.pl').css('background-color', 'grey').css('color', 'black');
  }

  // Time before data considered stale.
  let threshold = 1000 * 60 * staleMinutes;

  var elapsedms = Date.now() - rec.mills;
  let elapsedMins = Math.floor((elapsedms / 1000) / 60);
  let thresholdReached = (elapsedms > threshold) && threshold > 0;

  // Insert the BG value text, toggle stale if necessary.
  $('.sg').toggleClass('stale', thresholdReached).html(displayValue);

  if (thresholdReached || alwaysShowTime) {
    let staleTimeText;
    if (elapsedMins === 0) {
      staleTimeText = 'Just now';
    } else if (elapsedMins === 1) {
      staleTimeText = '1 minute ago';
    } else {
      staleTimeText = elapsedMins + ' minutes ago';
    }

    $('.ag').html(staleTimeText);
  } else {
    $('.ag').html('');
  }

  // Insert the trend arrow.
  let arrow = $('<img alt="arrow">').attr('src', '/images/' + (!rec.direction || rec.direction === 'NOT COMPUTABLE' ? 'NONE' : rec.direction) + '.svg');

  // Restyle body bg
  if (thresholdReached) {
    $('body').css('background-color', 'grey').css('color', 'black');
    $('.ar').css('filter', 'brightness(0%)').html(arrow);
  } else {
    $('body').css('color', bgColor ? 'white' : 'grey');
    $('.ar').css('filter', bgColor ? 'brightness(100%)' : 'brightness(50%)').html(arrow);
  }

  updateClock();
  
};

function updateClock () {
  let timeDivisor = parseInt(client.settings.timeFormat ? client.settings.timeFormat : 12, 10);
  let today = new Date()
    , h = today.getHours() % timeDivisor;
  if (timeDivisor === 12) {
    h = (h === 0) ? 12 : h; // In the case of 00:xx, change to 12:xx for 12h time
  }
  if (timeDivisor === 24) {
    h = (h < 10) ? ("0" + h) : h; // Pad the hours with a 0 in 24h time
  }
  let m = today.getMinutes();
  if (m < 10) m = "0" + m;
  $('.tm').html(h + ":" + m);
}

client.updateParams = function updateParams () {
  let $inner = $('#inner');
  let face = $inner.data('face').toLowerCase();
  let faceParams = face.split('-');
  for (let param in faceParams) {
    let faceParam = faceParams[param];

    // open weathermap params: -ow{font size}:{F|C}:{zip}:{api key}
    // example: -ow16:F:01108:D17C57239B5661055D459A608F770208 (note: this example is not a valid OWM key)
    if (faceParam.substr(0, 2) === 'ow') {
      const owmParams = faceParam.substr(2).split(':');
      owmUnits = owmParams[1].toUpperCase();
      owmZip = owmParams[2].replace(/ /g,'%20');
      owmKey = owmParams[3];
    }

    // SGV graph size params: -gr{width %}:{height %}:{radius pixels}:{overlaySGV bool}:{hours}
    // example: -gr50:10:20:1:1
    if (faceParam.substr(0, 2) === 'gr') {
      const graphParams = faceParam.substr(2).split(':');
      graphWidth = graphParams[0];
      graphHeight = graphParams[1];
      graphRadius = graphParams[2];
      graphOverlaySGV = graphParams[3];
      graphHours = graphParams[4];
    }
  }
};

client.init = function init () {

  console.log('Initializing clock');
  client.settings = browserSettings(client, window.serverSettings, $);
  client.query();
  setInterval(client.query, 20 * 1000); // update every 20 seconds

  // time update
  setInterval(updateClock, 1000);

  client.updateParams();

  // open weathermap:
  if (owmKey !== '') {
    client.queryOWM();
    setInterval(client.queryOWM, 20 * 60 * 1000); // update every 20 minutes
  }
};

module.exports = client;
