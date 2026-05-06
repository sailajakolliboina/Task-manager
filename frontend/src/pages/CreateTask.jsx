import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

const CreateTask = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: '',
    projectId: searchParams.get('projectId') || '',
    assignedToId: ''
  })
  const [projects, setProjects] = useState([])
  const [projectMembers, setProjectMembers] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get('/projects')
        setProjects(response.data.projects)
      } catch (err) {
        setError('Failed to fetch projects')
        console.error(err)
      }
    }

    fetchProjects()
  }, [])

  useEffect(() => {
    const fetchProjectMembers = async () => {
      if (formData.projectId) {
        try {
          const response = await api.get(`/projects/${formData.projectId}`)
          const members = [
            response.data.project.owner,
            ...response.data.project.members.map(m => m.user)
          ]
          setProjectMembers(members)
        } catch (err) {
          console.error('Failed to fetch project members:', err)
        }
      } else {
        setProjectMembers([])
      }
    }

    fetchProjectMembers()
  }, [formData.projectId])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      await api.post('/tasks', formData)
      navigate('/tasks')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task')
    } finally {
      setLoading(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Create Task</h1>
          
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
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="projectId" className="block text-sm font-medium text-gray-700">
                    Project *
                  </label>
                  <select
                    id="projectId"
                    name="projectId"
                    required
                    className="input-field mt-1"
                    value={formData.projectId}
                    onChange={handleChange}
                  >
                    <option value="">Select a project</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.title}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="assignedToId" className="block text-sm font-medium text-gray-700">
                    Assigned To *
                  </label>
                  <select
                    id="assignedToId"
                    name="assignedToId"
                    required
                    className="input-field mt-1"
                    value={formData.assignedToId}
                    onChange={handleChange}
                    disabled={!formData.projectId}
                  >
                    <option value="">Select a user</option>
                    {projectMembers.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.name} ({member.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}

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
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateTask
