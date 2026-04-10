import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'

export default function CreateTaskPage() {
  const { id }     = useParams()
  const { isAdmin } = useAuth()
  const navigate   = useNavigate()

  const [project, setProject] = useState(null)
  const [members, setMembers] = useState([])
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  const [form, setForm] = useState({
    title:       '',
    description: '',
    assigned_to: '',
    priority:    'MEDIUM',
    due_date:    '',
    status:      'TODO',
  })

  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    if (!isAdmin()) { navigate(`/projects/${id}`); return }
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      const [projRes, usersRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get('/auth/me').then(() => api.get('/users')).catch(() => ({ data: { data: [] } })),
      ])
      setProject(projRes.data.data)
      // Fallback: if /users endpoint doesn't exist, derive from project tasks
      const existingUsers = projRes.data.data?.tasks
        ?.map(t => t.assignee)
        .filter(Boolean)
        .filter((u, i, a) => a.findIndex(x => x.id === u.id) === i) || []
      setMembers(usersRes.data?.data?.length ? usersRes.data.data : existingUsers)
    } catch {
      // silently continue — members list is optional
    }
  }

  const onChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    setFieldErrors(fe => ({ ...fe, [name]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.title.trim())  errs.title    = 'Title is required.'
    if (!form.due_date)      errs.due_date = 'Due date is required.'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setFieldErrors(errs); return }

    setSaving(true)
    setError('')
    try {
      const payload = { ...form }
      if (!payload.assigned_to) delete payload.assigned_to
      await api.post(`/projects/${id}/tasks`, payload)
      navigate(`/projects/${id}`)
    } catch (err) {
      const apiErrors = err.response?.data?.errors
      if (apiErrors) {
        const flat = {}
        Object.entries(apiErrors).forEach(([k, v]) => { flat[k] = v[0] })
        setFieldErrors(flat)
      } else {
        setError(err.response?.data?.message || 'Failed to create task.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="layout">
      <Navbar />
      <main className="page" style={{ maxWidth: 640 }}>

        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Projects</Link>
          <span className="breadcrumb-sep">/</span>
          <Link to={`/projects/${id}`}>{project?.name ?? `Project #${id}`}</Link>
          <span className="breadcrumb-sep">/</span>
          <span>New Task</span>
        </div>

        <h1 className="page-title">Create Task</h1>
        <p className="page-sub">Add a new task to <strong>{project?.name}</strong>.</p>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="card fade-up" style={{ marginTop: 8 }}>
          <form onSubmit={handleSubmit}>

            {/* Title */}
            <div className="form-group">
              <label className="form-label">Task Title *</label>
              <input
                className="form-input"
                name="title"
                value={form.title}
                onChange={onChange}
                placeholder="e.g. Design landing page"
                autoFocus
              />
              {fieldErrors.title && <div className="form-error">{fieldErrors.title}</div>}
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                name="description"
                value={form.description}
                onChange={onChange}
                placeholder="Optional details about this task…"
              />
            </div>

            {/* Two columns: Priority + Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-select" name="priority" value={form.priority} onChange={onChange}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Initial Status</label>
                <select className="form-select" name="status" value={form.status} onChange={onChange}>
                  <option value="TODO">Todo</option>
                  <option value="IN_PROGRESS">In Progress</option>
                </select>
              </div>
            </div>

            {/* Due date */}
            <div className="form-group">
              <label className="form-label">Due Date *</label>
              <input
                className="form-input"
                type="date"
                name="due_date"
                value={form.due_date}
                onChange={onChange}
                style={{ colorScheme: 'dark' }}
              />
              {fieldErrors.due_date && <div className="form-error">{fieldErrors.due_date}</div>}
            </div>

            {/* Assign to */}
            <div className="form-group">
              <label className="form-label">Assign To</label>
              <select className="form-select" name="assigned_to" value={form.assigned_to} onChange={onChange}>
                <option value="">— Unassigned —</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
                ))}
              </select>
              <div className="form-error" style={{ color: 'var(--text-muted)', marginTop: 5, fontSize: 12 }}>
                If the members list is empty, add users to the DB directly and their name will appear here.
              </div>
            </div>

            {/* Actions */}
            <div className="flex-center gap-12" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
              <button type="button" className="btn btn-ghost" onClick={() => navigate(`/projects/${id}`)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Creating…' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
