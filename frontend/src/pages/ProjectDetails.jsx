import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import TaskCard from '../components/TaskCard'
import { useAuth } from '../context/AuthContext'

const ProjectDetails = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await api.get(`/projects/${id}`)
        setProject(response.data.project)
      } catch (err) {
        setError('Failed to fetch project details')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [id])

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

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-xl font-semibold">Project not found</p>
            <Link to="/projects" className="btn btn-primary mt-4">
              Back to Projects
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const isOwner = project.owner.id === user.id
  const isAdmin = user.role === 'ADMIN'

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
              <p className="text-gray-600 mt-2">{project.description}</p>
              <div className="mt-4 flex items-center space-x-4">
                <p className="text-sm text-gray-500">
                  Owner: {project.owner.name}
                </p>
                <p className="text-sm text-gray-500">
                  Created: {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              {(isOwner || isAdmin) && (
                <>
                  <Link 
                    to={`/projects/${project.id}/edit`}
                    className="btn btn-secondary"
                  >
                    Edit Project
                  </Link>
                  <Link 
                    to={`/tasks/create?projectId=${project.id}`}
                    className="btn btn-primary"
                  >
                    Create Task
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Project Info */}
          <div className="lg:col-span-1">
            <div className="card mb-6">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Project Info</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Owner</p>
                    <p className="text-gray-900">{project.owner.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Created</p>
                    <p className="text-gray-900">{new Date(project.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Last Updated</p>
                    <p className="text-gray-900">{new Date(project.updatedAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Tasks</p>
                    <p className="text-gray-900">{project.tasks.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Members */}
            <div className="card">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Members</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{project.owner.name}</p>
                      <p className="text-sm text-gray-500">Owner</p>
                    </div>
                    <span className="badge badge-low">ADMIN</span>
                  </div>
                  {project.members.map(member => (
                    <div key={member.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{member.user.name}</p>
                        <p className="text-sm text-gray-500">{member.user.email}</p>
                      </div>
                      <span className="badge badge-low">MEMBER</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tasks */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-medium text-gray-900">Tasks</h2>
                  {(isOwner || isAdmin) && (
                    <Link 
                      to={`/tasks/create?projectId=${project.id}`}
                      className="btn btn-primary"
                    >
                      Create Task
                    </Link>
                  )}
                </div>

                {project.tasks.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No tasks yet</p>
                    {(isOwner || isAdmin) && (
                      <Link 
                        to={`/tasks/create?projectId=${project.id}`}
                        className="btn btn-primary mt-4"
                      >
                        Create First Task
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {project.tasks.map(task => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectDetails
