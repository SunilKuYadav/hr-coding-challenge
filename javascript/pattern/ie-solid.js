// Single Responsibility Principle (SRP)

// Handles only user data
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }
}

// Handles only cart items
class Cart {
  constructor() {
    this.items = [];
  }

  addItem(product, quantity) {
    this.items.push({ product, quantity });
  }

  getItems() {
    return this.items;
  }
}

// Handles only order processing
class Order {
  constructor(user, cart) {
    this.user = user;
    this.cart = cart;
  }

  getSummary() {
    return {
      user: this.user.name,
      items: this.cart.getItems(),
    };
  }
}

// Open/Closed Principle (OCP)
class Payment {
  pay(amount) {}
}

class CreditCardPayment extends Payment {
  pay(amount) {
    console.log(`Paid ₹${amount} using Credit Card`);
  }
}

class UpiPayment extends Payment {
  pay(amount) {
    console.log(`Paid ₹${amount} using UPI`);
  }
}

function checkout(order, paymentMethod) {
  const totalAmount = order.cart.getItems().length * 100; // demo
  paymentMethod.pay(totalAmount);
}

// Liskov Substitution Principle (LSP)
class Notification {
  send(message, user) {}
}

class EmailNotification extends Notification {
  send(message, user) {
    console.log(`Email sent to ${user.email}: ${message}`);
  }
}

class SMSNotification extends Notification {
  send(message, user) {
    console.log(`SMS sent to ${user.name}: ${message}`);
  }
}

// Both EmailNotification and SMSNotification can replace Notification safely

// Interface Segregation Principle (ISP)
// Instead of one "God Interface" with print/scan/fax
// We split notifications into small, focused interfaces

class IEmailService {
  sendEmail(user, message) {}
}

class ISmsService {
  sendSms(user, message) {}
}

class EmailService extends IEmailService {
  sendEmail(user, message) {
    console.log(`Email: ${message} -> ${user.email}`);
  }
}

class SmsService extends ISmsService {
  sendSms(user, message) {
    console.log(`SMS: ${message} -> ${user.name}`);
  }
}

// Dependency Inversion Principle (DIP)
class Database {
  save(order) {}
}

class MySQLDatabase extends Database {
  save(order) {
    console.log("Order saved in MySQL DB", order.getSummary());
  }
}

class MongoDBDatabase extends Database {
  save(order) {
    console.log("Order saved in MongoDB DB", order.getSummary());
  }
}

class OrderService {
  constructor(database, notification) {
    this.database = database;
    this.notification = notification;
  }

  placeOrder(order) {
    this.database.save(order);
    this.notification.send("Your order has been placed!", order.user);
  }
}

// Setup
const user = new User("Sunil", "sunil@example.com");
const cart = new Cart();
cart.addItem("Laptop", 1);
cart.addItem("Mouse", 2);

const order = new Order(user, cart);

// Payments (OCP)
checkout(order, new CreditCardPayment());
checkout(order, new UpiPayment());

// Place Order (DIP + LSP + ISP)
const db = new MongoDBDatabase();
const notifier = new EmailNotification();
const orderService = new OrderService(db, notifier);

orderService.placeOrder(order);

// 🔑 How SOLID applies here:
// •	SRP: User, Cart, Order, Payment each handle only one thing.
// •	OCP: New payment methods can be added without changing checkout.
// •	LSP: Any Notification subclass works wherever Notification is expected.
// •	ISP: Email & SMS services are separate, no forced unused methods.
// •	DIP: OrderService depends on abstractions (Database, Notification), not concrete implementations.


// User -> Cart: addItem()
// User -> Order: create Order with Cart
// User -> Checkout: initiate payment
// Checkout -> Payment: pay()
// OrderService -> Database: save(order)
// OrderService -> Notification: send("Order Placed")
