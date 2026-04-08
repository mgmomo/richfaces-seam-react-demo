import { Link } from 'react-router-dom';

export default function AccessDeniedPage() {
  return (
    <div>
      <h2 className="page-title">Access Denied</h2>
      <p className="mb-2">You do not have sufficient permissions to access this page.</p>
      <p className="mb-4">Use the role switcher in the header to change your role.</p>
      <Link to="/" className="btn">Back to Home</Link>
    </div>
  );
}
