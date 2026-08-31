import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/axios';
import { AuthContext } from '../context/AuthContext';
import { FaCalendarAlt, FaMapMarkerAlt, FaChair, FaMoneyBillWave, FaCheckCircle, FaClock } from 'react-icons/fa';

const EventDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [event, setEvent] = useState(null);
    const [existingBooking, setExistingBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [otp, setOtp] = useState('');
    const [showOTP, setShowOTP] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        const fetchEventAndBooking = async () => {
            try {
                const { data: eventData } = await api.get(`/events/${id}`);
                setEvent(eventData);

                if (user) {
                    try {
                        const { data: userBookings } = await api.get('/bookings/my');
                        const matched = userBookings.find(
                            (b) => (b.eventId?._id === id || b.eventId === id) && b.status !== 'cancelled'
                        );
                        if (matched) {
                            setExistingBooking(matched);
                        }
                    } catch (bookingErr) {
                        console.error('Error fetching user booking status:', bookingErr);
                    }
                }
            } catch (err) {
                setError('Failed to load event details.');
            } finally {
                setLoading(false);
            }
        };
        fetchEventAndBooking();
    }, [id, user]);

    const handleBooking = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        setBookingLoading(true);
        setError('');
        setSuccessMsg('');

        try {
            if (!showOTP) {
                await api.post('/bookings/send-otp');
                setShowOTP(true);
                setSuccessMsg('OTP sent to your email. Please enter the code below.');
            } else {
                const { data } = await api.post('/bookings', { eventId: event._id, otp });
                setSuccessMsg('Booking requested! Awaiting admin confirmation.');
                setShowOTP(false);
                setExistingBooking(data.booking);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Booking failed. Please try again.');
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) return <div className="text-center py-20 text-xl font-semibold">Loading event details...</div>;
    if (error && !event) return <div className="text-center py-20 text-xl text-red-500">{error || 'Event not found'}</div>;

    const isSoldOut = event.availableSeats <= 0;

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden mt-8 border border-gray-100">
            {event.image ? (
                <img src={event.image} alt={event.title} className="w-full h-80 object-cover" />
            ) : (
                <div className="w-full h-64 bg-gray-900 flex items-center justify-center text-white/50 text-6xl font-black uppercase tracking-widest">
                    {event.category}
                </div>
            )}

            <div className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
                    <div className="flex-1">
                        <div className="inline-block bg-gray-200 text-gray-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-3">
                            {event.category}
                        </div>
                        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{event.title}</h1>
                        <p className="text-gray-600 text-lg leading-relaxed mb-6">{event.description}</p>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 min-w-[320px] w-full md:w-auto shrink-0 shadow-sm">
                        <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-3 border-gray-200">Booking Details</h3>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-4 text-gray-600">
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-900 shrink-0">
                                    <FaMoneyBillWave />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase">Ticket Price</p>
                                    <p className="font-bold text-gray-800 text-lg">
                                        {event.ticketPrice === 0 ? <span className="text-green-600 font-extrabold">Free</span> : `₹${event.ticketPrice}`}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-gray-600">
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-900 shrink-0">
                                    <FaChair />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase">Availability</p>
                                    <p className="font-bold text-gray-800">
                                        <span className={event.availableSeats < 10 ? 'text-orange-500 font-bold' : ''}>{event.availableSeats}</span> / {event.totalSeats} seats remaining
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-gray-600">
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-900 shrink-0">
                                    <FaCalendarAlt />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase">Date</p>
                                    <p className="font-bold text-gray-800">{new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-gray-600">
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-900 shrink-0">
                                    <FaMapMarkerAlt />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase">Location</p>
                                    <p className="font-bold text-gray-800">{event.location}</p>
                                </div>
                            </div>
                        </div>

                        {existingBooking ? (
                            <div className="bg-white p-4 rounded-xl border border-gray-200 text-center shadow-sm">
                                {existingBooking.status === 'confirmed' ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <FaCheckCircle className="text-green-500 text-3xl" />
                                        <p className="font-extrabold text-gray-900 text-lg">Booking Confirmed!</p>
                                        <p className="text-xs text-gray-500 mb-2">You are registered for this event.</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <FaClock className="text-yellow-500 text-3xl" />
                                        <p className="font-extrabold text-gray-900 text-lg">Booking Pending</p>
                                        <p className="text-xs text-gray-500 mb-2">Awaiting admin review and approval.</p>
                                    </div>
                                )}
                                <Link
                                    to="/dashboard"
                                    className="block mt-2 w-full py-2 bg-gray-900 hover:bg-black text-white text-sm font-bold rounded-lg transition"
                                >
                                    View in Dashboard
                                </Link>
                            </div>
                        ) : (
                            <>
                                {showOTP && (
                                    <div className="mb-4">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Enter 6-digit OTP Code</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="123456"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gray-900 outline-none transition shadow-sm font-bold tracking-widest text-center text-xl text-gray-900"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            maxLength="6"
                                        />
                                    </div>
                                )}

                                <button
                                    onClick={handleBooking}
                                    disabled={isSoldOut || bookingLoading || (showOTP && !otp)}
                                    className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition shadow-lg ${isSoldOut || (successMsg && !showOTP)
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-gray-900 hover:bg-black text-white hover:shadow-xl hover:-translate-y-0.5'
                                        }`}
                                >
                                    {bookingLoading
                                        ? 'Processing...'
                                        : showOTP
                                            ? 'Verify OTP & Submit Request'
                                            : successMsg && !showOTP
                                                ? 'Request Submitted'
                                                : isSoldOut
                                                    ? 'Sold Out'
                                                    : 'Confirm Registration'}
                                </button>
                            </>
                        )}

                        {error && <p className="text-red-500 mt-4 text-center text-sm font-medium bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}
                        {successMsg && <p className="text-green-700 mt-4 text-center text-sm font-medium bg-green-50 p-3 rounded-xl border border-green-100">{successMsg}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetail;