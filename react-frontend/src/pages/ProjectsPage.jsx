import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'

export default function ProjectsPage() {
  const { isAdmin } = useAuth()
  const navigate    = useNavigate()

  const [projects, setProjects] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  // Create project modal state
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm]     = useState({ name: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [formErr, setFormErr] = useState('')

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects')
      setProjects(res.data.data)
    } catch {
      setError('Failed to load projects.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setFormErr('')
    setSaving(true)
    try {
      await api.post('/projects', form)
      setForm({ name: '', description: '' })
      setShowCreate(false)
      fetchProjects()
    } catch (err) {
      setFormErr(err.response?.data?.message || 'Failed to create project.')
    } finally {
      setSaving(false)
    }
  }

  const taskStats = (project) => {
    const tasks   = project.tasks || []
    const done    = tasks.filter(t => t.status === 'DONE').length
    const overdue = tasks.filter(t => t.status === 'OVERDUE').length
    return { total: tasks.length, done, overdue }
  }

  return (
    <div className="layout">
      <Navbar />
      <main className="page">
        <div className="flex-between mb-24">
          <div>
            <h1 className="page-title">Projects</h1>
            <p className="page-sub">{projects.length} project{projects.length !== 1 ? 's' : ''} found</p>
          </div>
          {isAdmin() && (
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
              + New Project
            </button>
          )}
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="spinner" />
        ) : projects.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📂</div>
            <div className="empty-title">No projects yet</div>
            <p>{isAdmin() ? 'Create your first project above.' : 'No projects assigned to you yet.'}</p>
          </div>
        ) : (
          <div className="grid grid-2 stagger">
            {projects.map(p => {
              const stats = taskStats(p)
              return (
                <div key={p.id} className="card card-link" onClick={() => navigate(`/projects/${p.id}`)}>
                  <div className="flex-between" style={{ marginBottom: 10 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 600 }}>{p.name}</h2>
                    {stats.overdue > 0 && (
                      <span className="badge badge-overdue">{stats.overdue} overdue</span>
                    )}
                  </div>
                  <p className="text-muted" style={{ marginBottom: 16, minHeight: 36 }}>
                    {p.description || 'No description provided.'}
                  </p>
                  <div className="flex-center gap-16" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    <span className="text-mono">{stats.total} tasks</span>
                    <span className="text-mono" style={{ color: 'var(--success)' }}>{stats.done} done</span>
                    <span style={{ marginLeft: 'auto', fontSize: 11 }}>
                      by {p.creator?.name ?? '—'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Create Project Modal */}
        {showCreate && (
          <div style={overlay}>
            <div style={modal} className="fade-up">
              <div className="flex-between" style={{ marginBottom: 24 }}>
                <h2 className="page-title" style={{ fontSize: 18, margin: 0 }}>New Project</h2>
                <button className="btn btn-ghost" style={{ padding: '4px 10px' }} onClick={() => setShowCreate(false)}>✕</button>
              </div>

              {formErr && <div className="alert alert-error">{formErr}</div>}

              <form onSubmit={handleCreate}>
                <div className="form-group">
                  <label className="form-label">Project Name</label>
                  <input
                    className="form-input"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Website Redesign"
                    required
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Optional description…"
                  />
                </div>
                <div className="flex-center gap-12" style={{ justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Creating…' : 'Create Project'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

const overlay = {
  position: 'fixed', inset: 0,
  background: 'rgba(0,0,0,0.6)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 999, padding: 20,
}

const modal = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-lg)',
  padding: 32,
  width: '100%',
  maxWidth: 500,
}
