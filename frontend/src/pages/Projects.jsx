import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

const Projects = () => {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get('/projects')
        setProjects(response.data.projects)
      } catch (err) {
        setError('Failed to fetch projects')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

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
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          {user?.role === 'ADMIN' && (
            <Link to="/projects/create" className="btn btn-primary">
              Create Project
            </Link>
          )}
        </div>

        {projects.length === 0 ? (
          <div className="card text-center p-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-600 mb-4">
              {user?.role === 'ADMIN' 
                ? 'Create your first project to get started.'
                : 'You haven\'t been added to any projects yet.'
              }
            </p>
            {user?.role === 'ADMIN' && (
              <Link to="/projects/create" className="btn btn-primary">
                Create Project
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <div key={project.id} className="card">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                    <span className="badge badge-low">
                      {project._count?.tasks || 0} tasks
                    </span>
                  </div>
                  
                  {project.description && (
                    <p className="text-gray-600 mb-4">{project.description}</p>
                  )}
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Owner: {project.owner.name}</p>
                    <p className="text-sm text-gray-500">
                      Members: {project.members.length + 1} (including owner)
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <Link 
                      to={`/projects/${project.id}`}
                      className="btn btn-primary"
                    >
                      View Details
                    </Link>
                    {user?.role === 'ADMIN' && project.ownerId === user.id && (
                      <div className="flex space-x-2">
                        <Link 
                          to={`/projects/${project.id}/edit`}
                          className="btn btn-secondary"
                        >
                          Edit
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Projects
