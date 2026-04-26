import { useEffect, useMemo, useState } from 'react';
import TaskCard from '../components/TaskCard';
import {
  createTaskApi,
  deleteTaskApi,
  getTasksApi,
  updateTaskApi
} from '../api/task.api';
import { useAuth } from '../context/AuthContext';

const mapApiErrors = (errors = []) => {
  return errors.reduce((acc, item) => {
    acc[item.field] = item.message;
    return acc;
  }, {});
};

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [alert, setAlert] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'pending'
  });

  const visibleTasks = useMemo(() => {
    if (!isAdmin()) {
      return tasks;
    }
    return tasks.filter((task) => task.userId === user?.id);
  }, [tasks, isAdmin, user]);

  const taskStats = useMemo(() => {
    return visibleTasks.reduce(
      (acc, task) => {
        acc.total += 1;
        if (task.status === 'pending') acc.pending += 1;
        if (task.status === 'in_progress') acc.inProgress += 1;
        if (task.status === 'done') acc.done += 1;
        return acc;
      },
      { total: 0, pending: 0, inProgress: 0, done: 0 }
    );
  }, [visibleTasks]);

  const filteredTasks = useMemo(() => {
    let filtered = visibleTasks;

    if (statusFilter !== 'all') {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }

    if (search.trim()) {
      const term = search.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(term) ||
          (task.description || '').toLowerCase().includes(term)
      );
    }

    return [...filtered].sort((a, b) => {
      if (sortBy === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      if (sortBy === 'status') {
        return a.status.localeCompare(b.status);
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [visibleTasks, search, statusFilter, sortBy]);

  const fetchTasks = async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await getTasksApi();
      setTasks(response.data || []);
    } catch (error) {
      setAlert({ type: 'error', message: error?.response?.data?.message || 'Failed to load tasks' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = async (event) => {
    event.preventDefault();
    setBusy(true);
    setFieldErrors({});
    setAlert(null);

    try {
      const response = await createTaskApi(form);
      setTasks((prev) => [response.data, ...prev]);
      setForm({ title: '', description: '', status: 'pending' });
      setAlert({ type: 'success', message: response.message || 'Task created successfully' });
    } catch (error) {
      const message = error?.response?.data?.message || 'Could not create task';
      const errors = error?.response?.data?.errors || [];
      setFieldErrors(mapApiErrors(errors));
      setAlert({ type: 'error', message });
    } finally {
      setBusy(false);
    }
  };

  const handleSaveTask = async (id, payload) => {
    setBusy(true);
    setAlert(null);

    try {
      const response = await updateTaskApi(id, payload);
      setTasks((prev) => prev.map((task) => (task.id === id ? response.data : task)));
      setAlert({ type: 'success', message: response.message || 'Task updated successfully' });
    } catch (error) {
      const message = error?.response?.data?.message || 'Could not update task';
      setAlert({ type: 'error', message });
      throw new Error(message);
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteTask = async (id) => {
    const confirmed = globalThis.confirm('Delete this task?');
    if (!confirmed) return;

    setBusy(true);
    setAlert(null);

    try {
      const response = await deleteTaskApi(id);
      setTasks((prev) => prev.filter((task) => task.id !== id));
      setAlert({ type: 'success', message: response.message || 'Task deleted successfully' });
    } catch (error) {
      const message = error?.response?.data?.message || 'Could not delete task';
      setAlert({ type: 'error', message });
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="page-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <section className="container page-content">
      <header className="page-header">
        <h1>My Tasks</h1>
        <p className="muted">Create, update, and track progress for your tasks.</p>
      </header>

      <section className="stats-grid" aria-label="Task summary">
        <article className="stat-card">
          <p className="muted">Total</p>
          <h3>{taskStats.total}</h3>
        </article>
        <article className="stat-card">
          <p className="muted">Pending</p>
          <h3>{taskStats.pending}</h3>
        </article>
        <article className="stat-card">
          <p className="muted">In Progress</p>
          <h3>{taskStats.inProgress}</h3>
        </article>
        <article className="stat-card">
          <p className="muted">Done</p>
          <h3>{taskStats.done}</h3>
        </article>
      </section>

      {alert && (
        <div className={`alert ${alert.type}`} role="status" aria-live="polite">
          {alert.message}
        </div>
      )}

      <section className="panel">
        <div className="panel-head">
          <h2>Create Task</h2>
          <p className="muted">Add a new task with status and optional description.</p>
        </div>
        <form onSubmit={handleAddTask} className="task-create-form">
          <div className="grid-3">
            <label>
              <span>Title</span>
              <input
                type="text"
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Add a clear task title"
                required
              />
              {fieldErrors.title && <small className="field-error">{fieldErrors.title}</small>}
            </label>

            <label>
              <span>Description</span>
              <input
                type="text"
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Optional details"
              />
              {fieldErrors.description && <small className="field-error">{fieldErrors.description}</small>}
            </label>

            <label>
              <span>Status</span>
              <select
                value={form.status}
                onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </label>
          </div>

          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? 'Saving...' : 'Add Task'}
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>Task Board</h2>
          <p className="muted">Filter, sort, and manage your tasks.</p>
        </div>

        <div className="task-toolbar">
          <input
            type="search"
            placeholder="Search title or description"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="status">Sort by status</option>
          </select>
          <button
            type="button"
            className="btn btn-outline"
            disabled={refreshing}
            onClick={() => fetchTasks(true)}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {filteredTasks.length === 0 && <p className="empty-state">No tasks match your current filters.</p>}

        {filteredTasks.length > 0 && (
          <div className="task-grid">
            {filteredTasks.map((task) => (
              <TaskCard key={task.id} task={task} onSave={handleSaveTask} onDelete={handleDeleteTask} busy={busy} />
            ))}
          </div>
        )}
      </section>
    </section>
  );
};

export default Dashboard;
