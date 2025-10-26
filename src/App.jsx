import React, { useState, useEffect, useReducer, useCallback } from 'react';
import { LogIn, UserPlus, Home, List, Gauge, LogOut, CheckCheck, Loader, X, Edit, Trash2, Plus, Users, Zap } from 'lucide-react';

// --- Configuration & Constants ---
const SESSION_KEY = 'ticketapp_session';
const LAST_EMAIL_KEY = 'ticketapp_last_email'; 
const MOCK_USER_EMAIL = 'user@example.com';
const MOCK_USER_PASSWORD = 'password123';
const USER_DATA_KEY = 'user_data';
const MAX_WIDTH_CLASS = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";

// --- Utility Functions ---

/**
 * Custom hook to manage state persistence in localStorage.
 * @param {string} key
 * @param {any} initialValue
 */
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      // Use initialValue if item is not found or null, ensuring we don't return "null" as a string
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading localStorage key "' + key + '": ', error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error writing to localStorage key "' + key + '": ', error);
    }
  };

  return [storedValue, setValue];
};

/**
 * Mock Ticket Data Generator
 */
const initialTickets = [
  { id: '1', title: 'Database connection error in production', description: 'The primary service failed to connect to the SQL database after the latest deployment.', status: 'open', priority: 'High' },
  { id: '2', title: 'Update documentation for API endpoint v2', description: 'Need to reflect changes in the response schema in the developer guide.', status: 'in_progress', priority: 'Medium' },
  { id: '3', title: 'UI alignment issue on mobile', description: 'The header logo is misaligned on screens smaller than 400px.', status: 'closed', priority: 'Low' },
];

/**
 * Reducer for centralized application state
 */
const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_ROUTE':
      return { ...state, route: action.payload };
    case 'SET_AUTH':
      return { ...state, isAuthenticated: action.payload };
    case 'ADD_TICKET':
      return { ...state, tickets: [...state.tickets, action.payload] };
    case 'UPDATE_TICKET':
      return {
        ...state,
        tickets: state.tickets.map(t =>
          t.id === action.payload.id ? action.payload : t
        ),
      };
    case 'DELETE_TICKET':
      return {
        ...state,
        tickets: state.tickets.filter(t => t.id !== action.payload),
      };
    default:
      return state;
  }
};

// --- Component: UI Elements ---

/**
 * Status Tag Component
 */
const StatusTag = ({ status }) => {
  let colorClass = 'bg-secondary text-dark';
  let label = 'Unknown';
  if (status === 'open') {
    colorClass = 'bg-success text-white';
    label = 'Open';
  } else if (status === 'in_progress') {
    colorClass = 'bg-warning text-dark';
    label = 'In Progress';
  } else if (status === 'closed') {
    colorClass = 'bg-light text-dark';
    label = 'Closed';
  }

  return (
    <span className={`badge ${colorClass}`}>
      {label}
    </span>
  );
};

/**
 * Decorative Box/Card Component
 */
const Card = ({ children, className = '' }) => (
  <div className={`card p-4 shadow-sm ${className}`}>
    <div className="card-body">
      {children}
    </div>
  </div>
);

/**
 * Notification Toast Component (using a simple transient state)
 */
