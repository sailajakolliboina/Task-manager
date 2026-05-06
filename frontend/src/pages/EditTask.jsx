import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

const EditTask = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'PENDING',
    priority: 'MEDIUM',
    dueDate: '',
    assignedToId: ''
  })
  const [projects, setProjects] = useState([])
  const [projectMembers, setProjectMembers] = useState([])
  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await api.get(`/tasks/${id}`)
        const taskData = response.data.task
        setTask(taskData)
        setFormData({
          title: taskData.title,
          description: taskData.description || '',
          status: taskData.status,
          priority: taskData.priority,
          dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString().split('T')[0] : '',
          assignedToId: taskData.assignedToId || ''
        })
      } catch (err) {
        setError('Failed to fetch task')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchTask()
  }, [id])

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get('/projects')
        setProjects(response.data.projects)
      } catch (err) {
        console.error('Failed to fetch projects:', err)
      }
    }

    fetchProjects()
  }, [])

  useEffect(() => {
    const fetchProjectMembers = async () => {
      if (task?.projectId) {
        try {
          const response = await api.get(`/projects/${task.projectId}`)
          const members = [
            response.data.project.owner,
            ...response.data.project.members.map(m => m.user)
          ]
          setProjectMembers(members)
        } catch (err) {
          console.error('Failed to fetch project members:', err)
        }
      }
    }

    fetchProjectMembers()
  }, [task])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    
    try {
      await api.put(`/tasks/${id}`, formData)
      navigate('/tasks')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusUpdate = async (newStatus) => {
    try {
      await api.patch(`/tasks/${id}/status`, { status: newStatus })
      setTask(prev => ({ ...prev, status: newStatus }))
      setFormData(prev => ({ ...prev, status: newStatus }))
    } catch (err) {
      console.error('Failed to update status:', err)
    }
  }

  const canEdit = () => {
    if (!task) return false
    const isOwner = task.createdById === user.id
    const isProjectOwner = task.project?.ownerId === user.id
    return isOwner || isProjectOwner
  }

  const canUpdateStatus = () => {
    if (!task) return false
    const isOwner = task.createdById === user.id
    const isProjectOwner = task.project?.ownerId === user.id
    const isAssigned = task.assignedToId === user.id
    return isOwner || isProjectOwner || isAssigned
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !task) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-red-600 text-center">
            <p className="text-xl font-semibold">Error</p>
            <p>{error || 'Task not found'}</p>
          </div>
        </div>
      </div>
    )
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Task</h1>
          
          {/* Quick Status Update */}
          {canUpdateStatus() && (
            <div className="card mb-6">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Status Update</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleStatusUpdate('PENDING')}
                    className={`btn ${task.status === 'PENDING' ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('IN_PROGRESS')}
                    className={`btn ${task.status === 'IN_PROGRESS' ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('COMPLETED')}
                    className={`btn ${task.status === 'COMPLETED' ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    Completed
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="card">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Task Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  className="input-field mt-1"
                  placeholder="Enter task title"
                  value={formData.title}
                  onChange={handleChange}
                  disabled={!canEdit()}
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  className="input-field mt-1"
                  placeholder="Enter task description"
                  value={formData.description}
                  onChange={handleChange}
                  disabled={!canEdit()}
                />
              </div>

              {canEdit() && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <select
                        id="status"
                        name="status"
                        className="input-field mt-1"
                        value={formData.status}
                        onChange={handleChange}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                        Priority
                      </label>
                      <select
                        id="priority"
                        name="priority"
                        className="input-field mt-1"
                        value={formData.priority}
                        onChange={handleChange}
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="assignedToId" className="block text-sm font-medium text-gray-700">
                        Assigned To
                      </label>
                      <select
                        id="assignedToId"
                        name="assignedToId"
                        className="input-field mt-1"
                        value={formData.assignedToId}
                        onChange={handleChange}
                      >
                        <option value="">Unassigned</option>
                        {projectMembers.map(member => (
                          <option key={member.id} value={member.id}>
                            {member.name} ({member.email})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                        Due Date
                      </label>
                      <input
                        type="date"
                        id="dueDate"
                        name="dueDate"
                        min={today}
                        className="input-field mt-1"
                        value={formData.dueDate}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Task Info */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Task Information</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>Project: {task.project?.title}</p>
                  <p>Created by: {task.createdBy?.name}</p>
                  <p>Created: {new Date(task.createdAt).toLocaleDateString()}</p>
                  <p>Last updated: {new Date(task.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}

              {canEdit() && (
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate('/tasks')}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary"
                  >
                    {isSubmitting ? 'Updating...' : 'Update Task'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditTask
