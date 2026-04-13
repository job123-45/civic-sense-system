import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { AlertCircle, CheckCircle2, Clock, Users, MapPin, Search, Loader2 } from 'lucide-react';
import { getIssueStats } from '../services/api';
import { useToast } from '../context/ToastContext';
import './Dashboard.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Dashboard = ({ role }) => {
    const { addToast } = useToast();
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await getIssueStats();
                if (data.success) {
                    setStats(data.data);
                }
            } catch (err) {
                console.error("Failed to fetch stats", err);
                addToast("Failed to load dashboard metrics", "error");
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, [addToast]);

    if (isLoading) {
        return (
            <div className="dashboard-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Loader2 size={48} className="spin-icon text-primary" />
            </div>
        );
    }

    if (!stats) return null;

    // Format data for Recharts
    const categoryData = Object.keys(stats.categories).map(key => ({
        name: key,
        value: stats.categories[key]
    })).filter(data => data.value > 0);

    const statusData = Object.keys(stats.status).map(key => ({
        name: key,
        count: stats.status[key]
    }));

    if (role === 'citizen') {
        return (
            <div className="dashboard-container animate-fade-in">
                <header className="dashboard-header">
                    <div>
                        <h1 className="page-title">Welcome Home</h1>
                        <p className="text-muted">Thanks for keeping our city safe and clean.</p>
                    </div>
                </header>
                
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon-wrapper primary">
                            <MapPin size={24} />
                        </div>
                        <div className="stat-content">
                            <h3 className="stat-value">{stats.total}</h3>
                            <p className="stat-label">Reports Logged</p>
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-icon-wrapper warning">
                            <Clock size={24} />
                        </div>
                        <div className="stat-content">
                            <h3 className="stat-value">{stats.status['Open'] + stats.status['In Progress']}</h3>
                            <p className="stat-label">In Progress</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon-wrapper success">
                            <CheckCircle2 size={24} />
                        </div>
                        <div className="stat-content">
                            <h3 className="stat-value">{stats.status['Resolved'] + stats.status['Closed']}</h3>
                            <p className="stat-label">Resolved Issues</p>
                        </div>
                    </div>
                </div>

                <div className="dashboard-main-grid">
                    <div className="card chart-card">
                        <div className="card-header">
                            <h2 className="card-title">Your Reports by Category</h2>
                        </div>
                        <div className="chart-container" style={{ display: 'flex', justifyContent: 'center' }}>
                            {categoryData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-muted" style={{ padding: '40px' }}>No reports filed yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container animate-fade-in">
            <header className="dashboard-header">
                <div>
                    <h1 className="page-title">Dashboard Overview</h1>
                    <p className="text-muted">Real-time civic intelligence and complaint analytics.</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-primary" onClick={() => window.location.reload()}>Refresh Data</button>
                </div>
            </header>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon-wrapper warning">
                        <AlertCircle size={24} />
                    </div>
                    <div className="stat-content">
                        <h3 className="stat-value">{stats.total}</h3>
                        <p className="stat-label">Total Reports</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon-wrapper success">
                        <CheckCircle2 size={24} />
                    </div>
                    <div className="stat-content">
                        <h3 className="stat-value">{stats.status['Resolved'] + stats.status['Closed']}</h3>
                        <p className="stat-label">Resolved / Closed</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon-wrapper primary">
                        <Clock size={24} />
                    </div>
                    <div className="stat-content">
                        <h3 className="stat-value">{stats.status['Open']}</h3>
                        <p className="stat-label">Open / Action Required</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon-wrapper secondary">
                        <Users size={24} />
                    </div>
                    <div className="stat-content">
                        <h3 className="stat-value">{stats.status['In Progress']}</h3>
                        <p className="stat-label">Currently Working</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-main-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                <div className="card chart-card">
                    <div className="card-header">
                        <h2 className="card-title">Issues by Volume & Status</h2>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={statusData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip cursor={{fill: 'transparent'}} />
                                <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card chart-card">
                    <div className="card-header">
                        <h2 className="card-title">Issues by Category</h2>
                    </div>
                    <div className="chart-container">
                        {categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-muted" style={{ padding: '80px', textAlign: 'center' }}>No category data available.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
