import React, { useState, useEffect } from 'react';
import { Search, Filter, AlertCircle, CheckCircle2, Clock, MapPin, Loader2, Image as ImageIcon } from 'lucide-react';
import { getIssues, updateIssueStatus } from '../services/api';
import { useToast } from '../context/ToastContext';
import './TrackIssues.css';

const getStatusIcon = (status) => {
    if (status === 'Resolved' || status === 'Closed') return <CheckCircle2 className="text-success" size={18} />;
    if (status === 'Pending' || status === 'Open') return <Clock className="text-warning" size={18} />;
    return <AlertCircle className="text-primary" size={18} />;
};

const getStatusClass = (status) => {
    if (status === 'Resolved' || status === 'Closed') return 'status-badge success';
    if (status === 'Pending' || status === 'Open') return 'status-badge warning';
    return 'status-badge primary';
};

const CATEGORIES = ['All', 'Garbage', 'Road', 'Water', 'Electricity', 'Other'];
const STATUSES = ['All', 'Open', 'In Progress', 'Resolved', 'Closed'];

const TrackIssues = ({ role }) => {
    const { addToast } = useToast();
    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusUpdating, setStatusUpdating] = useState(false);

    // Filters & Sorting
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState('newest');

    const fetchIssues = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params = { sort: sortOrder };
            if (filterCategory !== 'All') params.category = filterCategory;
            if (filterStatus !== 'All') params.status = filterStatus;
            if (searchQuery) params.search = searchQuery;

            const { data } = await getIssues(params);
            if (data.success) {
                setReports(data.data);
                // Select the first report if none is selected or if the currently selected one is no longer in the list
                if (data.data.length > 0 && (!selectedReport || !data.data.find(r => r._id === selectedReport._id))) {
                    setSelectedReport(data.data[0]);
                } else if (data.data.length === 0) {
                    setSelectedReport(null);
                }
            }
        } catch (err) {
            console.error('Failed to fetch issues:', err);
            setError('Failed to load issues. Please try again later.');
            addToast('Failed to load issues', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Debounce search
        const timeoutId = setTimeout(() => {
            fetchIssues();
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [filterCategory, filterStatus, searchQuery, sortOrder]);

    const handleStatusUpdate = async (e) => {
        const newStatus = e.target.value;
        if (!selectedReport || newStatus === selectedReport.status) return;

        setStatusUpdating(true);
        try {
            const { data } = await updateIssueStatus(selectedReport._id, newStatus);
            if (data.success) {
                // Update local state
                const updatedReport = { ...selectedReport, status: newStatus };
                setSelectedReport(updatedReport);
                setReports(reports.map(r => (r._id === updatedReport._id ? updatedReport : r)));
                addToast(`Status updated to ${newStatus}`, 'success');
            }
        } catch (err) {
            console.error('Failed to update status:', err);
            addToast(err.response?.data?.message || 'Failed to update status', 'error');
        } finally {
            setStatusUpdating(false);
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const API_BASE = import.meta.env.VITE_API_URL || 'https://civic-backend.onrender.com';

    const getImageUrl = (imagePath) => {
         if (!imagePath) return null;
         if (imagePath.startsWith('http')) return imagePath; // External URLs (if any)
         return `${API_BASE}${imagePath}`; // Map to our backend static folder
    }

    return (
        <div className="track-container animate-fade-in">
            <header className="track-header">
                <div>
                    <h1 className="page-title">{role === 'official' ? 'Manage Intake Queue' : 'Track My Reports'}</h1>
                    <p className="text-muted">{role === 'official' ? 'Process and assign incoming civic issues.' : 'Monitor the real-time status of your civic complaints.'}</p>
                </div>
                <div className="header-actions">
                    <div className="search-bar">
                        <Search size={18} className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Search by title or location..." 
                            className="search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            {/* Filter Bar */}
            <div className="filter-bar card" style={{ padding: '16px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Filter size={16} className="text-muted" />
                    <span className="text-muted" style={{ fontWeight: 500 }}>Filters:</span>
                </div>
                
                <select 
                    className="form-control" 
                    style={{ width: 'auto', padding: '8px 12px', height: 'auto' }}
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                >
                    {CATEGORIES.map(cat => <option key={`cat-${cat}`} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>)}
                </select>

                <select 
                    className="form-control" 
                    style={{ width: 'auto', padding: '8px 12px', height: 'auto' }}
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    {STATUSES.map(stat => <option key={`stat-${stat}`} value={stat}>{stat === 'All' ? 'All Statuses' : stat}</option>)}
                </select>

                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="text-muted" style={{ fontWeight: 500, fontSize: '0.875rem' }}>Sort by:</span>
                    <select 
                        className="form-control" 
                        style={{ width: 'auto', padding: '8px 12px', height: 'auto' }}
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                    </select>
                </div>
            </div>

            <div className="track-layout">
                <div className="reports-sidebar card">
                    {isLoading ? (
                        <div className="loading-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', gap: '12px' }}>
                            <Loader2 size={32} className="spin-icon text-primary" />
                            <p className="text-muted">Loading issues...</p>
                        </div>
                    ) : error ? (
                        <div className="empty-state" style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--color-danger)' }}>
                            <AlertCircle size={32} style={{ margin: '0 auto 12px' }} />
                            <p>{error}</p>
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="empty-state" style={{ padding: '40px 20px', textAlign: 'center' }}>
                            <p className="text-muted">No issues found matching your criteria.</p>
                        </div>
                    ) : (
                        <div className="reports-list">
                            {reports.map(report => (
                                <div
                                    key={report._id}
                                    className={`report-list-item ${selectedReport?._id === report._id ? 'active' : ''}`}
                                    onClick={() => setSelectedReport(report)}
                                >
                                    <div className="item-header">
                                        <span className="item-id">#{report._id.substring(report._id.length - 6).toUpperCase()}</span>
                                        <span className={getStatusClass(report.status)}>{report.status}</span>
                                    </div>
                                    <h3 className="item-title">{report.title}</h3>
                                    <div className="item-meta">
                                        <span>{formatDate(report.createdAt)}</span>
                                        <span>&bull;</span>
                                        <span>{report.category}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="report-detail card">
                    {selectedReport ? (
                        <div className="detail-content animate-fade-in" key={selectedReport._id}>
                            <div className="detail-header">
                                <div className="detail-title-group">
                                    <h2>{selectedReport.title}</h2>
                                    <span className={getStatusClass(selectedReport.status)}>{selectedReport.status}</span>
                                    
                                    {/* Admin Status Update Dropdown */}
                                    {role === 'official' && (
                                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span className="text-muted" style={{ fontSize: '0.875rem' }}>Update Status:</span>
                                            <select 
                                                className="form-control" 
                                                style={{ width: 'auto', padding: '6px 12px' }}
                                                value={selectedReport.status}
                                                onChange={handleStatusUpdate}
                                                disabled={statusUpdating}
                                            >
                                                <option value="Open">Open</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Resolved">Resolved</option>
                                                <option value="Closed">Closed</option>
                                            </select>
                                            {statusUpdating && <Loader2 size={16} className="spin-icon text-primary" />}
                                        </div>
                                    )}
                                </div>
                                <p className="detail-id">
                                    Report ID: {selectedReport._id} | Filed on {formatDate(selectedReport.createdAt)}
                                    {selectedReport.createdBy && ` by ${selectedReport.createdBy.name}`}
                                </p>
                            </div>

                            <div className="evidence-panel">
                                {selectedReport.image ? (
                                    <div className="evidence-image-container" style={{ maxHeight: '400px', overflow: 'hidden', borderRadius: 'var(--border-radius-md)' }}>
                                        <img 
                                            src={getImageUrl(selectedReport.image)} 
                                            alt="Report Evidence" 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e) => {
                                                e.target.onerror = null; 
                                                e.target.src = 'https://via.placeholder.com/800x400?text=Image+Not+Found';
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div style={{ padding: '40px', backgroundColor: 'var(--color-bg-app)', borderRadius: 'var(--border-radius-md)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                                        <ImageIcon size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
                                        <p>No image attached to this report.</p>
                                    </div>
                                )}
                                
                                <div className="evidence-meta" style={{ marginTop: '24px' }}>
                                    <h3>Description</h3>
                                    <p className="evidence-desc" style={{ fontSize: '1rem', lineHeight: '1.6' }}>{selectedReport.description}</p>
                                </div>
                            </div>

                            <div className="detail-info-grid">
                                <div className="info-box">
                                    <span className="info-label">Category</span>
                                    <span className="info-value">{selectedReport.category}</span>
                                </div>
                                <div className="info-box">
                                    <span className="info-label">Assigned To</span>
                                    <span className="info-value">{selectedReport.assignedTo ? selectedReport.assignedTo.name : 'Unassigned'}</span>
                                </div>
                                <div className="info-box location">
                                    <span className="info-label"><MapPin size={14} /> Location</span>
                                    <span className="info-value">{selectedReport.location}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="empty-state">
                            {isLoading ? 'Loading details...' : 'Select a report to view details'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrackIssues;
