/*
=> Class -> structure + design
  -> blueprint for creating a object
  -------------------------------------------------
  -> template that outlines structure and capabilities
    -> don't represent actual instance

=> Object -> structure to live + specific data
  -> properties (attributes)
  -> behaviors (method)
  --------------------------------------------------
  -> instance of class
    -> specific realization of the class blueprint
      -> it's unique set of data

=> Key characteristics
  -> Attributes (state)
    -> variable
      -> describe characteristic of obj
  -> Methods (behavior)
    -> function in class
      -> what obj can do
  -> Constructor -> same name as class name
    -> special method
      -> initialize the attributes of class
        -> when obj is created
    ----------------------------------------
    => Key Key characteristics of constructor
      -> Automatic invocation
      -> No return
      -> Overloading Support
*/

// ========================================================================
// default constructor
class Movie {
  // constructor() {
  //   this.title;
  //   this.duration;
  // }

  displayDetails() {
    console.log("default constructor ->", this.title, this.duration);
  }
}
const movie = new Movie();
movie.displayDetails();
// -----------------------------------------------------------------
// custom default constructor
class Movie2 {
  Movie2() {
    this.title = "End Game";
    this.duration = 200;
  }

  displayDetails() {
    console.log("Custom default constructor ->", this.title, this.duration);
  }
}
// -------------------------------------------------------------------
const movie2 = new Movie2();
movie2.displayDetails();

// Parameterized constructor
class Movie3 {
  constructor(title, duration) {
    this.title = title;
    this.duration = duration;
  }

  displayDetails() {
    console.log("Parameterized constructor -> ", this.title, this.duration);
  }
}

const movie3 = new Movie3("Infinity War", 300);
movie3.displayDetails();

// Copy Constructor
class Movie4 {
  constructor(movie) {
    if (movie instanceof Movie) {
      // Copy constructor: copy properties from another Movie instance
      this.title = movie.title;
      this.duration = movie.duration;
    } else {
      // Default constructor or parameterized constructor
      this.title = movie?.title || undefined;
      this.duration = movie?.duration || undefined;
    }
  }

  displayDetails() {
    console.log(this.title, this.duration);
  }
}

// Usage
const originalMovie = new Movie4({ title: "Inception", duration: 148 });
originalMovie.displayDetails(); // Output: Inception 148
const copiedMovie = new Movie4(originalMovie);
copiedMovie.displayDetails(); // Output: Inception 148

// Private Constructor
const PrivateConstructorToken = Symbol('PrivateConstructorToken');
class Singleton {
  constructor(token) {
    if (token !== PrivateConstructorToken) {
      throw new Error('Use MyClass.create() to get instance.');
    }
    this.someProperty = 'value';
  }

  static create() {
    return new Singleton(PrivateConstructorToken);
  }
}

const instance = Singleton.create();  // works
instance.someProperty = 'hello'
const instance2 = Singleton.create();  // works
console.log(instance, instance2)
// const failInstance = new MyClass();  // throws Error

