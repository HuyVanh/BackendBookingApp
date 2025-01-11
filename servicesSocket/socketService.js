// socketService.js
class SocketService {
  constructor(io) {
    this.io = io;
    this.userSockets = new Map();
    this.setupSocketEvents();
  }

  setupSocketEvents() {
    this.io.on('connection', (socket) => {
      console.log('New client connected:', socket.id);

      socket.on('join_chat', (data) => {
        const { room, userId } = data;
        console.log('User joining room:', { userId, room, socketId: socket.id });
        socket.join(room);
        // Emit back to confirm room joined
        socket.emit('room_joined', { room, success: true });
      });

      socket.on('send_message', (message) => {
        console.log('Received message:', message);
        // Broadcast to all clients in the room INCLUDING sender
        this.io.to(message.room).emit('new_message', message);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        if (socket.userId) {
          this.userSockets.delete(socket.userId);
        }
      });
    });
  }
}

module.exports = SocketService;