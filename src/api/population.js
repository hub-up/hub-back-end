'use strict';

class Population {
  constructor() {
    // { username: socketId, username: socketId }
    this.users = {};
    // { roomName: { leader: socketId, users: [{ username: socketId }, { username: socketId }] } }
    this.rooms = {};
  }
  // Add a user to a users list with their socketId
  addUser(username, socketId) {
    this.users.username = socketId;
  }
  // Add a user to a room; if the room doesn't exist,
  // create it and indicate the leader
  // If the user is already in the room, do nothing.
  populateRoom(username, room) {
    const socketId = this.users[username];
    const user = { username, socketId };
    // If the room already exists
    if (this.rooms[room]) {
      this.rooms[room].users.push(user);
      // If the room doesn't exist
    } else {
      this.rooms[room] = { leader: socketId, users: [] };
      this.rooms[room].users.push(user);
    }
  }

  // Delete user and socketId from users list
  deleteUser(username) {
    delete this.users[username];
  }
  // Remove a user from a room. If the room becomes empty,
  // delete it. If the leader leaves, assign the `leader` property
  // to the person who's been there longest
  // If the user is not in the room, do nothing.
  // If the room does not exist, do nothing.
  depopulateRoom(username, room) {
    if (this.rooms[room]) {
      // Are we removing the leader?
      const leader = username === this.rooms[room].leader ? true : false;
      const index = this.rooms[room].users.findIndex(
        userObject => userObject.username === username
      );
      this.rooms[room].users.splice(index, 1);
      // If the room is empty
      if (this.rooms[room].users.length === 0) {
        // delete it
        delete this.rooms[room];
        // Otherwise if the username removed was the leader
      } else if (leader) {
        // reassign the leader property to the socketId of
        // the person who's been in the room the longest (first in the array)
        this.rooms[room].leader = this.rooms[room].users[0].socketId;
      }
    }
  }
  // Remove a user from a room. If the room becomes empty,
  // delete it, preserving the leader property
  // Add the user to a different room. If the room doesn't exist,
  // create it and assigne the leader
  moveUser(username, oldRoom, newRoom) {
    this.depopulateRoom(username, oldRoom);
    this.populateRoom(username, newRoom);
  }
  // Return an object that contains the following:
  // The total number of users.
  // The total number of rooms.
  // The name of each room.
  // The names of users in each room.
  // The number of users in each room.
  details() {
    const roomNames = Object.keys(this.rooms);
    const totalRooms = roomNames.length;
    const totalUsers = Object.keys(this.users).length;
    const userCountPerRoom = {};
    const usernamesPerRoom = {};

    // Populate the two empty objects
    roomNames.forEach(room => {
      usernamesPerRoom[room] = this.rooms[room].users;
      userCountPerRoom[room] = this.rooms[room].length;
    });
    return { roomNames, totalRooms, totalUsers, userCountPerRoom, usernamesPerRoom };
  }
}

module.exports = new Population();
