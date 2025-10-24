class Car {
  constructor(color) {
    this.color = color;
  }
}

const car1 = new Car("red");
const car2 = new Car("green");

// A singleton ensures that only one instance of a class/object exists throughout the application, and it provides a global access point to that instance.

// Use cases:
// 	•	Database connections
// 	•	Logging services
// 	•	Configuration managers
// 	•	Caching

// Basic Singleton with Class
class Singleton {
  constructor() {
    if (Singleton.instance) {
      return Singleton.instance; // return already created instance
    }

    // initialize property
    this.timestamp = Date.now();

    Singleton.instance = this;
    return this;
  }
}
// Usage
const a = new Singleton();
const b = new Singleton();

console.log(a === b); // true
console.log(a.timestamp, b.timestamp); // same

// Singleton using Closure (Module Pattern)
const Singleton2 = (function () {
  let instance;
  function createdInstance() {
    return { time: Date.now() };
  }
  return {
    getInstance: function () {
      if (!instance) {
        instance = createdInstance();
      }
      return instance;
    },
  };
})();

// Usage
const obj1 = Singleton2.getInstance();
const obj2 = Singleton2.getInstance();

console.log(obj1 === obj2); // true

// Singleton with ES6 Module
class Logger {
  log(msg) {
    console.log(`[LOG]: ${msg}`);
  }
}
const logger = new Logger();
export default logger;

// 🔹 Pros of Singleton
// 	1.	✅ Single point of control – Good for shared resources like DB connection, configuration, cache, logger.
// 	2.	✅ Memory efficient – Only one object in memory.
// 	3.	✅ Global access – Easy to access from anywhere.

// 🔹 Cons of Singleton
// 	1.	❌ Global state – Can lead to hidden dependencies and make debugging harder.
// 	2.	❌ Testing issues – Difficult to mock/replace in unit tests.
// 	3.	❌ Not scalable – In distributed systems, “single instance” doesn’t work across multiple servers.
// 	4.	❌ Tight coupling – Components depend directly on the singleton.

// 🔹 Real-world Examples
// 	•	Logger Service (only one logger needed in app)
// 	•	Configuration Manager (single source of truth for app settings)
// 	•	Database Connection Pool (avoid multiple unnecessary connections)

// Async-Safe Singleton (DB Connection)
class Database {
  constructor() {
    if (Database.instance) {
      return Database.instance;
    }
    this.connected = false;
    Database.instance = this;
  }

  async connect() {
    if (this.connected) {
      return this.connection;
    }

    this.connection = await new Promise((resolve) =>
      setTimeout(() => resolve("✅ Database Connected"), 1000)
    );

    this.connected = true;
    return this.connection;
  }
}

// Singleton factory
let instancePromise = null;
function getDatabaseInstance() {
  if (!instancePromise) {
    const db = new Database();
    instancePromise = db.connect().then(() => db);
  }
  return instancePromise;
}

// Usage
(async () => {
  const [db1, db2] = await Promise.all([
    getDatabaseInstance(),
    getDatabaseInstance(),
  ]);

  console.log(db1 === db2); // true
  console.log(db1.connection); // ✅ Database Connected
})();
