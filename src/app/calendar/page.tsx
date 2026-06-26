"use client";

import { ChevronLeft, Calendar as CalendarIcon, Layers, Clock, Users, MapPin, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { formatEventDate } from "@/lib/demo-data";
import Link from "next/link";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  parseISO
} from "date-fns";

export default function CalendarPage() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  useEffect(() => {
    async function fetchEvents() {
      try {
        const { data, error } = await supabase
          .from("events")
          .select(`
            id, title, event_type, location, event_date, event_time, status,
            event_setups (
              quantity,
              setups (name)
            ),
            event_staff (staff (id))
          `)
          .order("event_date")
          .order("event_time");
          
        if (error) throw error;
        
        const formattedEvents = (data || []).map((e: any) => ({
          ...e,
          setup_name: e.event_setups?.map((es: any) => `${es.setups?.name} (${es.quantity})`).join(', ') || null,
          staff_count: e.event_staff?.length || 0
        }));
        
        setEvents(formattedEvents);
      } catch (err) {
        console.error("Error fetching events:", err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  const getEventTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case "wedding": return "from-pink-500 to-rose-500";
      case "birthday": return "from-amber-400 to-orange-500";
      case "corporate": return "from-blue-500 to-indigo-500";
      default: return "from-emerald-400 to-teal-500";
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case "confirmed": return "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200";
      case "completed": return "bg-blue-50 text-blue-600 ring-1 ring-blue-200";
      case "cancelled": return "bg-red-50 text-red-600 ring-1 ring-red-200";
      default: return "bg-amber-50 text-amber-600 ring-1 ring-amber-200";
    }
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const onDateClick = (day: Date) => setSelectedDate(day);

  // Calendar logic
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = "d";
  const days = eachDayOfInterval({
    start: startDate,
    end: endDate
  });

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const filteredEvents = useMemo(() => {
    if (!selectedDate) return events;
    return events.filter(event => {
      if (!event.event_date) return false;
      return isSameDay(parseISO(event.event_date), selectedDate);
    });
  }, [events, selectedDate]);

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Old Simple Header */}
      <div className="bg-white border-b border-gray-100 p-5 flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-50 rounded-xl transition-colors">
          <ChevronLeft size={24} className="text-gray-900" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Calendar View</h1>
        <div className="w-10" />
      </div>

      <div className="p-4 space-y-6">
        {/* Full Calendar View */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
          {/* Calendar Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[16px] font-bold text-gray-900">
              {format(currentDate, "MMMM yyyy")}
            </h2>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronLeft size={20} className="text-gray-600" />
              </button>
              <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronRight size={20} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-y-2 gap-x-1">
            {days.map((day, i) => {
              const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isToday = isSameDay(day, new Date());
              
              // Check if day has events
              const dayEvents = events.filter(e => e.event_date && isSameDay(parseISO(e.event_date), day));
              
              return (
                <div 
                  key={day.toString()} 
                  onClick={() => onDateClick(day)}
                  className="flex flex-col items-center justify-start py-1.5 cursor-pointer"
                >
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold transition-all duration-200
                    ${!isCurrentMonth ? "text-gray-300" : "text-gray-700"}
                    ${isToday && !isSelected ? "bg-blue-50 text-primary" : ""}
                    ${isSelected ? "bg-primary text-white shadow-md shadow-blue-200" : "hover:bg-gray-50"}
                  `}>
                    {format(day, dateFormat)}
                  </div>
                  
                  {/* Event Dots */}
                  <div className="flex gap-0.5 mt-1 h-1">
                    {dayEvents.slice(0, 3).map((e, idx) => (
                      <div 
                        key={idx} 
                        className={`w-1 h-1 rounded-full ${isSelected ? "bg-white/70" : "bg-primary"}`} 
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Title & Reset */}
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[15px] font-bold text-gray-900">
            {selectedDate ? format(selectedDate, "dd MMM yyyy") : "All Events"}
            <span className="ml-2 text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {filteredEvents.length}
            </span>
          </h3>
          {selectedDate && (
             <button 
                onClick={() => setSelectedDate(null)}
                className="text-[11px] font-bold text-primary bg-blue-50 px-2.5 py-1 rounded-full active:bg-blue-100 transition-colors"
             >
                Show All
             </button>
          )}
        </div>

        {/* Events List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-10">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : filteredEvents.length === 0 ? (
             <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm">
                <div className="w-12 h-12 mx-auto rounded-full bg-gray-50 flex items-center justify-center mb-3">
                  <CalendarIcon size={22} className="text-gray-300" />
                </div>
                <p className="text-sm text-gray-400 font-medium">No events for this date</p>
              </div>
          ) : (
            filteredEvents.map((event, index) => (
              <Link key={event.id || index} href={`/events/${event.id}`} className="event-card block bg-white rounded-2xl overflow-hidden border border-gray-100/80 active:scale-[0.98] transition-all duration-200" style={{ animationDelay: `${index * 50}ms` }}>
                <div className={`h-1.5 w-full bg-gradient-to-r ${getEventTypeColor(event.event_type)}`} />
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${getEventTypeColor(event.event_type)} flex items-center justify-center shadow-sm`}>
                        <CalendarIcon className="text-white" size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-[15px]">{event.title}</h4>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock size={11} className="text-gray-400" />
                          <p className="text-[11px] text-gray-500 font-semibold">{formatEventDate(event.event_date, event.event_time)}</p>
                        </div>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wide ${getStatusStyle(event.status)}`}>
                      {event.status}
                    </span>
                  </div>

                  <div className="pt-2.5 border-t border-dashed border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Layers size={12} className="text-gray-400" />
                        <span className="text-[12px] text-gray-500 font-medium">{event.setup_name || "No setup"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users size={12} className="text-primary" />
                        <span className="text-[12px] font-bold text-primary">{event.staff_count || 0} Crew</span>
                      </div>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <MapPin size={12} className="text-gray-400" />
                        <span className="text-[12px] text-gray-400 font-medium">{event.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
