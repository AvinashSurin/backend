const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');

class Events {
  constructor() {
    this.eventHandlers = {};
    this.mongoUrl = 'mongodb://your-mongodb-url'; // Replace with your MongoDB connection URL
  }

  // Register an event handler
  on(eventName, callback) {
    if (!this.eventHandlers[eventName]) {
      this.eventHandlers[eventName] = [];
    }
    this.eventHandlers[eventName].push(callback);
  }

  // Trigger all callbacks associated with a given eventName
  trigger(eventName) {
    const eventTime = new Date().toISOString();

    // Log to MongoDB
    MongoClient.connect(this.mongoUrl, (err, client) => {
      if (err) throw err;

      const db = client.db('eventsDb'); // Replace with your MongoDB database name
      const collection = db.collection('events');

      collection.insertOne({ event: eventName, triggerTime: eventTime }, (err) => {
        if (err) throw err;
        client.close();
      });
    });

    // Log to app.log file
    const logMessage = `${eventName} --> ${eventTime}\n`;
    fs.appendFile('app.log', logMessage, (err) => {
      if (err) throw err;
    });

    // Trigger event handlers
    if (this.eventHandlers[eventName]) {
      this.eventHandlers[eventName].forEach(callback => callback());
    }
  }

  // Remove all event handlers associated with the given eventName
  off(eventName) {
    delete this.eventHandlers[eventName];
  }
}

// Example usage
const events = new Events();

// Register event handlers
events.on('click', () => {
  console.log('Click event triggered!');
});

events.on('hover', () => {
  console.log('Hover event triggered!');
});

// Trigger events
events.trigger('click');
events.trigger('hover');
events.trigger('click');

// Remove event handlers
events.off('click');

// Trigger events after removal
events.trigger('click');
events.trigger('hover');
