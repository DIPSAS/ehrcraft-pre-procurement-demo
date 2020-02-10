// generic index.ts fil

import {
  DvProportion,
  API,
  DvQuantity,
  DvBoolean,
  DvCodedText,
  HTTP,
  DvDateTime
} from "ehrcraft-form-api";
import { NewsController } from "./NewsController";
import { create } from "domain";

const SPO2 =
  "pre-procurement-demo-dips/vital_parameters@Vital parameters/pulsoximetri/ospecificerad_händelse/spo₂";
const SPO2_TIME =
  "pre-procurement-demo-dips/vital_parameters@Vital parameters/pulsoximetri/ospecificerad_händelse/time";
const PULSE =
  "pre-procurement-demo-dips/vital_parameters@Vital parameters/puls_hjärtfrekvens/ospecificerad_händelse/frekvens";
const PULSE_TIME =
  "pre-procurement-demo-dips/vital_parameters@Vital parameters/puls_hjärtfrekvens/ospecificerad_händelse/time";
const RESP =
  "pre-procurement-demo-dips/vital_parameters@Vital parameters/andning/ospecificerad_händelse/frekvens";

const RESP_PRESENT =
  "pre-procurement-demo-dips/vital_parameters@Vital parameters/andning/ospecificerad_händelse/förekomst";

const RESP_TIME =
  "pre-procurement-demo-dips/vital_parameters@Vital parameters/andning/ospecificerad_händelse/time";

const ON_AIR_FIELD =
  "pre-procurement-demo-dips/vital_parameters@Vital parameters/pulsoximetri/ospecificerad_händelse/tillfört_syre/enbart_luft";

const LOAD_CHECK_FIELD = "generic-field-95088";

const DEVICE_URL = "http://localhost:3000";

const NEWS_TIME_FIELD = "pre-procurement-demo-dips/news/tidpunkt/time";

/**
 *
 * @param api API controller given by the renderer
 */
export function main(api: API, http: HTTP) {
  console.log(banner);

  const newsController = new NewsController(api, new NewsFields());
  const deviceController = new DeviceController(DEVICE_URL, http, api);

  api.addListener(LOAD_CHECK_FIELD, "OnChanged", (id, value, parent) => {
    const theval = <DvBoolean>value;
    if (theval.Value) {
      deviceController.sampleDevice();
    } else {
      // only sample when check is true
    }
  });
  api.addListener(ON_AIR_FIELD, "OnFormInitialized", (id, value, parent) => {
    console.log("OnAir initialized with " + value);

    const added = <DvBoolean>value;
    if (added && added.Value) {
      newsController.updateOxygenAdded(added.Value);
    } else {
      newsController.updateOxygenAdded(false);
    }
  });
  api.addListener(ON_AIR_FIELD, "OnChanged", (id, value, parent) => {
    console.log("OnAir changed" + value);

    const added = <DvBoolean>value;
    if (added && added.Value) {
      newsController.updateOxygenAdded(added.Value);
    } else {
      newsController.updateOxygenAdded(false);
    }
  });

  api.addListener(SPO2, "OnChanged", (id, value, parent) => {
    console.log("SpO2 -> " + value);
    const sp = <DvProportion>value;
    if (sp && sp.Numerator) {
      console.log("|- " + sp.Numerator);
      newsController.updateSpo2(sp.Numerator);
    }
  });

  api.addListener(PULSE, "OnChanged", (id, value, parent) => {
    console.log("Pulse -> " + value);
    const p = <DvQuantity>value;
    if (p && p.Magnitude) {
      console.log("|- " + p.Magnitude);
      newsController.updatePulse(p.Magnitude);
    }
  });
  api.addListener(RESP, "OnChanged", (id, value, parent) => {
    console.log("Resp -> " + value);

    const r = <DvQuantity>value;
    if (r && r.Magnitude) {
      console.log("|- " + r.Magnitude);
      newsController.updateRespiration(r.Magnitude);
    }
  });
  api.addListener(RESP_PRESENT, "OnChanged", (id, value, parent) => {
    console.log("Resp present: " + value);
    if (value) {
      const present = <DvCodedText>value;
      if (present && present.DefiningCode && present.DefiningCode.CodeString) {
        const atcode = present.DefiningCode.CodeString;

        switch (atcode) {
          case "at0063": // Is present
            newsController.updateRespirationPresent(true);
            break;
          case "at0064": // Is not present
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

function createDvDateTime(when: Date) {
  const dt = new DvDateTime(when);
  console.log(dt);
  return dt;
}

/**
 * MOCK function to receive data and update the form
 * @param api
 * @param data
 */
function updateFormWithDeviceData(api: API, data: DeviceData) {
  console.log("Update with device data");
  console.log(data);
  // Update SpO2
  const prop = new DvProportion();
  prop.Numerator = data.spo2;
  prop.Denominator = 100;
  api.setFieldValue(SPO2, prop);
  api.setFieldValue(SPO2_TIME, createDvDateTime(new Date()));
  api.showField(SPO2_TIME);
  // Update pulse
  const pulse = new DvQuantity();
  pulse.Magnitude = data.pulse;
  pulse.Units = "/min";
  api.setFieldValue(PULSE, pulse);
  api.showField(PULSE_TIME);
  api.setFieldValue(PULSE_TIME, createDvDateTime(new Date()));
  // Update respiration
  const resp = new DvQuantity();
  resp.Magnitude = data.resp;
  resp.Units = "/min";
  api.setFieldValue(RESP, resp);
  api.showField(RESP_TIME);
  api.setFieldValue(RESP_TIME, createDvDateTime(new Date()));
  // Set the loading check back to false
  const what = api.getFieldValue(LOAD_CHECK_FIELD);
  what.Value = false;
  api.setFieldValue(LOAD_CHECK_FIELD, what);
}
/**
 *
 * @param api the form renderer API
 */
function getRespirationAsValue(api: API): number {
  const r = api.getFieldValue(RESP);
  const val = <DvQuantity>r;
  if (val && val.Magnitude) {
    return val.Magnitude;
  } else {
    return 0;
  }
}

/**
 * Modelling the device data response
 */
interface DeviceData {
  spo2: number;
  pulse: number;
  temp: number;
  resp: number;
}
/**
 * A MOCK device controller sampling the device with HTTP GET
 */
class DeviceController {
  constructor(private url: string, private http: HTTP, private api: API) {}

  sampleDevice() {
    console.log("Sampling URL = " + this.url);
    this.http.get(this.url, (status, isSuccess, data: any) => {
      const body = <any>status;
      const js = JSON.parse(body.Data);
      const deviceData = <DeviceData>js;
      updateFormWithDeviceData(this.api, deviceData);
    });
  }
}
/**
 * A class to hold the FORM ids for the NEWS fields. Since they may vary across forms.
 *
 */
export class NewsFields {
  constructor(
    public timeField = "pre-procurement-demo-dips/news/tidpunkt/time",
    public pulseField = "pre-procurement-demo-dips/news/tidpunkt/hjärtfrekvens",
    public spo2Field = "pre-procurement-demo-dips/news/tidpunkt/syremättnad",
    public respField = "pre-procurement-demo-dips/news/tidpunkt/andningsfrekvens",
    public oxygenAddedField = "pre-procurement-demo-dips/news/tidpunkt/syrgastillförsel"
  ) {}
}
//

const banner = `
#####################################################
#####                                          ######
##### EHR Craft Scripts - Pre-Procurement Demo ######
#####                                          ######
#####################################################
`;
