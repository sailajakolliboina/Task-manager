const memoryStore = require('../config/memoryStore');

const taskController = {
  createTask: async (req, res) => {
    try {
      const { title, description, priority = 'MEDIUM', dueDate, projectId, assignedToId } = req.body;

      // Validations
      if (!title) {
        return res.status(400).json({ message: 'Task title is required' });
      }

      if (!projectId) {
        return res.status(400).json({ message: 'Project is required' });
      }

      if (!assignedToId) {
        return res.status(400).json({ message: 'Assigned user is required' });
      }

      if (dueDate && new Date(dueDate) < new Date()) {
        return res.status(400).json({ message: 'Due date must be in the future' });
      }

      // Check if user has access to the project
      const project = await memoryStore.findProjectById(projectId);
      if (!project || (project.ownerId !== req.user.id && !await memoryStore.getProjectMembers(projectId).some(pm => pm.userId === req.user.id))) {
        return res.status(403).json({ message: 'Not authorized to create tasks in this project' });
      }

      // Check if assigned user has access to the project
      const assignedUser = await memoryStore.findUserById(assignedToId);
      if (!assignedUser || (assignedUser.id !== project.ownerId && !await memoryStore.getProjectMembers(projectId).some(pm => pm.userId === assignedUser.id))) {
        return res.status(400).json({ message: 'Assigned user is not a member of this project' });
      }

      const task = await memoryStore.createTask({
        title,
        description,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        assignedToId,
        createdById: req.user.id
      });

      res.status(201).json({
        success: true,
        task
      });
    } catch (error) {
      console.error('Create task error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  getTasks: async (req, res) => {
    try {
      const { projectId, status, assignedTo } = req.query;

      // Get tasks from in-memory storage
      let tasks = await memoryStore.findTasksByUser(req.user.id);

      // Filter by project if specified
      if (projectId) {
        // Check if user has access to the project
        const project = await memoryStore.findProjectById(projectId);
        if (!project || (project.ownerId !== req.user.id && !await memoryStore.getProjectMembers(projectId).some(pm => pm.userId === req.user.id))) {
          return res.status(403).json({ message: 'Not authorized to view tasks in this project' });
        }
        tasks = tasks.filter(task => task.projectId === projectId);
      }

      // Filter by status if specified
      if (status) {
        tasks = tasks.filter(task => task.status === status);
      }

      // Filter by assigned user if specified
      if (assignedTo) {
        tasks = tasks.filter(task => task.assignedToId === assignedTo);
      } else if (!projectId) {
        // If no specific project, only show tasks assigned to current user or created by current user
        tasks = tasks.filter(task => task.assignedToId === req.user.id || task.createdById === req.user.id);
      }

      res.json({
        success: true,
        tasks
      });
    } catch (error) {
      console.error('Get tasks error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  getTaskById: async (req, res) => {
    try {
      const { id } = req.params;

      const task = await prisma.task.findFirst({
        where: {
          id,
          project: {
            OR: [
              { ownerId: req.user.id },
              {
                members: {
                  some: {
                    userId: req.user.id
                  }
                }
              }
            ]
          }
        },
        include: {
          project: {
            select: { id: true, title: true }
          },
          assignedTo: {
            select: { id: true, name: true, email: true }
          },
          createdBy: {
            select: { id: true, name: true, email: true }
          }
        }
      });

      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      res.json({
        success: true,
        task
      });
    } catch (error) {
      console.error('Get task error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  updateTask: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, status, priority, dueDate, assignedToId } = req.body;

      // Check if user has access to the task
      const existingTask = await prisma.task.findFirst({
        where: {
          id,
          project: {
            OR: [
              { ownerId: req.user.id },
              {
                members: {
                  some: {
                    userId: req.user.id
                  }
                }
              }
            ]
          }
        }
      });

      if (!existingTask) {
        return res.status(404).json({ message: 'Task not found' });
      }

      // Check permissions
      const isOwner = existingTask.createdById === req.user.id;
      const isProjectOwner = existingTask.project.ownerId === req.user.id;
      const isAssigned = existingTask.assignedToId === req.user.id;

      // Only owners, project owners, or assigned users can update status
      if (status && !isOwner && !isProjectOwner && !isAssigned) {
        return res.status(403).json({ message: 'Not authorized to update this task' });
      }

      // Only owners or project owners can update other fields
      if ((title || description || priority || dueDate || assignedToId) && !isOwner && !isProjectOwner) {
        return res.status(403).json({ message: 'Not authorized to update task details' });
      }

      // Validate status
      if (status && !['PENDING', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
        return res.status(400).json({ message: 'Status must be PENDING, IN_PROGRESS, or COMPLETED' });
      }

      // Validate priority
      if (priority && !['LOW', 'MEDIUM', 'HIGH'].includes(priority)) {
        return res.status(400).json({ message: 'Priority must be LOW, MEDIUM, or HIGH' });
      }

      // Validate assigned user if provided
      if (assignedToId) {
        const assignedUser = await prisma.user.findFirst({
          where: {
            id: assignedToId,
            OR: [
              { id: existingTask.project.ownerId },
              {
                projectMembers: {
                  some: {
                    projectId: existingTask.projectId
                  }
                }
              }
            ]
          }
        });

        if (!assignedUser) {
          return res.status(400).json({ message: 'Assigned user is not a member of this project' });
        }
      }

      const updateData = {};
      if (title) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (status) updateData.status = status;
      if (priority) updateData.priority = priority;
      if (dueDate) updateData.dueDate = new Date(dueDate);
      if (assignedToId) updateData.assignedToId = assignedToId;

      const task = await prisma.task.update({
        where: { id },
        data: updateData,
        include: {
          project: {
            select: { id: true, title: true }
          },
          assignedTo: {
            select: { id: true, name: true, email: true }
          },
          createdBy: {
            select: { id: true, name: true, email: true }
          }
        }
      });

      res.json({
        success: true,
        task
      });
    } catch (error) {
      console.error('Update task error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  updateTaskStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Validations
      if (!status) {
        return res.status(400).json({ message: 'Status is required' });
      }

      if (!['PENDING', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
        return res.status(400).json({ message: 'Status must be PENDING, IN_PROGRESS, or COMPLETED' });
      }

      // Check if user has access to the task
      const existingTask = await prisma.task.findFirst({
        where: {
          id,
          project: {
            OR: [
              { ownerId: req.user.id },
              {
                members: {
                  some: {
                    userId: req.user.id
                  }
                }
              }
            ]
          }
        }
      });

      if (!existingTask) {
        return res.status(404).json({ message: 'Task not found' });
      }

      // Check permissions (assigned users can update status)
      const isOwner = existingTask.createdById === req.user.id;
      const isProjectOwner = existingTask.project.ownerId === req.user.id;
      const isAssigned = existingTask.assignedToId === req.user.id;

      if (!isOwner && !isProjectOwner && !isAssigned) {
        return res.status(403).json({ message: 'Not authorized to update this task' });
      }

      const task = await prisma.task.update({
        where: { id },
        data: { status },
        include: {
          project: {
            select: { id: true, title: true }
          },
          assignedTo: {
            select: { id: true, name: true, email: true }
          },
          createdBy: {
            select: { id: true, name: true, email: true }
          }
        }
      });

      res.json({
        success: true,
        task
      });
    } catch (error) {
      console.error('Update task status error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  deleteTask: async (req, res) => {
    try {
      const { id } = req.params;

      // Check if user owns the task or is project owner
      const existingTask = await prisma.task.findFirst({
        where: {
          id,
          OR: [
            { createdById: req.user.id },
            {
              project: {
                ownerId: req.user.id
              }
            }
          ]
        }
      });

      if (!existingTask) {
        return res.status(404).json({ message: 'Task not found or not authorized' });
      }

      await prisma.task.delete({
        where: { id }
      });

      res.json({
        success: true,
        message: 'Task deleted successfully'
      });
    } catch (error) {
      console.error('Delete task error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = taskController;
