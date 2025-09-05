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
    this._product =[]
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
  // delegate saveToDataBase (composition)
  saveToDataBase() {
    new SaveToDataBase(this).saveToDataBase();
  }
}

class ShoppingCartInvoice extends ShoppingCart {
  constructor(cart) {
    super()
    this.cart = cart
  }
  printInvoice() {
    console.log("Shopping Card List: ");
    this.cart._product?.forEach((element) => {
      console.log(`${element.name}: ${element.price}`);
    });
  }
}

class SaveToDataBase extends ShoppingCart {
  saveToDataBase() {
    console.log("Saving shopping cart to database....");
  }
}

const cart = new ShoppingCart();

cart.addProduct(new Product("laptop", 3000));
cart.addProduct(new Product("Mouse", 99));

cart.printInvoice();
cart.saveToDataBase();
