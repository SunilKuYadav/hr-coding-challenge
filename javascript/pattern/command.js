// Command Pattern

// => With the Command Pattern we can DECOUPLE objects that execute a certain task from the object that call the method

// class OrderManager {
//   constructor() {
//     this.orders = [];
//   }

//   placeOrder(order, id) {
//     this.orders.push(id);
//     return `You have successfully ordered ${order} (${id})`;
//   }

//   trackOrder(id) {
//     return `Your order ${id} will arrive in 20 minutes.`;
//   }

//   cancelOrder(id) {
//     this.orders = this.orders.filter((order) => order.id !== id);
//     return `You have canceled your order ${id}`;
//   }
// }

// const manager = new OrderManager();

// const placeOrder = manager.placeOrder("Pad Thai", "1234");
// const trackOrder = manager.trackOrder("1234");
// const cancelOrder = manager.cancelOrder("1234");

// console.log(placeOrder, "\n", trackOrder, "\n", cancelOrder);

class OrderManager {
  constructor() {
    this.order = [];
  }

  execute(command, ...args) {
    command.execute(this.order, ...args);
  }
}

class Command {
  constructor(execute) {
    this.execute = execute;
  }
}
function PlaceOrderCommand(order, id) {
  return new Command((orders) => {
    orders.push(id);
    console.log(`You have successfully ordered ${order} (${id})`);
  });
}

function CancelOrderCommand(id) {
  return new Command((orders) => {
    orders = orders.filter((order) => order.id !== id);
    console.log(`You have canceled your order ${id}`);
  });
}

function TrackOrderCommand(id) {
  return new Command(() =>
    console.log(`Your order ${id} will arrive in 20 minutes.`)
  );
}

const manager = new OrderManager();

manager.execute(new PlaceOrderCommand("Pad Thai", "1234"));
manager.execute(new TrackOrderCommand("1234"));
manager.execute(new CancelOrderCommand("1234"));


// Pros
// The command pattern allows us to decouple methods from the object that executes the operation. It gives you more control if you’re dealing with commands that have a certain lifespan, or commands that should be queued and executed at specific times.

// Cons
// The use cases for the command pattern are quite limited, and often adds unnecessary boilerplate to an application.

