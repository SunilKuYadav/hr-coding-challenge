// The Map object holds key-value pairs and remembers the original insertion order of the keys. Any value (both objects and primitive values) may be used as either a key or a value.

// Map
// 1. A Map does not cointain any keys by default. It only contains what is explicitly put into.
// 2. A Map's keys can be any value (including function, objects, or any primitive).
// 3. The keys in Map are ordered in a simple, straightforward way: A Map object iterates entries, keys, and values in the order of entry insertion.
// 4. The number of items in a Map is easily retrieved from its size property.
// 5. A Map is an iterable, so it can be directly iterated.
// 6. Performs better in frequent additions and removals of key-value pairs.
// 7. No native support for serialization or parsing. https://stackoverflow.com/questions/29085197/how-do-you-json-stringify-an-es6-map

// Constructor
Map(); // create a new map

// Instance properties
Map.prototype.size(); // -

// Instance method
Map.prototype.clear(); // - Remove all key-value pairs from the Map object.
Map.prototype.delete(); // - Return true if an element in the Map object existed and has been removed, or false if the element does not exist. map.has(key) will return false afterwards.
Map.prototype.get(); // - Return the value associated to the passed key, or undefined if there is none.
Map.prototype.has(); // - Return a boolean indicating wheather a value has been associated with passed key in the Map object or not.
Map.prototype.set(); // - Sets the value for the passed key in the Map object. Return Map object.
Map.prototype[Symbole.iterator()]; // -
Map.prototype.keys(); // - Return a new Iterator object that contains the keys for each element in the Map object i insertion order.
Map.prototype.values(); // - Return a new iterator object that contains the values for each element in the Map object in insertion order.
Map.prototype.entries(); // - Return a new Iterator object that contains a two-member array of [key, value] for each element in the Map object in insertion order.
Map.prototype.forEach(); // - Calls callbackFn once for each key-value pair present in the Map object, in insertion order. If a thisArg paramerter is provided to forEach, it will be used as the this value for each callback.
