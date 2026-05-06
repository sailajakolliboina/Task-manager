const memoryStore = require('../config/memoryStore');

const projectController = {
  createProject: async (req, res) => {
    try {
      const { title, description } = req.body;

      // Validations
      if (!title) {
        return res.status(400).json({ message: 'Project title is required' });
      }

      const project = await memoryStore.createProject({
        title,
        description,
        ownerId: req.user.id
      });

      res.status(201).json({
        success: true,
        project
      });
    } catch (error) {
      console.error('Create project error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  getProjects: async (req, res) => {
    try {
      const projects = await memoryStore.findProjectsByUser(req.user.id);

      res.json({
        success: true,
        projects
      });
    } catch (error) {
      console.error('Get projects error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  getProjectById: async (req, res) => {
    try {
      const { id } = req.params;

      const project = await memoryStore.findProjectById(id);

      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      res.json({
        success: true,
        project
      });
    } catch (error) {
      console.error('Get project error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  updateProject: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description } = req.body;

      // Validations
      if (!title) {
        return res.status(400).json({ message: 'Project title is required' });
      }

      // Check if user owns the project
      const existingProject = await prisma.project.findFirst({
        where: {
          id,
          ownerId: req.user.id
        }
      });

      if (!existingProject) {
        return res.status(403).json({ message: 'Not authorized to update this project' });
      }

      const project = await prisma.project.update({
        where: { id },
        data: {
          title,
          description
        },
        include: {
          owner: {
            select: { id: true, name: true, email: true }
          },
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true }
              }
            }
          },
          tasks: {
            include: {
              assignedTo: {
                select: { id: true, name: true, email: true }
              }
            }
          }
        }
      });

      res.json({
        success: true,
        project
      });
    } catch (error) {
      console.error('Update project error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  deleteProject: async (req, res) => {
    try {
      const { id } = req.params;

      // Check if user owns the project
      const existingProject = await prisma.project.findFirst({
        where: {
          id,
          ownerId: req.user.id
        }
      });

      if (!existingProject) {
        return res.status(403).json({ message: 'Not authorized to delete this project' });
      }

      await prisma.project.delete({
        where: { id }
      });

      res.json({
        success: true,
        message: 'Project deleted successfully'
      });
    } catch (error) {
      console.error('Delete project error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  addMember: async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      // Validations
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      // Check if user owns the project
      const project = await prisma.project.findFirst({
        where: {
          id,
          ownerId: req.user.id
        }
      });

      if (!project) {
        return res.status(403).json({ message: 'Not authorized to add members to this project' });
      }

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if user is already a member
      const existingMember = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId: id,
            userId
          }
        }
      });

      if (existingMember) {
        return res.status(400).json({ message: 'User is already a member of this project' });
      }

      // Add member
      const member = await prisma.projectMember.create({
        data: {
          projectId: id,
          userId
        },
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        }
      });

      res.status(201).json({
        success: true,
        member
      });
    } catch (error) {
      console.error('Add member error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  removeMember: async (req, res) => {
    try {
      const { id, userId } = req.params;

      // Check if user owns the project
      const project = await prisma.project.findFirst({
        where: {
          id,
          ownerId: req.user.id
        }
      });

      if (!project) {
        return res.status(403).json({ message: 'Not authorized to remove members from this project' });
      }

      // Remove member
      await prisma.projectMember.delete({
        where: {
          projectId_userId: {
            projectId: id,
            userId
          }
        }
      });

      res.json({
        success: true,
        message: 'Member removed successfully'
      });
    } catch (error) {
      console.error('Remove member error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = projectController;
