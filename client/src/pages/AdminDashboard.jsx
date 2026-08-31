import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import { AuthContext } from '../context/AuthContext';
import {
    FaTicketAlt, FaCalendarAlt, FaPlus, FaEdit, FaTrash, FaCheck, FaTimes,
    FaMoneyBillWave, FaClock, FaUsers, FaChartLine, FaCheckCircle, FaExclamationTriangle
} from 'react-icons/fa';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' or 'events'
    const [bookings, setBookings] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bookingFilter, setBookingFilter] = useState('all'); // 'all', 'pending', 'confirmed', 'cancelled'
    const [actionLoading, setActionLoading] = useState(null);
    const [feedback, setFeedback] = useState({ message: '', type: '' });

    // Modal state for Create / Edit Event
    const [showEventModal, setShowEventModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [eventForm, setEventForm] = useState({
        title: '',
        description: '',
        date: '',
        location: '',
        category: 'Technology',
        totalSeats: 50,
        ticketPrice: 0,
        image: ''
    });

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/login');
            return;
        }
        fetchDashboardData();
    }, [user, navigate]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [bookingsRes, eventsRes] = await Promise.all([
                api.get('/bookings/my'),
                api.get('/events')
            ]);
            setBookings(bookingsRes.data);
            setEvents(eventsRes.data);
        } catch (err) {
            console.error('Error loading admin dashboard data:', err);
            showFeedback('Failed to load dashboard data.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showFeedback = (message, type = 'success') => {
        setFeedback({ message, type });
        setTimeout(() => setFeedback({ message: '', type: '' }), 4000);
    };

    const handleConfirmBooking = async (bookingId, paymentStatus) => {
        setActionLoading(bookingId);
        try {
            await api.put(`/bookings/${bookingId}/confirm`, { paymentStatus });
            showFeedback(`Booking confirmed (${paymentStatus === 'paid' ? 'Paid' : 'Not Paid'}). Notification email sent.`);
            fetchDashboardData();
        } catch (err) {
            showFeedback(err.response?.data?.message || 'Failed to confirm booking.', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel/reject this booking request?')) return;
        setActionLoading(bookingId);
        try {
            await api.delete(`/bookings/${bookingId}`);
            showFeedback('Booking cancelled successfully.');
            fetchDashboardData();
        } catch (err) {
            showFeedback(err.response?.data?.message || 'Failed to cancel booking.', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleOpenCreateModal = () => {
        setEditingEvent(null);
        setEventForm({
            title: '',
            description: '',
            date: '',
            location: '',
            category: 'Technology',
            totalSeats: 50,
            ticketPrice: 0,
            image: ''
        });
        setShowEventModal(true);
    };

    const handleOpenEditModal = (eventObj) => {
        setEditingEvent(eventObj);
        setEventForm({
            title: eventObj.title || '',
            description: eventObj.description || '',
            date: eventObj.date ? new Date(eventObj.date).toISOString().split('T')[0] : '',
            location: eventObj.location || '',
            category: eventObj.category || 'Technology',
            totalSeats: eventObj.totalSeats || 50,
            ticketPrice: eventObj.ticketPrice || 0,
            image: eventObj.image || ''
        });
        setShowEventModal(true);
    };

    const handleSaveEvent = async (e) => {
        e.preventDefault();
        try {
            if (editingEvent) {
                await api.put(`/events/${editingEvent._id}`, eventForm);
                showFeedback('Event updated successfully!');
            } else {
                await api.post('/events', eventForm);
                showFeedback('New event created successfully!');
            }
            setShowEventModal(false);
            fetchDashboardData();
        } catch (err) {
            showFeedback(err.response?.data?.message || 'Failed to save event.', 'error');
        }
    };

    const handleDeleteEvent = async (eventId) => {
        if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;
        try {
            await api.delete(`/events/${eventId}`);
            showFeedback('Event deleted successfully.');
            fetchDashboardData();
        } catch (err) {
            showFeedback(err.response?.data?.message || 'Failed to delete event.', 'error');
        }
    };

    // Calculate Analytics
    const pendingBookingsCount = bookings.filter(b => b.status === 'pending').length;
    const confirmedPaidBookingsCount = bookings.filter(b => b.status === 'confirmed' && b.paymentStatus === 'paid').length;
    const totalRevenue = bookings
        .filter(b => b.status === 'confirmed' && b.paymentStatus === 'paid')
        .reduce((sum, b) => sum + (b.amount || 0), 0);

    const filteredBookings = bookings.filter(b => {
        if (bookingFilter === 'all') return true;
        return b.status === bookingFilter;
    });

    if (loading) return <div className="text-center py-20 text-xl font-semibold">Loading Admin Dashboard...</div>;

    return (
        <div className="max-w-7xl mx-auto pb-12">
            {/* Top Banner */}
            <div className="bg-gray-900 text-white rounded-3xl p-8 mb-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <span className="bg-white/10 text-white backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-white/20">
                        Admin Portal
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-extrabold mt-3">Organizer Dashboard</h1>
                    <p className="text-gray-400 text-sm sm:text-base mt-1">Manage events, approve booking requests, and track real-time platform revenue.</p>
                </div>
                <button
                    onClick={handleOpenCreateModal}
                    className="bg-white text-gray-900 hover:bg-gray-100 px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition hover:-translate-y-0.5"
                >
                    <FaPlus /> Create New Event
                </button>
            </div>

            {/* Notification Toast */}
            {feedback.message && (
                <div className={`mb-6 p-4 rounded-xl font-semibold text-sm border shadow-sm flex items-center justify-between ${feedback.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'
                    }`}>
                    <span>{feedback.message}</span>
                    <button onClick={() => setFeedback({ message: '', type: '' })} className="font-bold text-lg">&times;</button>
                </div>
            )}

            {/* Analytics Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-yellow-50 text-yellow-600 flex items-center justify-center text-2xl shrink-0">
                        <FaClock />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Pending Requests</p>
                        <p className="text-3xl font-extrabold text-gray-900">{pendingBookingsCount}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center text-2xl shrink-0">
                        <FaCheckCircle />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Confirmed Paid Clients</p>
                        <p className="text-3xl font-extrabold text-gray-900">{confirmedPaidBookingsCount}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl shrink-0">
                        <FaMoneyBillWave />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Total Revenue</p>
                        <p className="text-3xl font-extrabold text-gray-900">₹{totalRevenue.toLocaleString()}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl shrink-0">
                        <FaCalendarAlt />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Total Events</p>
                        <p className="text-3xl font-extrabold text-gray-900">{events.length}</p>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 mb-8">
                <button
                    onClick={() => setActiveTab('bookings')}
                    className={`pb-4 px-6 font-bold text-lg border-b-2 transition flex items-center gap-2 ${activeTab === 'bookings'
                        ? 'border-gray-900 text-gray-900'
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                        }`}
                >
                    <FaTicketAlt /> Booking Requests ({bookings.length})
                </button>
                <button
                    onClick={() => setActiveTab('events')}
                    className={`pb-4 px-6 font-bold text-lg border-b-2 transition flex items-center gap-2 ${activeTab === 'events'
                        ? 'border-gray-900 text-gray-900'
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                        }`}
                >
                    <FaCalendarAlt /> Manage Events ({events.length})
                </button>
            </div>

            {/* TAB 1: BOOKING REQUESTS */}
            {activeTab === 'bookings' && (
                <div>
                    {/* Status Filter Sub-tabs */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {['all', 'pending', 'confirmed', 'cancelled'].map(status => (
                            <button
                                key={status}
                                onClick={() => setBookingFilter(status)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition ${bookingFilter === status
                                    ? 'bg-gray-900 text-white shadow-sm'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    {filteredBookings.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm text-gray-500">
                            No booking requests found for status "{bookingFilter}".
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 text-gray-500 uppercase text-xs font-extrabold tracking-wider border-b border-gray-100">
                                            <th className="p-4">User</th>
                                            <th className="p-4">Event</th>
                                            <th className="p-4">Amount</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4">Payment</th>
                                            <th className="p-4">Requested At</th>
                                            <th className="p-4 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-sm">
                                        {filteredBookings.map((b) => (
                                            <tr key={b._id} className="hover:bg-gray-50/50 transition">
                                                <td className="p-4">
                                                    <p className="font-bold text-gray-900">{b.userId?.name || 'N/A'}</p>
                                                    <p className="text-xs text-gray-500">{b.userId?.email || 'N/A'}</p>
                                                </td>
                                                <td className="p-4 font-semibold text-gray-800">
                                                    {b.eventId?.title || <span className="text-red-400 italic">Deleted Event</span>}
                                                </td>
                                                <td className="p-4 font-bold text-gray-900">
                                                    {b.amount === 0 ? <span className="text-green-600">Free</span> : `₹${b.amount}`}
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${b.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                        b.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {b.status}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${b.paymentStatus === 'paid' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                                        }`}>
                                                        {b.paymentStatus.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-gray-500">
                                                    {new Date(b.bookedAt || b.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="p-4 text-center">
                                                    {b.status === 'pending' ? (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => handleConfirmBooking(b._id, 'paid')}
                                                                disabled={actionLoading === b._id}
                                                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm"
                                                                title="Confirm & Mark Paid"
                                                            >
                                                                <FaCheck /> Confirm (Paid)
                                                            </button>
                                                            <button
                                                                onClick={() => handleConfirmBooking(b._id, 'not_paid')}
                                                                disabled={actionLoading === b._id}
                                                                className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm"
                                                                title="Confirm & Mark Unpaid"
                                                            >
                                                                <FaCheck /> Confirm (Unpaid)
                                                            </button>
                                                            <button
                                                                onClick={() => handleCancelBooking(b._id)}
                                                                disabled={actionLoading === b._id}
                                                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm"
                                                                title="Reject Request"
                                                            >
                                                                <FaTimes /> Reject
                                                            </button>
                                                        </div>
                                                    ) : b.status === 'confirmed' ? (
                                                        <button
                                                            onClick={() => handleCancelBooking(b._id)}
                                                            disabled={actionLoading === b._id}
                                                            className="text-red-500 hover:text-red-700 text-xs font-bold hover:underline"
                                                        >
                                                            Cancel Booking
                                                        </button>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs italic">No actions</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* TAB 2: EVENT MANAGEMENT */}
            {activeTab === 'events' && (
                <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map((eventObj) => (
                            <div key={eventObj._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition">
                                <div className="h-40 bg-gray-100 relative overflow-hidden">
                                    {eventObj.image ? (
                                        <img src={eventObj.image} alt={eventObj.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold uppercase tracking-widest text-lg">
                                            {eventObj.category}
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-extrabold shadow-sm">
                                        {eventObj.ticketPrice === 0 ? <span className="text-green-600">FREE</span> : `₹${eventObj.ticketPrice}`}
                                    </div>
                                </div>

                                <div className="p-6 flex-grow flex flex-col">
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">{eventObj.category}</div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">{eventObj.title}</h3>
                                    <p className="text-gray-500 text-xs line-clamp-2 mb-4">{eventObj.description}</p>

                                    <div className="mt-auto space-y-2 text-xs text-gray-600 border-t border-gray-50 pt-4 mb-4">
                                        <p><strong>Date:</strong> {new Date(eventObj.date).toLocaleDateString()}</p>
                                        <p><strong>Location:</strong> {eventObj.location}</p>
                                        <p><strong>Seats:</strong> <span className="font-bold text-gray-900">{eventObj.availableSeats}</span> / {eventObj.totalSeats} available</p>
                                    </div>

                                    <div className="flex gap-2 shrink-0">
                                        <button
                                            onClick={() => handleOpenEditModal(eventObj)}
                                            className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-lg text-xs transition flex items-center justify-center gap-1"
                                        >
                                            <FaEdit /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteEvent(eventObj._id)}
                                            className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg text-xs transition flex items-center justify-center"
                                            title="Delete Event"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Create / Edit Event Modal */}
            {showEventModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative my-8">
                        <h2 className="text-2xl font-extrabold text-gray-900 mb-6">
                            {editingEvent ? 'Edit Event' : 'Create New Event'}
                        </h2>

                        <form onSubmit={handleSaveEvent} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Event Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-gray-900 outline-none text-sm font-medium"
                                    value={eventForm.title}
                                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Description</label>
                                <textarea
                                    rows="3"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-gray-900 outline-none text-sm font-medium"
                                    value={eventForm.description}
                                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-gray-900 outline-none text-sm font-medium"
                                        value={eventForm.date}
                                        onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Category</label>
                                    <select
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-gray-900 outline-none text-sm font-medium"
                                        value={eventForm.category}
                                        onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                                    >
                                        <option value="Technology">Technology</option>
                                        <option value="Music">Music</option>
                                        <option value="Business">Business</option>
                                        <option value="Workshop">Workshop</option>
                                        <option value="Sports">Sports</option>
                                        <option value="General">General</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Location</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-gray-900 outline-none text-sm font-medium"
                                        value={eventForm.location}
                                        onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Total Capacity / Seats</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-gray-900 outline-none text-sm font-medium"
                                        value={eventForm.totalSeats}
                                        onChange={(e) => setEventForm({ ...eventForm, totalSeats: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Ticket Price (₹) - 0 for Free</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-gray-900 outline-none text-sm font-medium"
                                        value={eventForm.ticketPrice}
                                        onChange={(e) => setEventForm({ ...eventForm, ticketPrice: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Image URL (Optional)</label>
                                    <input
                                        type="url"
                                        placeholder="https://images.unsplash.com/..."
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-gray-900 outline-none text-sm font-medium"
                                        value={eventForm.image}
                                        onChange={(e) => setEventForm({ ...eventForm, image: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setShowEventModal(false)}
                                    className="px-6 py-3 rounded-xl text-gray-600 hover:bg-gray-100 font-bold text-sm transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-sm transition shadow-md"
                                >
                                    {editingEvent ? 'Update Event' : 'Create Event'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;