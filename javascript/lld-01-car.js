class Car {
  // Static properties
  static brand = "Default Brand";
  static modal = "Default Model";
  static isEnginOn = false;
  static currentSpeed = 0;
  static tyre = "MRF";

  constructor(brand, modal) {
    this.brand = brand;
    this.modal = modal;
    this.isEnginOn = false;
    this.currentSpeed = 0;
    this._tyre = "MRF";
  }

  // getter and setter
  get tyre() {
    return this._tyre;
  }
  set tyre(tyre) {
    // validation
    this._tyre = tyre;
  }

  startEngine() {
    this.isEnginOn = true;
    console.log(`${this.brand} ${this.modal} Engine started with a roar!!`);
  }

  accelerate() {
    if (this.isEnginOn) {
      this.currentSpeed += 10;
      console.log(`${this.brand} ${this.modal} accelerated to ${this.currentSpeed} km/h`);
    } else {
      console.log(`${this.brand} ${this.modal} Engine is not started, please start the engine first`);
    }
  }

  brake() {
    this.currentSpeed -= 20;
    if (this.currentSpeed < 0) {
      this.currentSpeed = 0;
    }
    console.log(`${this.brand} ${this.modal} accelerated to ${this.currentSpeed} km/h`);
  }

  stopEngine() {
    this.isEnginOn = false;
    this.currentSpeed = 0;
    console.log(`${this.brand} ${this.modal} Engine stopped`);
  }
}

class ManualCar extends Car {
  #currentGear

  constructor(brand, modal) {
    super(brand, modal);
    this.#currentGear = 0;
  }

  shiftGear(gear) {
    if (this.isEnginOn) {
      this.#currentGear = gear;
      console.log(`${this.brand} ${this.modal} shifted to ${gear} gear`);
    } else {
      console.log(`${this.brand} ${this.modal} Engine is not started, please start the engine first`);
    }
  }
}

class ElectricCar extends Car {
  constructor(brand, modal) {
    super(brand, modal);
    this.batteryPercentage = 100;
  }

  chargeBattery() {
    this.batteryPercentage = 100;
    console.log(`${this.brand} ${this.modal} battery charged to ${this.batteryPercentage}%`);
  }
}



const myCar = new ManualCar("BMW", "M3");
myCar.startEngine();
myCar.shiftGear(1);
myCar.accelerate();
myCar.shiftGear(2);
myCar.accelerate();
myCar.accelerate();
myCar.brake();
myCar.brake();
myCar.stopEngine();

// myCar.#brand = "Audi"; // SyntaxError: Private field '#brand' must be declared in an enclosing class

// No need to know how startEngine, shiftGear, accelerate, brake, stopEngine works
// Only need to know how to use the car
// This is the concept of Abstraction