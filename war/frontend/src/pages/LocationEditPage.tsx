import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchLocation, createLocation, updateLocation } from '../api/locationApi';

interface LocationForm {
  locationName: string;
  address: string;
  zipCode: string;
  state: string;
}

export default function LocationEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id;

  const [form, setForm] = useState<LocationForm>({
    locationName: '',
    address: '',
    zipCode: '',
    state: 'ACTIVE',
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isNew) {
      loadLocation();
    }
  }, [id]);

  async function loadLocation() {
    try {
      const data = await fetchLocation(id!);
      setForm({
        locationName: data.locationName || '',
        address: data.address || '',
        zipCode: data.zipCode || '',
        state: data.state || 'ACTIVE',
      });
    } catch (err: any) {
      setError(err.message);
    }
  }

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (isNew) {
        await createLocation(form as unknown as Record<string, unknown>);
      } else {
        await updateLocation(id!, form as unknown as Record<string, unknown>);
      }
      navigate('/locations');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h2 className="page-title">{isNew ? 'Add Location' : 'Edit Location'}</h2>

      {error && <div className="error-msg">{error}</div>}

      <form onSubmit={handleSubmit} className="edit-form">
        <div className="form-group">
          <label htmlFor="locationName" className="form-label">Location Name *</label>
          <input id="locationName" name="locationName" value={form.locationName} onChange={handleChange} required className="form-input" />
        </div>

        <div className="form-group">
          <label htmlFor="address" className="form-label">Address</label>
          <input id="address" name="address" value={form.address} onChange={handleChange} className="form-input" />
        </div>

        <div className="form-group">
          <label htmlFor="zipCode" className="form-label">Zip Code</label>
          <input id="zipCode" name="zipCode" value={form.zipCode} onChange={handleChange} className="form-input" />
        </div>

        <div className="form-group">
          <label htmlFor="state" className="form-label">State</label>
          <select id="state" name="state" value={form.state} onChange={handleChange} className="form-input">
            <option value="ACTIVE">Active</option>
            <option value="NOT_ACTIVE">Not Active</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn disabled:opacity-50" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/locations')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
