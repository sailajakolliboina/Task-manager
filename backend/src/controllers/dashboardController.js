const memoryStore = require('../config/memoryStore');

const dashboardController = {
  getStats: async (req, res) => {
    try {
      const userId = req.user.id;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const stats = await memoryStore.getDashboardStats(userId);

      res.json({
        success: true,
        stats: {
          totalProjects: stats.totalProjects,
          totalTasks: stats.totalTasks,
          pendingTasks: stats.pendingTasks,
          inProgressTasks: stats.inProgressTasks,
          completedTasks: stats.completedTasks,
          overdueTasks: stats.overdueTasks
        },
        recentTasks: stats.recentTasks,
        tasksByStatus: {},
        tasksByPriority: {},
        upcomingDueTasks: stats.upcomingDueTasks
      });
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = dashboardController;
