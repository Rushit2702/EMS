import React, { useEffect, useState, useContext } from 'react';
import ModalForm from '../components/ModalForm';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Employees() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add Employee form state
  const [form, setForm] = useState({
    name: '',
    email: '',
    position: '',
    department: '',
    salary: ''
  });
  const [formError, setFormError] = useState('');

  // Edit state
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    position: '',
    department: '',
    salary: ''
  });
  const [editError, setEditError] = useState('');

  // Search state
  const [search, setSearch] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);

  // Role guard: block employees from accessing this page
  useEffect(() => {
    if (user && user.role === 'employee') {
      window.alert('Permission denied');
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user && user.role === 'employee') return;
    fetchEmployees();
  }, [user]);

  useEffect(() => {
    if (showAddModal) {
      const draft = localStorage.getItem('employeeFormDraft');
      if (draft) {
        try {
          setForm(JSON.parse(draft));
        } catch {}
      }
    }
  }, [showAddModal]);

  useEffect(() => {
    if (showAddModal) {
      localStorage.setItem('employeeFormDraft', JSON.stringify(form));
    }
  }, [form, showAddModal]);

  const fetchEmployees = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/employees', {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
      });
      const data = await res.json();
      if (res.ok) {
        setEmployees(data);
      } else {
        setError(data.message || 'Failed to fetch employees');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  // Edit handlers
  const startEdit = (emp) => {
    setEditId(emp._id);
    setEditForm({
      name: emp.name,
      email: emp.email,
      position: emp.position,
      department: emp.department,
      salary: emp.salary
    });
    setEditError('');
  };

  const handleEditChange = e => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSave = async (id) => {
    setEditError('');
    setLoading(true);
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
        body: JSON.stringify({ ...editForm, salary: Number(editForm.salary) })
      });
      const data = await res.json();
      if (res.ok) {
        fetchEmployees();
        setEditId(null);
      } else {
        setEditError(data.message || 'Failed to update employee');
      }
    } catch (err) {
      setEditError('Network error');
    }
    setLoading(false);
  };

  const handleEditCancel = () => {
    setEditId(null);
    setEditError('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
      });
      if (res.ok) {
        fetchEmployees();
      } else {
        alert('Failed to delete employee');
      }
    } catch (err) {
      alert('Network error');
    }
    setLoading(false);
  };

  // Filtered employees
  const filteredEmployees = employees.filter(emp =>
    emp.name?.toLowerCase().includes(search.toLowerCase()) ||
    emp.email?.toLowerCase().includes(search.toLowerCase()) ||
    emp.position?.toLowerCase().includes(search.toLowerCase()) ||
    emp.department?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h2>Employees</h2>
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        whileHover={{ scale: 1.025, boxShadow: '0 8px 32px rgba(52,152,219,0.18)' }}
      >
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by name, email, position, department..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-input"
          />
          <button onClick={() => setShowAddModal(true)} className="action-btn add-btn">+ Add Employee</button>
        </div>
        <ModalForm
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add Employee"
          initialState={{ name: '', email: '', position: '', department: '', salary: '' }}
          onSubmit={async (form, reset) => {
            setFormError('');
            setLoading(true);
            try {
              const res = await fetch('/api/employees', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: 'Bearer ' + localStorage.getItem('token'),
                },
                body: JSON.stringify({ ...form, salary: Number(form.salary) })
              });
              const data = await res.json();
              if (res.ok) {
                fetchEmployees();
                reset();
                return true;
              } else {
                setFormError(data.message || (data.errors && data.errors[0]?.msg) || 'Failed to add employee');
                return false;
              }
            } catch (err) {
              setFormError('Network error');
              return false;
            } finally {
              setLoading(false);
            }
          }}
          renderFields={(form, handleChange) => (
            <>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required />
              <input name="email" value={form.email} onChange={handleChange} placeholder="Email" type="email" required />
              <input name="position" value={form.position} onChange={handleChange} placeholder="Position" required />
              <input name="department" value={form.department} onChange={handleChange} placeholder="Department" required />
              <input name="salary" value={form.salary} onChange={handleChange} placeholder="Salary" type="number" required />
              {formError && <div className="error">{formError}</div>}
            </>
          )}
        />
        {/* Table or Empty State */}
        {loading ? (
          <div className="empty-state">
            <div className="spinner"></div>
          </div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : filteredEmployees.length === 0 ? (
          <div className="empty-state">
            No employees found.
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Position</th>
                  <th>Department</th>
                  <th>Salary</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp, idx) => (
                  <tr key={emp._id}>
                    {editId === emp._id ? (
                      <>
                        <td><input name="name" value={editForm.name} onChange={handleEditChange} required disabled={loading} /></td>
                        <td><input name="email" value={editForm.email} onChange={handleEditChange} required type="email" disabled={loading} /></td>
                        <td><input name="position" value={editForm.position} onChange={handleEditChange} required disabled={loading} /></td>
                        <td><input name="department" value={editForm.department} onChange={handleEditChange} required disabled={loading} /></td>
                        <td><input name="salary" value={editForm.salary} onChange={handleEditChange} required type="number" min="0" disabled={loading} /></td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="action-btn edit-btn"
                              onClick={() => handleEditSave(emp._id)}
                              disabled={loading}
                            >
                              Save
                            </button>
                            <button
                              className="action-btn delete-btn"
                              onClick={handleEditCancel}
                              disabled={loading}
                            >
                              Cancel
                            </button>
                          </div>
                          {editError && <div className="error">{editError}</div>}
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{emp.name}</td>
                        <td>{emp.email}</td>
                        <td>{emp.position}</td>
                        <td>{emp.department}</td>
                        <td>₹{emp.salary?.toLocaleString()}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="action-btn edit-btn"
                              onClick={() => startEdit(emp)}
                              disabled={loading}
                            >
                              Edit
                            </button>
                            <button
                              className="action-btn delete-btn"
                              onClick={() => handleDelete(emp._id)}
                              disabled={loading}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default Employees; 