const Toast = ({ message, type, onClose }) => {
  if (!message) return null;

  let color = 'bg-indigo-500';
  if (type === 'error') color = 'bg-red-500';
  if (type === 'success') color = 'bg-green-500';

  return (
    <div className="fixed top-5 right-5 z-50">
      <div className={`flex items-center p-4 rounded-lg shadow-2xl text-white ${color}`}>
        <p className="font-medium mr-4">{message}</p>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

/**
 * Custom Confirmation Modal Component (REUSABLE)
 */
const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', confirmColor = 'bg-red-600' }) => {
  if (!isOpen) return null;

  return (
    <div className="modal show d-block" onClick={onCancel}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h3 className="modal-title">{title}</h3>
          </div>
          <div className="modal-body">
            <p>{message}</p>
          </div>
          <div className="modal-footer">
            <button
              onClick={onCancel}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`btn ${confirmColor.replace('bg-', 'btn-').replace('btn-btn-', 'btn-')}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Main Navigation Component
 */
const Navigation = ({ route, onNavigate, onRequestLogout, isAuthenticated }) => (
  <header className="sticky-top shadow-sm bg-white">
    <div className="container-fluid d-flex justify-content-between align-items-center py-3">
      <h1 className="h3 fw-bold text-primary cursor-pointer" onClick={() => onNavigate('home')}>
        Ticket<span className="text-dark">Flow</span>
      </h1>
      <nav className="d-flex align-items-center gap-3">
        {isAuthenticated ? (
          <>
            <NavItem icon={Gauge} label="Dashboard" current={route === 'dashboard'} onClick={() => onNavigate('dashboard')} />
            <NavItem icon={List} label="Tickets" current={route === 'tickets'} onClick={() => onNavigate('tickets')} />
            <button
              onClick={onRequestLogout} // Use onRequestLogout to trigger modal
              className="btn btn-outline-danger d-flex align-items-center gap-2"
            >
              <LogOut className="icon" />
              <span className="d-none d-sm-inline">Logout</span>
            </button>
          </>
        ) : (
          <>
            {(route !== 'login' && route !== 'signup') && (
              <button onClick={() => onNavigate('login')} className="btn btn-outline-primary d-flex align-items-center gap-2">
                <LogIn className="icon" />
                <span className="d-none d-sm-inline">Login</span>
              </button>
            )}
          </>
        )}
      </nav>
    </div>
  </header>
);

const NavItem = ({ icon: Icon, label, current, onClick }) => {
  const baseClasses = "btn d-flex align-items-center gap-2";
  const activeClasses = current ? "btn-primary text-white" : "btn-outline-secondary";
  return (
    <button onClick={onClick} className={`${baseClasses} ${activeClasses}`}>
      <Icon className="icon" />
      <span className="d-none d-sm-inline">{label}</span>
    </button>
  );
};

// --- Component: Pages ---

/**
 * Landing Page Component
 */
const LandingPage = ({ onNavigate }) => (
  <main className="bg-light">
    {/* Hero Section */}
    <div className="container-fluid text-center py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <h2 className="display-4 fw-bold text-dark">
            The <span className="text-primary">Flow</span> for Your Tickets
          </h2>
          <p className="lead text-muted mt-3">
            Manage, track, and resolve all your support issues with a single, streamlined system. Simple, fast, and collaborative.
          </p>
          <div className="mt-4 d-flex justify-content-center gap-3">
            <button
              onClick={() => onNavigate('signup')}
              className="btn btn-primary btn-lg"
            >
              Get Started
            </button>
            <button
              onClick={() => onNavigate('login')}
              className="btn btn-outline-primary btn-lg"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Feature Section */}
    <section className="py-5 bg-white">
      <div className="container-fluid">
        <h3 className="text-center fw-bold mb-5">Core Features</h3>
        <div className="row g-4">
          <div className="col-md-4">
            <Card className="text-center">
              <Users className="icon text-primary mb-3" />
              <h4 className="fw-bold">Collaboration</h4>
              <p className="text-muted">Work together on tickets in real-time. Share notes and updates instantly.</p>
            </Card>
          </div>
          <div className="col-md-4">
            <Card className="text-center">
              <List className="icon text-primary mb-3" />
              <h4 className="fw-bold">Full CRUD</h4>
              <p className="text-muted">Create, Read, Update, and Delete tickets with clear validation and feedback.</p>
            </Card>
          </div>
          <div className="col-md-4">
            <Card className="text-center">
              <Zap className="icon text-primary mb-3" />
              <h4 className="fw-bold">High Performance</h4>
              <p className="text-muted">A responsive design that works flawlessly on mobile, tablet, and desktop.</p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  </main>
);

/**
 * Authentication Screen Component (Login/Signup)
 */
const AuthScreen = ({ onNavigate, onLogin, isLogin }) => {
  // Use localStorage hook to persist the last entered email (now used as a placeholder)
  const [lastEmail] = useLocalStorage(LAST_EMAIL_KEY, MOCK_USER_EMAIL);

  // Initial state is now empty strings, as requested
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);

  const title = isLogin ? 'Login to TicketFlow' : 'Create an Account';
  const subtitle = isLogin ? 'Access your dashboard and manage tickets.' : 'Join the fastest way to track your issues.';

  const validate = () => {
    let errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(email)) {
      errors.email = 'Please enter a valid email format.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validate()) {
      return;
    }

    if (isLogin) {
      // Get user data from localStorage
      const userData = JSON.parse(window.localStorage.getItem(USER_DATA_KEY) || '{}');
      
      // Check if the entered credentials match the stored ones
      if (email === userData.email && password === userData.password) {
        onLogin(true, 'Login successful! Redirecting...', email);
      } else {
        setGeneralError('Invalid credentials. Please check your email and password.');
        onLogin(false, 'Login failed.', email);
      }
    } else {
      // Save user data to localStorage
      const userData = { email, password };
      window.localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
      onLogin(true, 'Signup successful! Creating session and redirecting...', email);
    }
  };
  
  // Custom input styling for error indication
  const inputClass = (field) => {
    return `form-control ${validationErrors[field] ? 'is-invalid' : ''}`;
  };
  const errorTextClass = "invalid-feedback";

  return (
    <main className="min-vh-100 d-flex align-items-center justify-content-center bg-light p-4">
      <Card className="w-100" style={{ maxWidth: '400px' }}>
        <h2 className="text-center fw-bold text-dark">{title}</h2>
        <p className="text-center text-muted mb-4">{subtitle}</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass('email')}
              placeholder={lastEmail || 'e.g., jane.doe@work.com'}
            />
            {validationErrors.email && <div className={errorTextClass}>{validationErrors.email}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass('password')}
              placeholder={isLogin ? 'Enter your password' : 'Min. 6 characters'}
            />
            {validationErrors.password && <div className={errorTextClass}>{validationErrors.password}</div>}
          </div>

          {generalError && (
            <div className="alert alert-danger">
              {generalError}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-100"
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-3 text-center">
          {isLogin ? (
            <p className="text-muted">
              Don't have an account?{' '}
              <button onClick={() => onNavigate('signup')} className="btn btn-link">
                Sign up
              </button>
            </p>
          ) : (
            <p className="text-muted">
              Already have an account?{' '}
              <button onClick={() => onNavigate('login')} className="btn btn-link">
                Login
              </button>
            </p>
          )}
        </div>
      </Card>
    </main>
  );
};

/**
 * Dashboard Component
 */
const Dashboard = ({ tickets, onNavigate }) => {
  const stats = [
    { label: 'Total Tickets', value: tickets.length, icon: List, color: 'text-indigo-600' },
    { label: 'Open Tickets', value: tickets.filter(t => t.status === 'open').length, icon: Loader, color: 'text-green-600' },
    { label: 'In Progress', value: tickets.filter(t => t.status === 'in_progress').length, icon: Zap, color: 'text-amber-600' },
    { label: 'Resolved Tickets', value: tickets.filter(t => t.status === 'closed').length, icon: CheckCheck, color: 'text-gray-600' },
  ];

  return (
    <main className="py-5 bg-light min-vh-100">
      <div className="container-fluid">
        <h2 className="fw-bold text-dark mb-4">System Dashboard</h2>
        <div className="row g-4">
          {stats.map((stat, index) => (
            <div className="col-lg-3 col-md-6" key={index}>
              <Card className="d-flex align-items-center gap-3">
                <div className={`p-3 rounded-circle bg-opacity-10 ${stat.color.replace('text', 'bg')}`}>
                  <stat.icon className={`icon ${stat.color}`} />
                </div>
                <div>
                  <p className="text-muted mb-1">{stat.label}</p>
                  <p className="h3 fw-bold text-dark">{stat.value}</p>
                </div>
              </Card>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <h3 className="fw-bold text-dark mb-3">Quick Access</h3>
          <Card className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center p-4 bg-primary bg-opacity-10 border-start border-primary border-4">
            <div>
              <p className="fw-medium text-primary">Manage all your active and pending tickets.</p>
              <p className="text-muted">Go to the full ticket list for detailed CRUD operations.</p>
            </div>
            <button
              onClick={() => onNavigate('tickets')}
              className="btn btn-primary mt-3 mt-md-0 d-flex align-items-center gap-2"
            >
              <List className="icon" />
              <span>View All Tickets</span>
            </button>
          </Card>
        </div>
      </div>
    </main>
  );
};

/**
 * Ticket Management Screen (CRUD)
 */
// TicketManager now accepts onDeleteRequest prop
const TicketManager = ({ state, dispatch, onNavigate, showToast, onDeleteRequest }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredTickets = state.tickets.filter(t => filterStatus === 'all' || t.status === filterStatus);

  const handleEdit = (ticket) => {
    setEditingTicket(ticket);
    setIsModalOpen(true);
  };

  // Triggers the parent's modal instead of using window.confirm
  const handleDelete = (id) => {
    onDeleteRequest({ id, title: state.tickets.find(t => t.id === id)?.title });
  };

  const handleSave = (ticketData) => {
    if (editingTicket) {
      dispatch({ type: 'UPDATE_TICKET', payload: { ...editingTicket, ...ticketData } });
      showToast('Ticket updated successfully.', 'success');
    } else {
      const newTicket = { id: Date.now().toString(), ...ticketData };
      dispatch({ type: 'ADD_TICKET', payload: newTicket });
      showToast('New ticket created successfully.', 'success');
    }
    setIsModalOpen(false);
    setEditingTicket(null);
  };

  return (
    <main className="py-5 bg-light min-vh-100">
      <div className="container-fluid d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark">Ticket Management</h2>
        <button
          onClick={() => { setEditingTicket(null); setIsModalOpen(true); }}
          className="btn btn-primary d-flex align-items-center gap-2"
        >
          <Plus className="icon" />
          <span>New Ticket</span>
        </button>
      </div>

      <div className="mb-4 d-flex gap-2 overflow-auto pb-2">
        {['all', 'open', 'in_progress', 'closed'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`btn flex-shrink-0 ${
              filterStatus === status ? 'btn-primary' : 'btn-outline-secondary'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')} ({state.tickets.filter(t => status === 'all' || t.status === status).length})
          </button>
        ))}
      </div>

      <div className="d-grid gap-3">
        {filteredTickets.length > 0 ? (
          filteredTickets.map(ticket => (
            <Card key={ticket.id} className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center border-start border-primary border-4">
              <div className="flex-grow-1 w-100">
                <p className="h5 fw-semibold text-dark">{ticket.title}</p>
                <p className="text-muted">{ticket.description || 'No description provided.'}</p>
                <p className="text-muted small">Priority: <span className="fw-medium">{ticket.priority}</span></p>
              </div>
              <div className="mt-3 mt-md-0 d-flex align-items-center gap-3">
                <StatusTag status={ticket.status} />
                <button onClick={() => handleEdit(ticket)} className="btn btn-outline-primary">
                  <Edit className="icon" />
                </button>
                <button onClick={() => handleDelete(ticket.id)} className="btn btn-outline-danger">
                  <Trash2 className="icon" />
                </button>
              </div>
            </Card>
          ))
        ) : (
          <Card className="text-center text-muted p-5">
            No tickets found with status: **{filterStatus}**.
          </Card>
        )}
      </div>

      {isModalOpen && (
        <TicketModal
          ticket={editingTicket}
          onSave={handleSave}
          onClose={() => { setIsModalOpen(false); setEditingTicket(null); }}
          showToast={showToast}
        />
      )}
    </main>
  );
};

