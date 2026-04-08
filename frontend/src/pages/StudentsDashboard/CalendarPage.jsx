import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import api from '../../api'; // Your Axios connection
import { FiCalendar, FiClock, FiInfo, FiAlertCircle } from 'react-icons/fi';
import 'react-calendar/dist/Calendar.css'; // Default styles
import '../../style/Calender.css'; // Your Custom Overrides

const CalendarPage = () => {
  const [date, setDate] = useState(new Date());
  const [allEvents, setAllEvents] = useState([]);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Events from Notifications Backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        // Changed endpoint from '/events' to your notification route
        const res = await api.get('/notifications', { headers: { 'x-auth-token': token } });
        setAllEvents(res.data);
        
        // Load events for today initially
        filterEventsForDate(new Date(), res.data);
      } catch (error) {
        console.error("Failed to load calendar events", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // 2. Filter Events when a date is clicked
  const filterEventsForDate = (selectedDate, eventsList = allEvents) => {
    const filtered = eventsList.filter(event => {
      // Use createdAt since your Notification schema uses it
      const eventDate = new Date(event.createdAt); 
      return (
        eventDate.getDate() === selectedDate.getDate() &&
        eventDate.getMonth() === selectedDate.getMonth() &&
        eventDate.getFullYear() === selectedDate.getFullYear()
      );
    });
    setSelectedEvents(filtered);
  };

  const onDateChange = (newDate) => {
    setDate(newDate);
    filterEventsForDate(newDate);
  };

  // 3. Helper: Add dots to calendar tiles if they have events
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const hasEvent = allEvents.some(event => {
        const eventDate = new Date(event.createdAt);
        return eventDate.getDate() === date.getDate() &&
               eventDate.getMonth() === date.getMonth() &&
               eventDate.getFullYear() === date.getFullYear();
      });
      return hasEvent ? <div className="mx-auto mt-1 h-2 w-2 rounded-full bg-red-500"></div> : null;
    }
  };

  // Helper: Badge Color based on Notification type
  const getTypeColor = (type) => {
      const lowerType = type ? type.toLowerCase() : 'notice';
      if(lowerType === 'holiday') return 'bg-red-100 text-red-600 border-red-200';
      if(lowerType === 'exam' || lowerType === 'alert') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      return 'bg-blue-100 text-blue-600 border-blue-200';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 animate-fade-in-up font-sans">
      
      {/* Header */}
      <div className="bg-white px-6 py-8 shadow-sm border-b border-gray-100">
        <div className="mx-auto max-w-5xl">
            <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-800">
                <span className="rounded-xl bg-red-100 p-2 text-red-500 flex items-center justify-center">
                    <FiCalendar size={24} />
                </span>
                Academic Calendar
            </h1>
            <p className="mt-2 text-gray-500">View upcoming holidays, exams, and school events.</p>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-5xl px-4">
        <div className="grid gap-8 lg:grid-cols-12">
          
          {/* LEFT: Calendar UI */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
              <Calendar 
                onChange={onDateChange} 
                value={date} 
                tileContent={tileContent}
                className="w-full border-none font-sans"
              />
            </div>
          </div>

          {/* RIGHT: Selected Date Details */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100 h-full min-h-[400px]">
              <h2 className="mb-4 flex flex-wrap items-center gap-2 text-xl font-bold text-gray-800 border-b pb-4">
                 Events for <span className="text-blue-600">{date.toLocaleDateString('en-IN', { month: 'long', day: 'numeric' })}</span>
              </h2>

              <div className="space-y-4">
                {selectedEvents.length > 0 ? (
                  selectedEvents.map((event, index) => (
                    <div 
                        key={event._id || index} 
                        className="group relative overflow-hidden rounded-xl border border-gray-100 bg-gray-50 p-4 transition-all hover:shadow-md hover:border-blue-500/30 hover:bg-white"
                    >
                      <div className={`mb-2 inline-block rounded-full px-3 py-1 text-xs font-bold border capitalize ${getTypeColor(event.type)}`}>
                        {event.type || 'Notice'}
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {event.title}
                      </h3>
                      {/* Changed event.description to event.message based on your schema */}
                      <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                        {event.message}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400">
                    <FiAlertCircle size={40} className="mb-2 opacity-20" />
                    <p>No events scheduled for this date.</p>
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CalendarPage;