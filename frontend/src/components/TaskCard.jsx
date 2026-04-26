import { useState } from 'react';
import PropTypes from 'prop-types';

const statusClassMap = {
  pending: 'status-pending',
  in_progress: 'status-progress',
  done: 'status-done'
};

const TaskCard = ({ task, onSave, onDelete, busy }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [form, setForm] = useState({
    title: task.title,
    description: task.description || '',
    status: task.status
  });

  const handleSave = async (event) => {
    event.preventDefault();
    setSaveError('');

    try {
      await onSave(task.id, form);
      setIsEditing(false);
    } catch (error) {
      setSaveError(error?.message || 'Could not save task changes');
    }
  };

  const statusText = task.status.replace('_', ' ');

  return (
    <article className="task-card">
      {!isEditing && (
        <>
          <div className="task-card-head">
            <h3>{task.title}</h3>
            <span className={`status-chip ${statusClassMap[task.status] || 'status-pending'}`}>
              {statusText}
            </span>
          </div>
          <p className="task-desc">{task.description || 'No description provided.'}</p>
          {task.user && (
            <p className="task-meta">
              Owner: {task.user.name} ({task.user.email})
            </p>
          )}
          <div className="task-actions">
            <button className="btn btn-soft" type="button" onClick={() => setIsEditing(true)} disabled={busy}>
              Edit
            </button>
            <button className="btn btn-danger" type="button" onClick={() => onDelete(task.id)} disabled={busy}>
              Delete
            </button>
          </div>
        </>
      )}

      {isEditing && (
        <form onSubmit={handleSave} className="task-edit-form">
          {saveError && <p className="field-error">{saveError}</p>}

          <label>
            <span>Title</span>
            <input
              type="text"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              required
            />
          </label>

          <label>
            <span>Description</span>
            <textarea
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              rows={3}
            />
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

          <div className="task-actions">
            <button className="btn btn-primary" type="submit" disabled={busy}>
              Save
            </button>
            <button className="btn btn-outline" type="button" onClick={() => setIsEditing(false)} disabled={busy}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </article>
  );
};

TaskCard.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    status: PropTypes.oneOf(['pending', 'in_progress', 'done']).isRequired,
    user: PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string
    })
  }).isRequired,
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  busy: PropTypes.bool
};

TaskCard.defaultProps = {
  busy: false
};

export default TaskCard;
