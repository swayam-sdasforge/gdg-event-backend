import { useState, useEffect } from 'react';
import Chat from './Chat';
import './App.css';

// Local component to handle individual grading state for each submission
const JudgeGradingForm = ({ submission, onScore }) => {
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onScore(submission.id, parseInt(score), feedback);
  };

  return (
    <form onSubmit={handleSubmit} className="grading-form">
      <input 
        type="number" 
        min="0" 
        max="100" 
        placeholder="Score (0-100)" 
        value={score} 
        onChange={(e) => setScore(e.target.value)} 
        required 
      />
      <input 
        type="text" 
        placeholder="Feedback" 
        value={feedback} 
        onChange={(e) => setFeedback(e.target.value)} 
        required 
      />
      <button type="submit" className="score-btn">Submit Grade</button>
    </form>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  
  // Auth State
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('admin@gdg.com');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState('participant');
  
  // Dashboard State
  const [submissions, setSubmissions] = useState([]);
  const [projectUrl, setProjectUrl] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegistering 
      ? { name, email, password, role } 
      : { email, password };

    try {
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.token) {
        setToken(data.token);
        setUser(data.user);
        fetchSubmissions(data.token, data.user.role);
      } else if (data.message && isRegistering) {
        alert("Registration successful! Please log in.");
        setIsRegistering(false);
      } else {
        alert(data.error || "Authentication failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubmissions = async (authToken, userRole) => {
    if (userRole === 'participant') return; 
    const res = await fetch('http://localhost:5000/api/submissions', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await res.json();
    setSubmissions(data);
  };

  const submitProject = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:5000/api/submissions', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ project_url: projectUrl, description: 'Hackathon Submission' })
    });
    alert('✅ Project Submitted Successfully!');
    setProjectUrl('');
    // If they were able to fetch (not participant), refresh
    if (user.role !== 'participant') fetchSubmissions(token, user.role);
  };

  const scoreProject = async (id, score, feedback) => {
    await fetch(`http://localhost:5000/api/submissions/${id}/score`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ score, feedback })
    });
    alert('✅ Project Scored!');
    fetchSubmissions(token, user.role);
  };

  if (!user) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <h1>GDG VIT Chennai</h1>
            <p>TechnoVIT Event Portal</p>
          </div>
          <form onSubmit={handleAuth} className="auth-form">
            <h2>{isRegistering ? 'Create Account' : 'Welcome Back'}</h2>
            
            {isRegistering && (
              <>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" required />
                <select value={role} onChange={e => setRole(e.target.value)}>
                  <option value="participant">Participant</option>
                  <option value="judge">Judge</option>
                  <option value="organizer">Organizer</option>
                </select>
              </>
            )}
            
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" required />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
            
            <button type="submit" className="primary-btn">
              {isRegistering ? 'Register' : 'Log In'}
            </button>
          </form>
          
          <div className="auth-switch">
            <p>
              {isRegistering ? 'Already have an account?' : "Don't have an account?"} 
              <span onClick={() => setIsRegistering(!isRegistering)}>
                {isRegistering ? ' Log In' : ' Register'}
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="logo">GDG VIT Chennai</div>
        <div className="user-profile">
          <span>{user.name}</span>
          <span className={`role-badge ${user.role}`}>{user.role}</span>
          <button onClick={() => setUser(null)} className="logout-btn">Logout</button>
        </div>
      </header>

      <div className="dashboard-container">
        <main className="main-content">
          <div className="welcome-banner">
            <h2>Dashboard</h2>
            <p>Manage your event workflow below.</p>
          </div>

          <div className="workflow-section">
            {user.role === 'participant' && (
              <div className="content-card">
                <h3>Submit Your Project</h3>
                <p>Paste the link to your GitHub repository or hosted project below.</p>
                <form onSubmit={submitProject} className="submit-form">
                  <input type="url" value={projectUrl} onChange={e => setProjectUrl(e.target.value)} placeholder="https://github.com/..." required />
                  <button type="submit" className="primary-btn">Submit Project</button>
                </form>
              </div>
            )}

            {(user.role === 'organizer' || user.role === 'judge') && (
              <div className="content-card">
                <h3>All Submissions</h3>
                {submissions.length === 0 ? (
                  <p className="no-data">No submissions yet.</p>
                ) : (
                  <div className="submissions-grid">
                    {submissions.map(sub => (
                      <div key={sub.id} className="submission-item">
                        <div className="sub-info">
                          <h4>{sub.participant_name || 'Participant'}</h4>
                          <a href={sub.project_url} target="_blank" rel="noreferrer" className="link-btn">View Project</a>
                          
                          {sub.feedback && (
                            <p className="feedback-text"><strong>Feedback:</strong> {sub.feedback}</p>
                          )}
                        </div>
                        
                        <div className="sub-score">
                          <span className={sub.score !== null ? 'scored' : 'pending'}>
                            {sub.score !== null ? `Score: ${sub.score}/100` : 'Pending Review'}
                          </span>
                          
                          {/* Real Input Box for Judges */}
                          {user.role === 'judge' && sub.score === null && (
                            <JudgeGradingForm submission={sub} onScore={scoreProject} />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        <aside className="chat-sidebar">
          <Chat user={user} />
        </aside>
      </div>
    </div>
  );
}

export default App;
