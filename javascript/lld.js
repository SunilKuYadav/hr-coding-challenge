// What is LLD?

// for solving isolated problem we use DSA

// LLD mainly focused on there three 

// 1. Scalability
// 2. Maintainability
// 3. Re-useability


// What is NOT LLD?
// HLD
// Tech Stack, DB, Server scale, cost optimization

// HLD + LLD + DSA = Application
// HLD: System Architeture
// LLD: code structure
// DSA: Tool used by LLD

// If DSA is the brain of an Application then LLD is the skelaton

// OOPs

// Machine language: binary code
// Assembly language: symbolic code
// Procedual Programming: Procedure call and return
// High level language: human readable code

// OOPs: Object Oriented Programming System
// Object: Real world entity
// Class: Blueprint of an object

// in real word object intract with each other and with the environment
// Object will have characteristics and behavior
// Characteristics are called properties
// Behavior are called methods

// Example:
// Object: Car
// Properties: Color, Brand, Model, Speed (Variables)
// Methods: Start, Stop, Accelerate, Brake (Methods)

// Object: Human
// Properties: Name, Age, Gender
// Methods: Drive, Eat, Sleep, Work, Play

// Object: Dog
// Properties: Color, Breed, Age, Weight
// Methods: Bark, Eat, Sleep

// 4 Pillars of OOPs
// 1. Abstraction
// 2. Encapsulation
// 3. Inheritance
// 4. Polymorphism

// Abstraction:
// 1. Hide the complex details and show the essential features
// 2. Example: Car
// No need to know how startEngine, shiftGear, accelerate, brake, stopEngine works
// Only need to know how to use the car
// This is the concept of Abstraction

// Encapsulation:
// 1. Encapsulate the data and behavior of an object
// 2. Encapsulation also deal with data hiding
// 2. Example: Car

// Access modifiers:
// 1. Public: Accessible from anywhere
// 2. Private: Accessible only within the class
// 3. Protected: Accessible within the class and subclasses
// 4. Default: Accessible within the package

// Example: Car
// Public: startEngine, shiftGear, accelerate, brake, stopEngine
// Private: color, brand, model, speed
// it's focus on data security 


// Inheritance:
// 1. Inherit the properties and behavior of a parent class
// 2. Example: Car

// Example:
// Parent class: Car
// Child class: SportsCar

// Types of Inheritance
// 1. Single Inheritance
// 2. Multi Level Inheritance
// 3. Multiple Inheritance
// 4. Hierarchical Inheritance
// 5. Hybrid Inheritance

// Example:
// Parent class: Car
// Child class: SportsCar

// Polymorphism:
// 1. Method Overriding - Dynamic Polymorphism
// 2. Method Overloading - Static Polymorphism

// Example:
// Parent class: Car
// Child class: SportsCar

// Method Overriding:
// 1. Override the method of the parent class
// 2. Example: Car


// UML Diagram
// 1. Structural Diagram
// 2. Behavioral Diagram

// Structural Diagram
// 1. Class Diagram <<<<====
// 2. Object Diagram
// 3. Component Diagram
// 4. Deployment Diagram
// 5. Composite Structure Diagram
// 6. Package Diagram
// 7. Profile Diagram
// 8. UML Diagram

// Behavioral Diagram
// 1. Activity Diagram
// 2. State Machine Diagram
// 3. Sequence Diagram <<<<====
// 4. Communication Diagram
// 5. Interaction Overview Diagram


// class representation
// [
// class name
//     Car

// properties
//     - brand: string
//     - modal: string
//     - isEnginOn: boolean
//     - currentSpeed: number
//     - tyre: string

// methods
//     + startEngine(): void
//     + accelerate(): void
//     + brake(): void
//     + stopEngine(): void
// ]

// + => public modifier
// - => private modifier
// # => protected modifier

// association
// 1. class association
// 2. object association

// class association
// 1. aggregation
// 2. composition
// eg. Inheritance (Is-a relationship)

// object association
// 1. association
// 2. aggregation
// 3. composition (has-a relationship)

// Sequence Diagram - Behavioral Diagram
// Object - with square box
// Lifeline - with dashed line
// Activation bar - with rectangle box
// Message - with arrow
// async message
// sync message
// lost message
// found message

// Aggregation - with diamond shape
// Composition - with filled diamond shape

// alt: if else
// option: if
// loop: for