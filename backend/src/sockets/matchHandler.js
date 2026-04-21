/**
 * Socket.IO match handler.
 * Manages real-time room subscriptions for live match scoring.
 */

const setupMatchSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    /**
     * Client joins a match room to receive live updates.
     * Usage: socket.emit('join_match', { matchId: '...' })
     */
    socket.on('join_match', ({ matchId }) => {
      if (!matchId) {
        return socket.emit('error', { message: 'matchId is required' });
      }

      const room = `match_${matchId}`;
      socket.join(room);
      console.log(`📺 Socket ${socket.id} joined room: ${room}`);

      socket.emit('joined', {
        message: `Subscribed to match ${matchId}`,
        room,
      });
    });

    /**
     * Client leaves a match room.
     * Usage: socket.emit('leave_match', { matchId: '...' })
     */
    socket.on('leave_match', ({ matchId }) => {
      if (!matchId) return;

      const room = `match_${matchId}`;
      socket.leave(room);
      console.log(`🚪 Socket ${socket.id} left room: ${room}`);
    });

    /**
     * Get the number of viewers in a match room.
     */
    socket.on('get_viewers', async ({ matchId }) => {
      if (!matchId) return;

      const room = `match_${matchId}`;
      const sockets = await io.in(room).fetchSockets();
      socket.emit('viewers_count', {
        matchId,
        count: sockets.length,
      });
    });

    /**
     * Handle disconnect — cleanup logging.
     */
    socket.on('disconnect', (reason) => {
      console.log(`❌ Socket disconnected: ${socket.id} (${reason})`);
    });

    /**
     * Handle errors.
     */
    socket.on('error', (error) => {
      console.error(`⚠️ Socket error for ${socket.id}:`, error.message);
    });
  });

  console.log('✅ Socket.IO match handler initialized');
};

module.exports = setupMatchSocket;
