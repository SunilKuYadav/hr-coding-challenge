// THE OBJECT
// the object type represents one of JavaScript's data type. It is used to store various keyed collection and more complex entries.

// create a object
// 1. Using object literals
// 2. Using object create method
// 3. using Class
// 4. Using Factory Functions
// Constructor

const object1 = {};
const object2 = Object.create({});
class Hello {}
const object3 = new Hello();
const Cart = () => {
  const products = [];
  const addProduct = (product) => {
    products.push(product);
  };
  const getTotalPrice = () => {
    return products.reduce((total, p) => total + p.price, 0);
  };
  return {
    addProduct,
    getTotalPrice,
  };
};
const object4 = Cart();
const object5 = new Object();
const object6 = new Object(undefined);
const object7 = new Object(null);

const type = (obj) => {
  return typeof obj;
};

console.log("====================================");
console.log(type(object1));
console.log(type(object2));
console.log(type(object3));
console.log(type(object4));
console.log(type(object5));
console.log("====================================");

// Constructor
new Object(); // => Trun the input in object

// Static methods
Object.create(); // => Creates a new object with the specific prototype object and properties.
Object.assign(); // => Copies the values of enumerable own properties from one or more sourse object to a target object.
Object.entries(); // => Returns an Array containing all the [key, value] pairs of a given object's own enumerable string properties.
Object.keys(); // => Return an array containing the names of all of the given object's own enumerable dtring properties.
Object.values(); // => Return an array containing the values that correspond to all of a given object's own enumerable string properies.
Object.defineProperty(); // => Adds the named property described by a given descriptor to an object.
Object.defineProperties(); // => Adds the named properties described by a given descriptor to an object.
Object.freeze(); // => Freeze an object. Other code connot delete or change its properties.
Object.fromEntries(); // => Return a new object from an iterable of[key, value] paires. This is the reverse of Object.entries
Object.getOwnPropertyDescriptor(); // => Return a property descriptor from a named property on an object.
Object.getOwnPropertyDescriptors(); // => Return an object containing all own property descriptors for an object.
Object.getOwnPropertyNames(); // => Return an array containing the names of all of the given object's oen enumerable and non-enumerable properties.
Object.getOwnPropertySymbols(); // => Return an array of all symbole properties found directly upon a given object.
Object.getPrototypeOf(); // => Return the prototype ( internal [[Prototype]] property) of the specific object.
Object.is(); // => Compares if two values are the same value. Equates all NaN values (which differs from both IsLooselyEqusl used by == and IsStrictEqual used by ===).
Object.isExtensible(); // => Determined if extending of an object os allowed.
Object.isFrozen(); // => Determined if an object is frozen.
Object.isSealed(); // => Determined if an object is sealed.
Object.preventExtensions(); // => Prevent any extension of an object.
Object.seal(); // => Prevent other code from deleting properties of an object.
Object.setPrototypeOf(); // => Sets the Object's prototype.

// Instance properties
Object.prototype.constructor; // => Specifies the function that creates an object's prototype.

// Instance methods
Object.prototype.__defineGetter__(); // => Associate a function with a property that, when accessed, executes that function and return its return value.
Object.prototype.__defineSetter__(); // => Associates a function with a property that, when set, executes that function which modifies the property.
Object.prototype.__lookupGetter__(); // => Return the function bound as a getter to the specificed proerty.
Object.prototype.__lookupSetter__(); // => Return the function bound as a setter to the specific property.
Object.prototype.hasOwnProperty(); // => Return a boolean indicating whether an object contains the specific property as a direct property os that object and not inherited through the prototype chain.
Object.prototype.isPrototypeOf(); // => Return a boolean indicating whether the object this method is called upon is in the prototype chain of the specific object.
Object.prototype.propertyIsEnumerable(); // => Return a boolean indicating whether the specified property is the object's enumerable own property.
Object.prototype.toLocaleString(); // => Calls toString().
Object.prototype.toString(); // => Return a string representation of the object.
Object.prototype.valueOf(); // => Return the primitive value of the specified object.
