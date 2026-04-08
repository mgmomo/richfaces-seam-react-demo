import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { user, isAdmin, isUser } = useAuth();

  return (
    <div>
      <h2 className="page-title">Welcome to Vision4</h2>
      <p className="mb-4">This is the React frontend for the Vision4-Seam demo application.</p>

      {user && (
        <div className="card mt-4">
          <p className="mb-1"><strong>Current user:</strong> {user.username}</p>
          <p className="mb-1"><strong>Role:</strong> {user.role}</p>
          <p>
            <strong>Access:</strong>{' '}
            {isAdmin
              ? 'Full access (view, create, edit, delete)'
              : isUser
              ? 'Read-only access (view people and locations)'
              : 'No data access (switch role using the header controls)'}
          </p>
        </div>
      )}
    </div>
  );
}
