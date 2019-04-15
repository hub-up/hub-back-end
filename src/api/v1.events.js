'use strict';

const events = io => {
  /*** LIST OF USERNAMES WITH CORRESPONDING SOCKET IDS ***/
  const users = {};

  /*** SERVER EVENT HANDLERS ***/
  io.on('connection', socket => {
    console.log(`Socket connected with id ${socket.id}...`);

    // A regular chat message
    socket.on('chat', payload => {
      socket.broadcast.emit('chat-io', payload);
    });

    // A user requests details
    socket.on('details', user => {
      const { socketId, username } = user;
      const usersList = Object.keys(users);
      const usersNum = usersList.length;
      const usersDisplay = usersList.filter(name => name !== username);
      const namespace = null;
      const payload = { namespace, socketId, username, usersDisplay, usersNum };
      io.to(socketId).emit('details-io', payload);
    });

    // A user disconnects
    // This event actually kills the socket
    socket.on('disconnect', () => {});

    // A user disconnects
    // This event sends a disconnection message back to the client
    socket.on('disconnect-start', payload => {
      delete users[payload.username];
      socket.broadcast.emit('disconnect-io', payload);
    });

    // A user sends an emote
    socket.on('emote', payload => {
      socket.broadcast.emit('emote-io', payload.message);
    });

    // A user logs in
    socket.on('login', payload => {
      const { id } = socket;
      const { username } = payload;
      users[username] = id;
      // Announce the login
      socket.broadcast.emit('login-io', payload);
      // Update the new user object with the socketId
      io.to(id).emit('login-update-io', id);
    });

    // A user tries to update their username
    socket.on('nick', payload => {
      const { oldNick, newNick } = payload;
      const { id } = socket;
      if (!users[newNick]) {
        users[newNick] = id;
        delete users[oldNick];
        // Send an update event to the user
        io.to(id).emit('nick-update-io', { username: newNick });
        // Announce to everyone else
        socket.broadcast.emit('nick-io', { message: payload.message });
      } else {
        // No duplicates allowed
        io.to(id).emit('nick-update-failed-io', { username: newNick });
      }
    });

    // A user sends a private message to another user
    socket.on('private', payload => {
      const { to } = payload;
      const recipient_id = users[to];
      if (recipient_id) {
        io.to(recipient_id).emit('private-io', payload);
      } else {
        // TODO
        console.log('SEND AN ERROR MESSAGE TO THE SENDER');
      }
    });
  });
};

module.exports = events;
