import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import TaskCard from '../components/TaskCard'
import { useAuth } from '../context/AuthContext'

const Tasks = () => {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    projectId: searchParams.get('projectId') || '',
    status: searchParams.get('status') || '',
    assignedTo: searchParams.get('assignedTo') || ''
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch tasks
        const tasksResponse = await api.get('/tasks', { params: filters })
        setTasks(tasksResponse.data.tasks)

        // Fetch projects for filter dropdown
        const projectsResponse = await api.get('/projects')
        setProjects(projectsResponse.data.projects)
      } catch (err) {
        setError('Failed to fetch tasks')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [filters])

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    
    // Update URL params
    const params = new URLSearchParams()
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v)
    })
    setSearchParams(params)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'badge-pending'
      case 'IN_PROGRESS':
        return 'badge-in-progress'
      case 'COMPLETED':
        return 'badge-completed'
      default:
        return 'badge-low'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'LOW':
        return 'badge-low'
      case 'MEDIUM':
        return 'badge-medium'
      case 'HIGH':
        return 'badge-high'
      default:
        return 'badge-low'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-red-600 text-center">
            <p className="text-xl font-semibold">Error</p>
            <p>{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <Link to="/tasks/create" className="btn btn-primary">
            Create Task
          </Link>
        </div>

        {/* Filters */}
        <div className="card mb-8">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Filters</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="projectId" className="block text-sm font-medium text-gray-700">
                  Project
                </label>
                <select
                  id="projectId"
                  className="input-field mt-1"
                  value={filters.projectId}
                  onChange={(e) => handleFilterChange('projectId', e.target.value)}
                >
                  <option value="">All Projects</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="status"
                  className="input-field mt-1"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">
                  Assigned To
                </label>
                <select
                  id="assignedTo"
                  className="input-field mt-1"
                  value={filters.assignedTo}
                  onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
                >
                  <option value="">All Users</option>
                  <option value={user.id}>Me</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        {tasks.length === 0 ? (
          <div className="card text-center p-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600 mb-4">
              {Object.values(filters).some(v => v) 
                ? 'Try adjusting your filters or create a new task.'
                : 'Create your first task to get started.'
              }
            </p>
            <Link to="/tasks/create" className="btn btn-primary">
              Create Task
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Tasks
