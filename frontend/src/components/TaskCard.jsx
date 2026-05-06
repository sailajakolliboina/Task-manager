import React from 'react'
import { Link } from 'react-router-dom'

const TaskCard = ({ task }) => {
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

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED'

  return (
    <div className="card p-4 mb-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
        <div className="flex space-x-2">
          <span className={`badge ${getStatusColor(task.status)}`}>
            {task.status.replace('_', ' ')}
          </span>
          <span className={`badge ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
        </div>
      </div>
      
      {task.description && (
        <p className="text-gray-600 mb-3">{task.description}</p>
      )}
      
      <div className="flex justify-between items-center text-sm text-gray-500">
        <div>
          <p>Assigned to: {task.assignedTo?.name || 'Unassigned'}</p>
          <p>Project: {task.project?.title}</p>
        </div>
        <div className="text-right">
          {task.dueDate && (
            <p className={isOverdue ? 'text-red-600 font-medium' : ''}>
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </p>
          )}
          <p>Created: {new Date(task.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-200">
        <Link 
          to={`/tasks/${task.id}/edit`}
          className="btn btn-primary"
        >
          Edit Task
        </Link>
      </div>
    </div>
  )
}

export default TaskCard
