import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import StatusBadge from '../components/StatusBadge'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'

const PRIORITY_ICON = { HIGH: '▲', MEDIUM: '●', LOW: '▼' }

export default function ProjectDetailPage() {
  const { id }      = useParams()
  const { isAdmin, user } = useAuth()
  const navigate    = useNavigate()

  const [project, setProject]     = useState(null)
  const [tasks, setTasks]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' })
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => { fetchProject() }, [id])

  const fetchProject = async () => {
    try {
      const [projRes, taskRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/tasks`),
      ])
      setProject(projRes.data.data)
      setTasks(taskRes.data.data)
    } catch {
      setError('Failed to load project.')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (task, newStatus) => {
    setUpdatingId(task.id)
    setStatusMsg({ type: '', text: '' })
    try {
      await api.patch(`/projects/${id}/tasks/${task.id}`, { status: newStatus })
      setTasks(ts => ts.map(t => t.id === task.id ? { ...t, status: newStatus } : t))
      setStatusMsg({ type: 'success', text: 'Status updated.' })
    } catch (err) {
      const msg = err.response?.data?.message || 'Update failed.'
      setStatusMsg({ type: 'error', text: msg })
    } finally {
      setUpdatingId(null)
      setTimeout(() => setStatusMsg({ type: '', text: '' }), 3000)
    }
  }

  const canUpdateTask = (task) => isAdmin() || task.assigned_to === user?.id

  const allowedStatuses = (task) => {
    if (task.status === 'OVERDUE') {
      return isAdmin() ? ['OVERDUE', 'DONE'] : ['OVERDUE']
    }
    return ['TODO', 'IN_PROGRESS', 'DONE']
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  if (loading) return <div className="layout"><Navbar /><div className="spinner" /></div>

  return (
    <div className="layout">
      <Navbar />
      <main className="page">

        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Projects</Link>
          <span className="breadcrumb-sep">/</span>
          <span>{project?.name}</span>
        </div>

        {/* Header */}
        <div className="flex-between mb-24">
          <div>
            <h1 className="page-title">{project?.name}</h1>
            <p className="page-sub">{project?.description || 'No description.'}</p>
          </div>
          {isAdmin() && (
            <button className="btn btn-primary" onClick={() => navigate(`/projects/${id}/tasks/new`)}>
              + Add Task
            </button>
          )}
        </div>

        {error     && <div className="alert alert-error">{error}</div>}
        {statusMsg.text && (
          <div className={`alert alert-${statusMsg.type === 'error' ? 'error' : 'success'}`}>
            {statusMsg.text}
          </div>
        )}

        {/* Stats strip */}
        <div className="flex-center gap-16 mb-24" style={{ flexWrap: 'wrap' }}>
          {['TODO', 'IN_PROGRESS', 'DONE', 'OVERDUE'].map(s => {
            const count = tasks.filter(t => t.status === s).length
            return (
              <div key={s} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 20px', textAlign: 'center', minWidth: 90 }}>
                <div style={{ fontSize: 22, fontFamily: 'var(--mono)', fontWeight: 700 }}>{count}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.replace('_', ' ')}</div>
              </div>
            )
          })}
        </div>

        {/* Tasks table */}
        {tasks.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📋</div>
            <div className="empty-title">No tasks yet</div>
            <p>{isAdmin() ? 'Add the first task for this project.' : 'No tasks assigned to you in this project.'}</p>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Assignee</th>
                    <th>Priority</th>
                    <th>Due Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody className="stagger">
                  {tasks.map(task => (
                    <tr key={task.id}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{task.title}</div>
                        {task.description && (
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                            {task.description.slice(0, 60)}{task.description.length > 60 ? '…' : ''}
                          </div>
                        )}
                      </td>
                      <td className="text-muted">{task.assignee?.name ?? <span style={{ color: 'var(--border)' }}>Unassigned</span>}</td>
                      <td>
                        <span className={`priority-${task.priority?.toLowerCase()}`} style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>
                          {PRIORITY_ICON[task.priority]} {task.priority}
                        </span>
                      </td>
                      <td className="text-mono" style={{ fontSize: 13, color: task.status === 'OVERDUE' ? 'var(--danger)' : 'var(--text-muted)' }}>
                        {formatDate(task.due_date)}
                      </td>
                      <td>
                        {canUpdateTask(task) ? (
                          <select
                            className="status-select"
                            value={task.status}
                            disabled={updatingId === task.id}
                            onChange={e => handleStatusChange(task, e.target.value)}
                          >
                            {allowedStatuses(task).map(s => (
                              <option key={s} value={s}>{s.replace('_', ' ')}</option>
                            ))}
                          </select>
                        ) : (
                          <StatusBadge status={task.status} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
