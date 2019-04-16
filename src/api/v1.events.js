'use strict';

const events = io => {
  /*** LIST OF ROOMS, USERNAMES WITH CORRESPONDING SOCKET IDS ***/
  const users = {};

  /*** SERVER EVENT HANDLERS ***/
  io.on('connection', socket => {
    console.log(`Socket connected with id ${socket.id}...`);
    // A regular chat message
    socket.on('chat', payload => {
      socket.to(payload.room).emit('chat-io', payload);
    });

    // A user requests details
    socket.on('details', user => {
      const { socketId, username } = user;
      const usersList = Object.keys(users);
      const usersNum = usersList.length;
      const usersDisplay = usersList.filter(name => name !== username);
      const room = user.room;
      const payload = { room, socketId, username, usersDisplay, usersNum };
      io.to(socketId).emit('details-io', payload);
    });

    // A user disconnects
    // This event actually kills the socket
    socket.on('disconnect', () => {
      console.log('Disconnecting user:', socket.id);
    });

    // A user disconnects
    // This event sends a disconnection message back to the client
    socket.on('disconnect-start', user => {
      socket.to(user.room).emit('disconnect-io', user);
      // Case insensitive update
      const lowercased = user.username.toLowerCase();
      delete users[lowercased];
    });

    // A user sends an emote
    socket.on('emote', payload => {
      socket.to(payload.room).emit('emote-io', payload.message);
    });

    // Duplicate username check before login
    // Check should be case insensitive
    socket.on('is-duplicate', username => {
      const lowercased = username.toLowerCase();
      const response = users[lowercased] ? true : false;
      io.to(socket.id).emit('is-duplicate-io', response);
    });

    // A user leaves a room and returns to the lobby
    socket.on('leave', payload => {
      // Leave a room and announce
      socket.leave(payload.room);
      io.to(payload.room).emit('room-leave-io', payload);
      // Join another and announce
      socket.join('lobby');
      socket.to(payload.newRoom).emit('room-join-io', payload);
      // Update the user object
      io.to(socket.id).emit('room-join-update-io', payload.room);
      // TODO: If a user is in the lobby, they can't leave
    });

    // A user logs in
    socket.on('login', payload => {
      const { id } = socket;
      const room = 'lobby';
      const { username } = payload;
      // Store the username in lowercase
      const lowercased = username.toLowerCase();
      users[lowercased] = id;
      // Join the lobby
      socket.join(room);
      // Announce the login to the room
      socket.to(room).emit('login-io', payload);
      // Update the new user object with the socketId
      const update = { id, room };
      io.to(id).emit('login-update-io', update);
    });

    // A user tries to update their username
    socket.on('nick', payload => {
      const { id } = socket;
      const { oldNick, newNick } = payload;
      // Case insensitive
      const lowercasedOldNick = oldNick.toLowerCase();
      const lowercasedNewNick = newNick.toLowerCase();
      if (!users[lowercasedNewNick]) {
        users[lowercasedNewNick] = id;
        delete users[lowercasedOldNick];
        // Send an update event to the user
        io.to(id).emit('nick-update-io', { username: newNick });
        // Announce to everyone else
        socket.to(payload.room).emit('nick-io', { message: payload.message });
      } else {
        // No duplicates allowed
        io.to(id).emit('nick-update-failed-io');
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

    // A user wants to join a different room
    socket.on('room', payload => {
      // Announce the user's departure
      socket.to(payload.room).emit('room-leave-io', payload);
      socket.leave(payload.room);
      // Announce the user
      socket.join(payload.newRoom);
      socket.to(payload.newRoom).emit('room-join-io', payload);
      // Update the user's information
      io.to(payload.user.socketId).emit('room-join-update-io', payload);
      // TODO: If a room already exists, the user gets an error.
      // They should use the `join` command to join an existing room.
    });
  });
};

module.exports = events;
