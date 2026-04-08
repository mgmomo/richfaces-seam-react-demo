import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchPersons, deletePerson } from '../api/personApi';
import { useAuth } from '../context/AuthContext';
import { PersonDto } from '../types';

export default function PersonListPage() {
  const [persons, setPersons] = useState<PersonDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadPersons();
  }, []);

  async function loadPersons() {
    try {
      setError(null);
      const data = await fetchPersons();
      setPersons(data);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Delete person "${name}"?`)) return;
    try {
      await deletePerson(id);
      loadPersons();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title mb-0">People</h2>
        {isAdmin && (
          <Link to="/persons/new" className="btn">Add Person</Link>
        )}
      </div>

      {error && <div className="error-msg">{error}</div>}

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Date of Birth</th>
            <th>Locations</th>
            {isAdmin && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {persons.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.firstName}</td>
              <td>{p.lastName}</td>
              <td>{p.dateOfBirth || ''}</td>
              <td>{p.locations ? p.locations.map((l) => l.locationName).join(', ') : ''}</td>
              {isAdmin && (
                <td>
                  <div className="flex gap-1">
                    <Link to={`/persons/${p.id}/edit`} className="btn btn-sm">Edit</Link>
                    <button onClick={() => handleDelete(p.id, p.firstName + ' ' + p.lastName)} className="btn btn-sm btn-danger">Delete</button>
                  </div>
                </td>
              )}
            </tr>
          ))}
          {persons.length === 0 && (
            <tr><td colSpan={isAdmin ? 6 : 5} className="table-empty">No people found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