/**
 * Ticket Creation/Editing Modal
 */
const TicketModal = ({ ticket, onSave, onClose, showToast }) => {
  const [formData, setFormData] = useState({
    title: ticket?.title || '',
    description: ticket?.description || '',
    status: ticket?.status || 'open',
    priority: ticket?.priority || 'Medium',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (formData.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters long.';
    }
    if (!['open', 'in_progress', 'closed'].includes(formData.status)) {
      newErrors.status = 'Invalid status selected.';
    }
    if (formData.description.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    } else {
      showToast('Please correct the validation errors.', 'error');
    }
  };

  const inputClass = "form-control";
  const errorClass = "is-invalid";
  const labelClass = "form-label";
  const errorTextClass = "invalid-feedback";

  return (
    <div className="modal show d-block" onClick={onClose}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h3 className="modal-title">{ticket ? 'Edit Ticket' : 'Create New Ticket'}</h3>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {/* Title Field */}
              <div className="mb-3">
                <label className={labelClass}>Title (Mandatory)</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`${inputClass} ${errors.title ? errorClass : ''}`}
                />
                {errors.title && <div className={errorTextClass}>{errors.title}</div>}
              </div>

              {/* Description Field */}
              <div className="mb-3">
                <label className={labelClass}>Description (Max 500 chars)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className={`${inputClass} ${errors.description ? errorClass : ''}`}
                />
                {errors.description && <div className={errorTextClass}>{errors.description}</div>}
              </div>

              {/* Status Field */}
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className={labelClass}>Status (Mandatory)</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className={`${inputClass} ${errors.status ? errorClass : ''}`}
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="closed">Closed</option>
                  </select>
                  {errors.status && <div className={errorTextClass}>{errors.status}</div>}
                </div>

                {/* Priority Field */}
                <div className="col-md-6">
                  <label className={labelClass}>Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              {/* Action Buttons */}
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                {ticket ? 'Save Changes' : 'Create Ticket'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

/**
 * Footer Component
 */
const Footer = () => (
  <footer className="bg-dark text-white mt-5 py-4">
    <div className="container-fluid">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center border-top border-secondary pt-3">
        <p className="text-muted mb-3 mb-md-0">&copy; {new Date().getFullYear()} TicketFlow. All rights reserved.</p>
        <div className="d-flex gap-4">
          <a href="#" className="text-muted text-decoration-none">Privacy</a>
          <a href="#" className="text-muted text-decoration-none">Terms</a>
          <a href="#" className="text-muted text-decoration-none">Contact</a>
        </div>
      </div>
    </div>
  </footer>
);


// --- Main App Component ---
export default function App() {
  const [token, setToken] = useLocalStorage(SESSION_KEY, null);
  const [state, dispatch] = useReducer(appReducer, {
    isAuthenticated: !!token,
    route: token ? 'dashboard' : 'home',
    tickets: initialTickets,
  });
  const [toast, setToast] = useState({ message: null, type: null });
  
  // State for modals
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [deleteTicketRequest, setDeleteTicketRequest] = useState(null); // { id: 'ticketId', title: 'Ticket Title' }

  // Navigation and Auth effects
  useEffect(() => {
    // Sync internal state with token presence
    dispatch({ type: 'SET_AUTH', payload: !!token });
    // Redirect logic for page load
    if (token) {
      if (state.route === 'login' || state.route === 'signup' || state.route === 'home') {
        dispatch({ type: 'SET_ROUTE', payload: 'dashboard' });
      }
    } else {
      if (state.route !== 'home' && state.route !== 'login' && state.route !== 'signup') {
        dispatch({ type: 'SET_ROUTE', payload: 'home' });
        showToast('Your session has expired — please log in again.', 'error');
      }
    }
  }, [token]);

  const onNavigate = useCallback((newRoute) => {
    if (newRoute !== 'home' && newRoute !== 'login' && newRoute !== 'signup' && !state.isAuthenticated) {
      showToast('Access denied. Please log in first.', 'error');
      newRoute = 'login';
    }
    dispatch({ type: 'SET_ROUTE', payload: newRoute });
  }, [state.isAuthenticated]);


  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: null, type: null }), 3000);
  };

  const handleLogin = (success, message, email) => {
    if (success) {
      // Mock token generation
      setToken('mock_session_token_' + Date.now());
      // Save last successfully used email
      if (email) {
        window.localStorage.setItem(LAST_EMAIL_KEY, JSON.stringify(email));
      }
      showToast(message, 'success');
      // Effect hook handles route change after token set
    } else {
      showToast(message, 'error');
    }
  };

  // Function to trigger the logout modal
  const requestLogout = () => {
    setShowLogoutModal(true);
  };

  // Actual logout logic (called by the modal)
  const handleLogoutConfirmed = () => {
    setShowLogoutModal(false);
    setToken(null);
    dispatch({ type: 'SET_AUTH', payload: false });
    dispatch({ type: 'SET_ROUTE', payload: 'home' });
    showToast('You have been logged out successfully.', 'info');
  };

  // Actual ticket deletion logic (called by the modal)
  const handleDeleteTicketConfirmed = () => {
    if (deleteTicketRequest) {
        dispatch({ type: 'DELETE_TICKET', payload: deleteTicketRequest.id });
        showToast('Ticket successfully deleted.', 'success');
        setDeleteTicketRequest(null); // Close the modal
    }
  };


  // Render the current page based on the route
  const renderContent = () => {
    if (state.route === 'home') {
      return <LandingPage onNavigate={onNavigate} />;
    } else if (state.route === 'login') {
      return <AuthScreen isLogin={true} onNavigate={onNavigate} onLogin={handleLogin} />;
    } else if (state.route === 'signup') {
      return <AuthScreen isLogin={false} onNavigate={onNavigate} onLogin={handleLogin} />;
    } else if (state.route === 'dashboard') {
      return state.isAuthenticated ? <Dashboard tickets={state.tickets} onNavigate={onNavigate} /> : null;
    } else if (state.route === 'tickets') {
      return state.isAuthenticated ? (
        <TicketManager 
          state={state} 
          dispatch={dispatch} 
          onNavigate={onNavigate} 
          showToast={showToast} 
          onDeleteRequest={setDeleteTicketRequest} // Pass setter to request deletion
        />
      ) : null;
    }
    return <div className="p-8 text-center">404 Page Not Found. <button onClick={() => onNavigate('home')}>Go Home</button></div>;
  };

  // Full-page styles for wave effect responsiveness (simulating SSR body structure)
  if (state.route === 'home') {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation route={state.route} onNavigate={onNavigate} onRequestLogout={requestLogout} isAuthenticated={state.isAuthenticated} />
        <div className="flex-1">{renderContent()}</div>
        <Footer />
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: null, type: null })} />
      </div>
    );
  }

  // Standard container layout for authenticated pages
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <style>{`
        /* Custom CSS for decorative circles/blobs - added directly in React style */
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite alternate; }
      `}</style>
      <Navigation route={state.route} onNavigate={onNavigate} onRequestLogout={requestLogout} isAuthenticated={state.isAuthenticated} />
      <div className="flex-1">
        {renderContent()}
      </div>
      <Footer />
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: null, type: null })} />

      {/* RENDER MODALS */}
      {/* 1. Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={showLogoutModal}
        title="Confirm Logout"
        message="Are you sure you want to exit? Your session will end, and you'll need to log back in to access your dashboard."
        onConfirm={handleLogoutConfirmed}
        onCancel={() => setShowLogoutModal(false)}
        confirmText="Logout"
      />

      {/* 2. Ticket Deletion Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteTicketRequest}
        title="Confirm Deletion"
        message={`Are you sure you want to permanently delete ticket: "${deleteTicketRequest?.title}"? This action cannot be undone.`}
        onConfirm={handleDeleteTicketConfirmed}
        onCancel={() => setDeleteTicketRequest(null)}
        confirmText="Delete Ticket"
        confirmColor="bg-red-600"
      />
    </div>
  );
}
