import { API, DvOrdinal, DvDateTime } from "ehrcraft-form-api";
import { NewsFields } from "./index";
/**
 * Controller for the NEWS calculations
 */
export class NewsController {
  pulsScore = 0;
  respScore = 0;
  spo2Score = 0;
  oxygenAddedScore = 0;
  totalScore = 0;
  constructor(
    private api: API,
    private newsFields: NewsFields,
    private debug = false
  ) {}

  /**
   * Calculate NEWS pulse score based on the given pulse
   * @param pulse
   */
  updatePulse(pulse: number) {
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
    this.emit(`Pulse is ${pulse} gives score = ${this.pulsScore}`);
    const score = new DvOrdinal(this.pulsScore);
    this.api.setFieldValue(this.newsFields.pulseField, score);
    this.updateScore();
  }
  /**
   * Set the value for added oxygen based on the DV_BOOLEAN (boolean) value
   * @param isOnAir
   */
  updateOxygenAdded(isOnAir: boolean) {
    if (isOnAir) {
      this.oxygenAddedScore = 0;
    } else {
      this.oxygenAddedScore = 2;
    }
    const score = new DvOrdinal(this.oxygenAddedScore);
    this.api.setFieldValue(this.newsFields.oxygenAddedField, score);
    this.emit(`OxygenAdded (${isOnAir}) -> ${this.oxygenAddedScore}`);
    this.updateScore();
  }
  /**
   * If respiration is NOT present the score will be high (3)
   * @param isRespirationPresent
   */
  updateRespirationPresent(isRespirationPresent: boolean) {
    if (isRespirationPresent) {
      // I will do nothing here
    } else {
      this.respScore = 3;
      const score = new DvOrdinal(this.respScore);
      this.api.setFieldValue(this.newsFields.respField, score);
    }
    this.updateScore();
  }
  /**
   * Calculate the NEWS respiration score based on the update respiration
   * @param respiration
   */
  updateRespiration(respiration: number) {
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
    const score = new DvOrdinal(this.respScore);
    this.api.setFieldValue(this.newsFields.respField, score);
    this.updateScore();
  }
  /**
   * Calculate the SpO2 NEWS score based on the given value
   * @param spO2Value
   */
  updateSpo2(spO2Value: number) {
    if (this.isLower(spO2Value, 91)) {
      this.spo2Score = 3;
    } else if (this.isBetween(spO2Value, 92, 93, true, true)) {
      this.spo2Score = 2;
    } else if (this.isBetween(spO2Value, 94, 95, true, true)) {
      this.spo2Score = 1;
    } else if (this.isHigher(spO2Value, 96)) {
      this.spo2Score = 0;
    }
    const score = new DvOrdinal(this.spo2Score);
    this.api.setFieldValue(this.newsFields.spo2Field, score);
    this.emit(` SpO2 (${spO2Value} -> ${this.spo2Score}`);
    this.updateScore();
  }
  private isBetween(
    value: number,
    lower: number,
    higher: number,
    lowerIncluded = false,
    higherIncluded = true
  ): boolean {
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
  }
  private isLower(value: number, lower: number, lowerIncluded = true) {
    if (lowerIncluded) {
      return value <= lower;
    } else {
      return value < lower;
    }
  }
  private isHigher(value: number, higher: number, higherIncluded = true) {
    return value >= higher;
  }
  private updateScore() {
    this.totalScore = this.pulsScore + this.respScore + this.spo2Score;
    const dt = new DvDateTime(new Date());
    this.api.setFieldValue(this.newsFields.timeField, dt);
  }
  emit(value: string) {
    if (this.debug) {
      console.log("NEWS_CONTROLLER -> " + value);
    }
  }
}
