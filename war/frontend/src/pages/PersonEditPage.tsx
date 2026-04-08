import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPerson, createPerson, updatePerson } from '../api/personApi';
import { fetchLocations } from '../api/locationApi';
import { LocationDto } from '../types';

interface PersonForm {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  locationIds: number[];
}

export default function PersonEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id;

  const [form, setForm] = useState<PersonForm>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    locationIds: [],
  });
  const [allLocations, setAllLocations] = useState<LocationDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadLocations();
    if (!isNew) {
      loadPerson();
    }
  }, [id]);

  async function loadLocations() {
    try {
      const data = await fetchLocations(true);
      setAllLocations(data);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function loadPerson() {
    try {
      const data = await fetchPerson(id!);
      setForm({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        dateOfBirth: data.dateOfBirth || '',
        locationIds: data.locations ? data.locations.map((l) => l.id) : [],
      });
    } catch (err: any) {
      setError(err.message);
    }
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleLocationToggle(locId: number) {
    setForm((prev) => {
      const ids = prev.locationIds.includes(locId)
        ? prev.locationIds.filter((x) => x !== locId)
        : [...prev.locationIds, locId];
      return { ...prev, locationIds: ids };
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (isNew) {
        await createPerson(form as unknown as Record<string, unknown>);
      } else {
        await updatePerson(id!, form as unknown as Record<string, unknown>);
      }
      navigate('/persons');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h2 className="page-title">{isNew ? 'Add Person' : 'Edit Person'}</h2>

      {error && <div className="error-msg">{error}</div>}

      <form onSubmit={handleSubmit} className="edit-form">
        <div className="form-group">
          <label htmlFor="firstName" className="form-label">First Name *</label>
          <input id="firstName" name="firstName" value={form.firstName} onChange={handleChange} required className="form-input" />
        </div>

        <div className="form-group">
          <label htmlFor="lastName" className="form-label">Last Name *</label>
          <input id="lastName" name="lastName" value={form.lastName} onChange={handleChange} required className="form-input" />
        </div>

        <div className="form-group">
          <label htmlFor="dateOfBirth" className="form-label">Date of Birth</label>
          <input id="dateOfBirth" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} className="form-input" />
        </div>

        <div className="form-group">
          <label className="form-label">Locations</label>
          <div className="checkbox-group">
            {allLocations.map((loc) => (
              <label key={loc.id} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.locationIds.includes(loc.id)}
                  onChange={() => handleLocationToggle(loc.id)}
                  className="w-auto"
                />
                {loc.locationName} ({loc.zipCode})
              </label>
            ))}
            {allLocations.length === 0 && <span className="text-muted">No active locations available.</span>}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn disabled:opacity-50" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/persons')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
