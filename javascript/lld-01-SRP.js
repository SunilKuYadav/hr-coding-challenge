// SOLID
// S: Single Responsibility Principle

class Product {
  constructor(name, price) {
    this.name = name;
    this.price = price;
  }
}

class ShoppingCart {
  constructor() {
    this._product = [];
  }

  addProduct(product) {
    this._product.push(product);
  }

  getProduct() {
    return this._product;
  }

  // 1. Calculate total price
  calculateTotal() {
    return this._product.reduce((acc, curr) => (acc += curr.price), 0);
  }

  // 2. Violating SRP - Print invoice (Should be in a separate class)
  // printInvoice() {
  //   console.log('Shopping Card List: ')
  //   this.#product.forEach(element => {
  //     console.log(`${element.name}: ${element.price}`)
  //   });
  // }

  // delegate printing (composition)
  printInvoice() {
    new ShoppingCartInvoice(this).printInvoice();
  }

  // 3. Violating SRP - Save to DB (Should be in a separate class)
  // saveToDataBase() {
  //   console.log("Saving shopping cart to database....");
  // }

  // delegate saving (composition)
  save(strategy) {
    strategy.save(this);
  }
}

class ShoppingCartInvoice extends ShoppingCart {
  constructor(cart) {
    super();
    this.cart = cart;
  }
  printInvoice() {
    console.log("Shopping Card List: ");
    this.cart._product?.forEach((element) => {
      console.log(`${element.name}: ${element.price}`);
    });
  }
}

// class SaveToDataBase extends ShoppingCart {
//   constructor(){
//     super()
//   }
//   save() {
//     console.log("Saving shopping cart to database....");
//   }

//   // saveToSQLDatabase() {
//   //   console.log("Saving shopping cart to SQL database....");
//   // }
//   // saveToMongoDatabase() {
//   //   console.log("Saving shopping cart to Mongo database....");
//   // }
//   // saveToFile() {
//   //   console.log("Saving shopping cart to file....");
//   // }
// }


// ✅ Base saving strategy (OCP)
class SaveStrategy {
  save(cart) {
    throw new Error("save() must be implemented");
  }
}

// ✅ Extensions (OCP)
class SaveToSQLDatabase extends SaveStrategy {
  save(cart) {
    console.log("Saving shopping cart to SQL database....");
  }
}

class SaveToMongoDatabase extends SaveStrategy {
  save(cart) {
    console.log("Saving shopping cart to Mongo database....");
  }
}

class SaveToFile extends SaveStrategy {
  save(cart) {
    console.log("Saving shopping cart to File....");
  }
}


const cart = new ShoppingCart();

cart.addProduct(new Product("laptop", 3000));
cart.addProduct(new Product("Mouse", 99));

const total = cart.calculateTotal()
cart.printInvoice();
const sqlDB = new SaveToSQLDatabase()
const mongoDB = new SaveToMongoDatabase()
const saveToFile = new SaveToFile()
cart.save(sqlDB);
cart.save(mongoDB);
cart.save(saveToFile);
console.log(total)
