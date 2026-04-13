import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Upload, MapPin, CheckCircle, Send, AlertCircle, Loader2, Map as MapIcon, Crosshair } from 'lucide-react';
import { createIssue } from '../services/api';
import { useToast } from '../context/ToastContext';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './ReportIssue.css';

// Fix Leaflet's default icon paths issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const CATEGORIES = ['Garbage', 'Road', 'Water', 'Electricity', 'Other'];

// Component to handle map clicks
const LocationMarker = ({ position, setPosition, fetchPincode }) => {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
            if (fetchPincode) fetchPincode(e.latlng.lat, e.latlng.lng);
        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
};

// Component to recenter map when getting current location
const RecenterMap = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.flyTo(position, 15);
        }
    }, [position, map]);
    return null;
};

const ReportIssue = ({ role }) => {
    const { addToast } = useToast();
    if (role === 'official') {
        return <Navigate to="/dashboard" replace />;
    }

    const [form, setForm] = useState({
        title: '',
        description: '',
        category: '',
        location: '', // This will now store the pincode
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [isFetchingPincode, setIsFetchingPincode] = useState(false);
    
    // Map state
    const defaultPosition = { lat: 28.6139, lng: 77.2090 }; // Default to New Delhi or anywhere
    const [position, setPosition] = useState(null);
    const [isLocating, setIsLocating] = useState(false);

    const fetchPincode = async (lat, lng) => {
        setIsFetchingPincode(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();
            
            if (data && data.address && data.address.postcode) {
                setForm(prev => ({ ...prev, location: data.address.postcode }));
                addToast('Pincode retrieved automatically.', 'success');
            } else {
                setForm(prev => ({ ...prev, location: '' }));
                addToast('Pincode not found for this location. Please enter manually.', 'warning');
            }
        } catch (err) {
            console.error("Geocoding error", err);
            setForm(prev => ({ ...prev, location: '' }));
            addToast('Error fetching pincode. Please enter manually.', 'error');
        } finally {
            setIsFetchingPincode(false);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                setError('Image must be under 5MB');
                addToast('Image must be under 5MB', 'error');
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleGetCurrentLocation = (e) => {
        e.preventDefault();
        if (!navigator.geolocation) {
            addToast('Geolocation is not supported by your browser', 'error');
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setPosition(newPos);
                setIsLocating(false);
                fetchPincode(newPos.lat, newPos.lng);
            },
            (err) => {
                setIsLocating(false);
                addToast('Unable to retrieve your location', 'error');
            }
        );
    };

    const resetForm = () => {
        setForm({ title: '', description: '', category: '', location: '' });
        setImageFile(null);
        setImagePreview(null);
        setPosition(null);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!form.title || !form.description || !form.location) {
            setError('Please fill in all required text fields');
            addToast('Please fill in all required fields', 'error');
            return;
        } // ... rest of file logic
        
        if (!position) {
            setError('Please pin the location on the map');
            addToast('Please pin the location on the map', 'error');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('description', form.description);
            // Ensure category is appended properly, even if empty (triggers AI backend)
            formData.append('category', form.category || 'Other');
            formData.append('location', form.location); // Sending pincode here
            formData.append('lat', position.lat);
            formData.append('lng', position.lng);
            
            if (imageFile) {
                formData.append('image', imageFile);
            }

            await createIssue(formData);
            setSubmitted(true);
            addToast('Report submitted successfully!', 'success');
        } catch (err) {
            const message =
                err.response?.data?.message ||
                'Failed to submit issue. Please try again.';
            setError(message);
            addToast(message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="report-container animate-fade-in success-state">
                <div className="success-icon">
                    <CheckCircle size={64} />
                </div>
                <h2>Report Submitted Successfully!</h2>
                <p>Your issue has been logged, automatically classified if necessary, and will be reviewed by the authorities.</p>
                <button
                    className="btn btn-primary mt-4"
                    onClick={() => { setSubmitted(false); resetForm(); }}
                >
                    Submit Another Issue
                </button>
            </div>
        );
    }

    return (
        <div className="report-container animate-fade-in">
            <header className="report-header">
                <h1 className="page-title">Report an Issue</h1>
                <p className="text-muted">Help improve your community by reporting civic issues.</p>
            </header>

            {error && (
                <div className="report-error animate-fade-in">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}

            <div className="report-grid">
                <div className="form-section card">
                    <h2 className="card-title">1. Location Data</h2>
                    <div className="form-group">
                        <label className="form-label">
                            <MapIcon size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                            Pin Location on Map *
                        </label>
                        <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '8px' }}>
                            Click on the map or use your current location to pinpoint the issue.
                        </p>
                        
                        <div style={{ height: '250px', width: '100%', borderRadius: 'var(--border-radius-md)', overflow: 'hidden', marginBottom: '12px', border: '1px solid var(--color-border)', opacity: isFetchingPincode ? 0.7 : 1 }}>
                            <MapContainer 
                                center={position || defaultPosition} 
                                zoom={12} 
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <LocationMarker position={position} setPosition={setPosition} fetchPincode={fetchPincode} />
                                {position && <RecenterMap position={position} />}
                            </MapContainer>
                        </div>
                        
                        <button 
                            type="button" 
                            className="btn btn-outline" 
                            style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
                            onClick={handleGetCurrentLocation}
                            disabled={isLocating || isFetchingPincode}
                        >
                            {isLocating ? <Loader2 size={16} className="spin-icon" /> : <Crosshair size={16} />}
                            {isLocating ? 'Locating...' : 'Use Current Location'}
                        </button>
                    </div>

                    <div className="form-group mt-4">
                        <label className="form-label">
                            Pincode * 
                            {isFetchingPincode && <Loader2 size={12} className="spin-icon" style={{ marginLeft: '8px', display: 'inline', color: 'var(--color-primary)' }} />}
                        </label>
                        <input
                            type="text"
                            name="location"
                            className="form-control"
                            placeholder="e.g. 110001 (Auto-filled on map click)"
                            value={form.location}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="form-section card">
                    <h2 className="card-title">2. Issue Details</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Title *</label>
                            <input
                                type="text"
                                name="title"
                                className="form-control"
                                placeholder="e.g. Large pothole on Main Street"
                                value={form.title}
                                onChange={handleChange}
                                maxLength={120}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <select
                                name="category"
                                className="form-control"
                                value={form.category}
                                onChange={handleChange}
                            >
                                <option value="">Auto-Detect via AI</option>
                                {CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                                Leave blank to let the AI auto-classify based on description.
                            </p>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description *</label>
                            <textarea
                                name="description"
                                className="form-control"
                                rows="3"
                                placeholder="Describe the issue in detail..."
                                value={form.description}
                                onChange={handleChange}
                                maxLength={2000}
                                required
                            ></textarea>
                        </div>

                        <div className="form-group" style={{ marginTop: '16px' }}>
                            <label className="form-label">Upload Evidence (Optional)</label>
                            <div className="upload-dropzone" style={{ minHeight: '120px' }}>
                                <input
                                    type="file"
                                    id="fileUpload"
                                    className="file-input"
                                    onChange={handleFileChange}
                                    accept="image/*"
                                />
                                <label htmlFor="fileUpload" className="upload-label" style={{ padding: '20px' }}>
                                    {imagePreview ? (
                                        <div className="image-preview" style={{ height: '100px' }}>
                                            <img src={imagePreview} alt="Preview" style={{ objectFit: 'contain' }} />
                                            <div className="reupload-overlay">Change image</div>
                                        </div>
                                    ) : (
                                        <div className="upload-placeholder">
                                            <Upload size={24} className="upload-icon" style={{ marginBottom: '8px' }} />
                                            <p className="upload-text" style={{ fontSize: '0.85rem' }}>Upload photo evidence</p>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary submit-btn"
                            disabled={isSubmitting || !position}
                            style={{ width: '100%', marginTop: 'auto' }}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={18} className="spin-icon" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send size={18} />
                                    Submit Report
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ReportIssue;
