import { useEffect, useMemo, useState } from 'react';
import TaskCard from '../components/TaskCard';
import {
  deleteTaskApi,
  deleteUserAdminApi,
  getTasksApi,
  getUsersAdminApi,
  updateTaskApi
} from '../api/task.api';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');
  const [alert, setAlert] = useState(null);

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const term = search.toLowerCase();
    return users.filter(
      (user) => user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term)
    );
  }, [users, search]);

  const filteredTasks = useMemo(() => {
    if (!search.trim()) return tasks;
    const term = search.toLowerCase();
    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(term) ||
        (task.description || '').toLowerCase().includes(term) ||
        task.user?.email?.toLowerCase().includes(term) ||
        task.user?.name?.toLowerCase().includes(term)
    );
  }, [tasks, search]);

  const loadAdminData = async () => {
    setLoading(true);
    setAlert(null);

    try {
      const [usersRes, tasksRes] = await Promise.all([getUsersAdminApi(), getTasksApi()]);
      setUsers(usersRes.data || []);
      setTasks(tasksRes.data || []);
    } catch (error) {
      setAlert({ type: 'error', message: error?.response?.data?.message || 'Failed to load admin data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleDeleteUser = async (userId) => {
    const confirmed = globalThis.confirm('Delete this user and all their tasks?');
    if (!confirmed) return;

    setBusy(true);
    try {
      const response = await deleteUserAdminApi(userId);
      setAlert({ type: 'success', message: response.message || 'User deleted' });
      await loadAdminData();
    } catch (error) {
      const message = error?.response?.data?.message || 'Could not delete user';
      setAlert({ type: 'error', message });
    } finally {
      setBusy(false);
    }
  };

  const handleTaskUpdate = async (taskId, payload) => {
    setBusy(true);
    try {
      const response = await updateTaskApi(taskId, payload);
      setTasks((prev) => prev.map((task) => (task.id === taskId ? response.data : task)));
      setAlert({ type: 'success', message: response.message || 'Task updated successfully' });
    } catch (error) {
      const message = error?.response?.data?.message || 'Could not update task';
      setAlert({ type: 'error', message });
      throw new Error(message);
    } finally {
      setBusy(false);
    }
  };

  const handleTaskDelete = async (taskId) => {
    const confirmed = globalThis.confirm('Delete this task?');
    if (!confirmed) return;

    setBusy(true);
    try {
      const response = await deleteTaskApi(taskId);
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      setAlert({ type: 'success', message: response.message || 'Task deleted successfully' });
    } catch (error) {
      setAlert({ type: 'error', message: error?.response?.data?.message || 'Could not delete task' });
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
        <h1>Admin Panel</h1>
        <p className="muted">Manage users and inspect all tasks.</p>
      </header>

      {alert && (
        <div className={`alert ${alert.type}`} role="status" aria-live="polite">
          {alert.message}
        </div>
      )}

      <section className="stats-grid" aria-label="Admin summary">
        <article className="stat-card">
          <p className="muted">Users</p>
          <h3>{users.length}</h3>
        </article>
        <article className="stat-card">
          <p className="muted">Tasks</p>
          <h3>{tasks.length}</h3>
        </article>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>Search</h2>
          <p className="muted">Filter users and tasks from one query.</p>
        </div>
        <div className="task-toolbar admin-toolbar">
          <input
            type="search"
            placeholder="Search users or tasks"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </section>

      <section className="panel table-wrap">
        <div className="panel-head">
          <h2>Users</h2>
          <p className="muted">Manage account access and cleanup inactive users.</p>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{new Date(user.createdAt).toLocaleString()}</td>
                <td>
                  <button
                    type="button"
                    className="btn btn-danger"
                    disabled={busy}
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && <p className="empty-state">No users match your search.</p>}
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>All Tasks</h2>
          <p className="muted">Review and maintain tasks across all users.</p>
        </div>
        {filteredTasks.length === 0 && <p className="empty-state">No tasks match your search.</p>}
        {filteredTasks.length > 0 && (
          <div className="task-grid">
            {filteredTasks.map((task) => (
              <TaskCard key={task.id} task={task} onSave={handleTaskUpdate} onDelete={handleTaskDelete} busy={busy} />
            ))}
          </div>
        )}
      </section>
    </section>
  );
};

export default AdminPanel;
