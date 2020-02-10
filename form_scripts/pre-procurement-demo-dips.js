(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

exports.__esModule = true;

// Kommentert ut av byggescript = require("ehrcraft-form-api");
/**
 * Controller for the NEWS calculations
 */


var NewsController =
/** @class */
function () {
  function NewsController(api, newsFields, debug) {
    if (debug === void 0) {
      debug = false;
    }

    this.api = api;
    this.newsFields = newsFields;
    this.debug = debug;
    this.pulsScore = 0;
    this.respScore = 0;
    this.spo2Score = 0;
    this.oxygenAddedScore = 0;
    this.totalScore = 0;
  }
  /**
   * Calculate NEWS pulse score based on the given pulse
   * @param pulse
   */


  NewsController.prototype.updatePulse = function (pulse) {
    if (this.isLower(pulse, 40)) {
      this.pulsScore = 3;
    } else if (this.isBetween(pulse, 40, 50)) {
      this.pulsScore = 1;
    } else if (this.isBetween(pulse, 50, 90)) {
      this.pulsScore = 0;
    } else if (this.isBetween(pulse, 90, 110)) {
      this.pulsScore = 1;
    } else if (this.isBetween(pulse, 110, 130)) {
      this.pulsScore = 2;
    } else {
      // pulse mustbe above 130
      this.pulsScore = 3;
    }

    this.emit("Pulse is " + pulse + " gives score = " + this.pulsScore);
    var score = new DvOrdinal(this.pulsScore);
    this.api.setFieldValue(this.newsFields.pulseField, score);
    this.updateScore();
  };
  /**
   * Set the value for added oxygen based on the DV_BOOLEAN (boolean) value
   * @param isOnAir
   */


  NewsController.prototype.updateOxygenAdded = function (isOnAir) {
    if (isOnAir) {
      this.oxygenAddedScore = 0;
    } else {
      this.oxygenAddedScore = 2;
    }

    var score = new DvOrdinal(this.oxygenAddedScore);
    this.api.setFieldValue(this.newsFields.oxygenAddedField, score);
    this.emit("OxygenAdded (" + isOnAir + ") -> " + this.oxygenAddedScore);
    this.updateScore();
  };
  /**
   * If respiration is NOT present the score will be high (3)
   * @param isRespirationPresent
   */


  NewsController.prototype.updateRespirationPresent = function (isRespirationPresent) {
    if (isRespirationPresent) {// I will do nothing here
    } else {
      this.respScore = 3;
      var score = new DvOrdinal(this.respScore);
      this.api.setFieldValue(this.newsFields.respField, score);
    }

    this.updateScore();
  };
  /**
   * Calculate the NEWS respiration score based on the update respiration
   * @param respiration
   */


  NewsController.prototype.updateRespiration = function (respiration) {
    if (this.isLower(respiration, 8, true)) {
      this.respScore = 3;
    } else if (this.isBetween(respiration, 9, 11)) {
      this.respScore = 1;
    } else if (this.isBetween(respiration, 12, 20, true)) {
      this.respScore = 0;
    } else if (this.isBetween(respiration, 21, 24, true)) {
      this.respScore = 2;
    } else if (this.isHigher(respiration, 25)) {
      this.respScore = 3;
    }

    var score = new DvOrdinal(this.respScore);
    this.api.setFieldValue(this.newsFields.respField, score);
    this.updateScore();
  };
  /**
   * Calculate the SpO2 NEWS score based on the given value
   * @param spO2Value
   */


  NewsController.prototype.updateSpo2 = function (spO2Value) {
    if (this.isLower(spO2Value, 91)) {
      this.spo2Score = 3;
    } else if (this.isBetween(spO2Value, 92, 93, true, true)) {
      this.spo2Score = 2;
    } else if (this.isBetween(spO2Value, 94, 95, true, true)) {
      this.spo2Score = 1;
    } else if (this.isHigher(spO2Value, 96)) {
      this.spo2Score = 0;
    }

    var score = new DvOrdinal(this.spo2Score);
    this.api.setFieldValue(this.newsFields.spo2Field, score);
    this.emit(" SpO2 (" + spO2Value + " -> " + this.spo2Score);
    this.updateScore();
  };

  NewsController.prototype.isBetween = function (value, lower, higher, lowerIncluded, higherIncluded) {
    if (lowerIncluded === void 0) {
      lowerIncluded = false;
    }

    if (higherIncluded === void 0) {
      higherIncluded = true;
    }

    if (lowerIncluded && higherIncluded) {
      return value >= lower && value <= higher;
    } else if (higherIncluded) {
      return value > lower && value <= higher;
    } else if (lowerIncluded) {
      return value >= lower && value < higher;
    } else {
      this.emit("Not allwed input - return false");
      return false;
    }
  };

  NewsController.prototype.isLower = function (value, lower, lowerIncluded) {
    if (lowerIncluded === void 0) {
      lowerIncluded = true;
    }

    if (lowerIncluded) {
      return value <= lower;
    } else {
      return value < lower;
    }
  };

  NewsController.prototype.isHigher = function (value, higher, higherIncluded) {
    if (higherIncluded === void 0) {
      higherIncluded = true;
    }

    return value >= higher;
  };

  NewsController.prototype.updateScore = function () {
    this.totalScore = this.pulsScore + this.respScore + this.spo2Score;
    var dt = new DvDateTime(new Date());
    this.api.setFieldValue(this.newsFields.timeField, dt);
  };

  NewsController.prototype.emit = function (value) {
    if (this.debug) {
      console.log("NEWS_CONTROLLER -> " + value);
    }
  };

  return NewsController;
}();

exports.NewsController = NewsController;
},{}],2:[function(require,module,exports){
"use strict"; // generic index.ts fil

exports.__esModule = true;

// Kommentert ut av byggescript = require("ehrcraft-form-api");

var NewsController_1 = require("./NewsController");

var SPO2 = "pre-procurement-demo-dips/vital_parameters@Vital parameters/pulsoximetri/ospecificerad_händelse/spo₂";
var SPO2_TIME = "pre-procurement-demo-dips/vital_parameters@Vital parameters/pulsoximetri/ospecificerad_händelse/time";
var PULSE = "pre-procurement-demo-dips/vital_parameters@Vital parameters/puls_hjärtfrekvens/ospecificerad_händelse/frekvens";
var PULSE_TIME = "pre-procurement-demo-dips/vital_parameters@Vital parameters/puls_hjärtfrekvens/ospecificerad_händelse/time";
var RESP = "pre-procurement-demo-dips/vital_parameters@Vital parameters/andning/ospecificerad_händelse/frekvens";
var RESP_PRESENT = "pre-procurement-demo-dips/vital_parameters@Vital parameters/andning/ospecificerad_händelse/förekomst";
var RESP_TIME = "pre-procurement-demo-dips/vital_parameters@Vital parameters/andning/ospecificerad_händelse/time";
var ON_AIR_FIELD = "pre-procurement-demo-dips/vital_parameters@Vital parameters/pulsoximetri/ospecificerad_händelse/tillfört_syre/enbart_luft";
var LOAD_CHECK_FIELD = "generic-field-95088";
var DEVICE_URL = "http://localhost:3000";
var NEWS_TIME_FIELD = "pre-procurement-demo-dips/news/tidpunkt/time";
/**
 *
 * @param api API controller given by the renderer
 */

function main(api, http) {
  console.log(banner);
  var newsController = new NewsController_1.NewsController(api, new NewsFields());
  var deviceController = new DeviceController(DEVICE_URL, http, api);
  api.addListener(LOAD_CHECK_FIELD, "OnChanged", function (id, value, parent) {
    var theval = value;

    if (theval.Value) {
      deviceController.sampleDevice();
    } else {// only sample when check is true
    }
  });
  api.addListener(ON_AIR_FIELD, "OnFormInitialized", function (id, value, parent) {
    console.log("OnAir initialized with " + value);
    var added = value;

    if (added && added.Value) {
      newsController.updateOxygenAdded(added.Value);
    } else {
      newsController.updateOxygenAdded(false);
    }
  });
  api.addListener(ON_AIR_FIELD, "OnChanged", function (id, value, parent) {
    console.log("OnAir changed" + value);
    var added = value;

    if (added && added.Value) {
      newsController.updateOxygenAdded(added.Value);
    } else {
      newsController.updateOxygenAdded(false);
    }
  });
  api.addListener(SPO2, "OnChanged", function (id, value, parent) {
    console.log("SpO2 -> " + value);
    var sp = value;

    if (sp && sp.Numerator) {
      console.log("|- " + sp.Numerator);
      newsController.updateSpo2(sp.Numerator);
    }
  });
  api.addListener(PULSE, "OnChanged", function (id, value, parent) {
    console.log("Pulse -> " + value);
    var p = value;

    if (p && p.Magnitude) {
      console.log("|- " + p.Magnitude);
      newsController.updatePulse(p.Magnitude);
    }
  });
  api.addListener(RESP, "OnChanged", function (id, value, parent) {
    console.log("Resp -> " + value);
    var r = value;

    if (r && r.Magnitude) {
      console.log("|- " + r.Magnitude);
      newsController.updateRespiration(r.Magnitude);
    }
  });
  api.addListener(RESP_PRESENT, "OnChanged", function (id, value, parent) {
    console.log("Resp present: " + value);

    if (value) {
      var present = value;

      if (present && present.DefiningCode && present.DefiningCode.CodeString) {
        var atcode = present.DefiningCode.CodeString;

        switch (atcode) {
          case "at0063":
            // Is present
            newsController.updateRespirationPresent(true);
            break;

          case "at0064":
            // Is not present
            newsController.updateRespirationPresent(false);
            newsController.updateRespiration(getRespirationAsValue(api));
            break;

          default:
            newsController.updateRespirationPresent(false);
            newsController.updateRespiration(getRespirationAsValue(api));
            break;
        }
      }
    } else {
      console.log("|- RESP PRESENT is not set");
    }
  });
}

exports.main = main;

function createDvDateTime(when) {
  var dt = new DvDateTime(when);
  console.log(dt);
  return dt;
}
/**
 * MOCK function to receive data and update the form
 * @param api
 * @param data
 */


function updateFormWithDeviceData(api, data) {
  console.log("Update with device data");
  console.log(data); // Update SpO2

  var prop = new DvProportion();
  prop.Numerator = data.spo2;
  prop.Denominator = 100;
  api.setFieldValue(SPO2, prop);
  api.setFieldValue(SPO2_TIME, createDvDateTime(new Date()));
  api.showField(SPO2_TIME); // Update pulse

  var pulse = new DvQuantity();
  pulse.Magnitude = data.pulse;
  pulse.Units = "/min";
  api.setFieldValue(PULSE, pulse);
  api.showField(PULSE_TIME);
  api.setFieldValue(PULSE_TIME, createDvDateTime(new Date())); // Update respiration

  var resp = new DvQuantity();
  resp.Magnitude = data.resp;
  resp.Units = "/min";
  api.setFieldValue(RESP, resp);
  api.showField(RESP_TIME);
  api.setFieldValue(RESP_TIME, createDvDateTime(new Date())); // Set the loading check back to false

  var what = api.getFieldValue(LOAD_CHECK_FIELD);
  what.Value = false;
  api.setFieldValue(LOAD_CHECK_FIELD, what);
}
/**
 *
 * @param api the form renderer API
 */


function getRespirationAsValue(api) {
  var r = api.getFieldValue(RESP);
  var val = r;

  if (val && val.Magnitude) {
    return val.Magnitude;
  } else {
    return 0;
  }
}
/**
 * A MOCK device controller sampling the device with HTTP GET
 */


var DeviceController =
/** @class */
function () {
  function DeviceController(url, http, api) {
    this.url = url;
    this.http = http;
    this.api = api;
  }

  DeviceController.prototype.sampleDevice = function () {
    var _this = this;

    console.log("Sampling URL = " + this.url);
    this.http.get(this.url, function (status, isSuccess, data) {
      var body = status;
      var js = JSON.parse(body.Data);
      var deviceData = js;
      updateFormWithDeviceData(_this.api, deviceData);
    });
  };

  return DeviceController;
}();
/**
 * A class to hold the FORM ids for the NEWS fields. Since they may vary across forms.
 *
 */


var NewsFields =
/** @class */
function () {
  function NewsFields(timeField, pulseField, spo2Field, respField, oxygenAddedField) {
    if (timeField === void 0) {
      timeField = "pre-procurement-demo-dips/news/tidpunkt/time";
    }

    if (pulseField === void 0) {
      pulseField = "pre-procurement-demo-dips/news/tidpunkt/hjärtfrekvens";
    }

    if (spo2Field === void 0) {
      spo2Field = "pre-procurement-demo-dips/news/tidpunkt/syremättnad";
    }

    if (respField === void 0) {
      respField = "pre-procurement-demo-dips/news/tidpunkt/andningsfrekvens";
    }

    if (oxygenAddedField === void 0) {
      oxygenAddedField = "pre-procurement-demo-dips/news/tidpunkt/syrgastillförsel";
    }

    this.timeField = timeField;
    this.pulseField = pulseField;
    this.spo2Field = spo2Field;
    this.respField = respField;
    this.oxygenAddedField = oxygenAddedField;
  }

  return NewsFields;
}();

exports.NewsFields = NewsFields; //

var banner = "\n#####################################################\n#####                                          ######\n##### EHR Craft Scripts - Pre-Procurement Demo ######\n#####                                          ######\n#####################################################\n";main(api, http);
},{"./NewsController":1}]},{},[2])