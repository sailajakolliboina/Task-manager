// Temporary in-memory storage for development
class MemoryStore {
  constructor() {
    this.users = [];
    this.projects = [];
    this.projectMembers = [];
    this.tasks = [];
    this.nextId = 1;
  }

  generateId() {
    return (this.nextId++).toString();
  }

  // User operations
  async createUser(userData) {
    const user = {
      id: this.generateId(),
      ...userData,
      createdAt: new Date()
    };
    this.users.push(user);
    return user;
  }

  async findUserByEmail(email) {
    console.log('🔍 MemoryStore: Looking for user with email:', email);
    console.log('🔍 MemoryStore: Total users stored:', this.users.length);
    const user = this.users.find(user => user.email === email);
    console.log('🔍 MemoryStore: User found:', !!user);
    if (user) {
      console.log('🔍 MemoryStore: Found user details:', { 
        id: user.id, 
        email: user.email, 
        passwordLength: user.password?.length,
        createdAt: user.createdAt 
      });
    }
    return user;
  }

  async findUserById(id) {
    return this.users.find(user => user.id === id);
  }

  async updateUser(id, updateData) {
    const index = this.users.findIndex(user => user.id === id);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...updateData };
      return this.users[index];
    }
    return null;
  }

  // Project operations
  async createProject(projectData) {
    const project = {
      id: this.generateId(),
      ...projectData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.projects.push(project);
    return project;
  }

  async findProjectById(id) {
    return this.projects.find(project => project.id === id);
  }

  async findProjectsByUser(userId) {
    // Find projects where user is owner or member
    const ownedProjects = this.projects.filter(p => p.ownerId === userId);
    const memberProjects = this.projects.filter(p => 
      this.projectMembers.some(pm => pm.projectId === p.id && pm.userId === userId)
    );
    return [...ownedProjects, ...memberProjects];
  }

  async updateProject(id, updateData) {
    const index = this.projects.findIndex(project => project.id === id);
    if (index !== -1) {
      this.projects[index] = { ...this.projects[index], ...updateData, updatedAt: new Date() };
      return this.projects[index];
    }
    return null;
  }

  async deleteProject(id) {
    const index = this.projects.findIndex(project => project.id === id);
    if (index !== -1) {
      this.projects.splice(index, 1);
      // Also delete related data
      this.projectMembers = this.projectMembers.filter(pm => pm.projectId !== id);
      this.tasks = this.tasks.filter(task => task.projectId !== id);
      return true;
    }
    return false;
  }

  // Project Member operations
  async addProjectMember(memberData) {
    const member = {
      id: this.generateId(),
      ...memberData,
      createdAt: new Date()
    };
    this.projectMembers.push(member);
    return member;
  }

  async removeProjectMember(projectId, userId) {
    const index = this.projectMembers.findIndex(
      pm => pm.projectId === projectId && pm.userId === userId
    );
    if (index !== -1) {
      this.projectMembers.splice(index, 1);
      return true;
    }
    return false;
  }

  async getProjectMembers(projectId) {
    return this.projectMembers.filter(pm => pm.projectId === projectId);
  }

  // Task operations
  async createTask(taskData) {
    const task = {
      id: this.generateId(),
      ...taskData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.tasks.push(task);
    return task;
  }

  async findTaskById(id) {
    return this.tasks.find(task => task.id === id);
  }

  async findTasksByUser(userId) {
    // Find tasks assigned to user or created by user
    const assignedTasks = this.tasks.filter(t => t.assignedToId === userId);
    const createdTasks = this.tasks.filter(t => t.createdById === userId);
    return [...assignedTasks, ...createdTasks];
  }

  async findTasksByProject(projectId) {
    return this.tasks.filter(task => task.projectId === projectId);
  }

  async updateTask(id, updateData) {
    const index = this.tasks.findIndex(task => task.id === id);
    if (index !== -1) {
      this.tasks[index] = { ...this.tasks[index], ...updateData, updatedAt: new Date() };
      return this.tasks[index];
    }
    return null;
  }

  async deleteTask(id) {
    const index = this.tasks.findIndex(task => task.id === id);
    if (index !== -1) {
      this.tasks.splice(index, 1);
      return true;
    }
    return false;
  }

  // Dashboard operations
  async getDashboardStats(userId) {
    const userProjects = await this.findProjectsByUser(userId);
    const projectIds = userProjects.map(p => p.id);
    
    const projectTasks = this.tasks.filter(task => projectIds.includes(task.projectId));
    
    const totalProjects = userProjects.length;
    const totalTasks = projectTasks.length;
    const pendingTasks = projectTasks.filter(t => t.status === 'PENDING').length;
    const inProgressTasks = projectTasks.filter(t => t.status === 'IN_PROGRESS').length;
    const completedTasks = projectTasks.filter(t => t.status === 'COMPLETED').length;
    
    // Calculate overdue tasks
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const overdueTasks = projectTasks.filter(task => 
      task.dueDate && 
      new Date(task.dueDate) < today && 
      task.status !== 'COMPLETED'
    ).length;

    const recentTasks = projectTasks
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    // Get upcoming due tasks (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const upcomingDueTasks = projectTasks
      .filter(task => 
        task.dueDate && 
        new Date(task.dueDate) >= today && 
        new Date(task.dueDate) <= nextWeek && 
        task.status !== 'COMPLETED'
      )
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);

    return {
      totalProjects,
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks,
      recentTasks,
      upcomingDueTasks
    };
  }
}

module.exports = new MemoryStore();
