import React, { useState } from 'react';

const DashboardCalendar = () => {
  const [currentDate] = useState(new Date());
  
  const days = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = currentDate.getDate();

  // Get first day of month and total days
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Adjust for Monday start (standard in your dashboard)
  const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const renderDays = () => {
    const calendarDays = [];
    // Fill empty slots for previous month
    for (let i = 0; i < offset; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="h-10"></div>);
    }
    // Fill actual days
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = d === today;
      calendarDays.push(
        <div key={d} className="flex items-center justify-center h-10">
          <span className={`
            w-9 h-9 flex items-center justify-center rounded-full transition-all cursor-pointer
            ${isToday 
              ? 'bg-blue-900 text-white font-bold shadow-lg scale-100' 
              : 'text-[#141E46] hover:bg-blue-50 hover:text-blue-900'}
          `}>
            {d}
          </span>
        </div>
      );
    }
    return calendarDays;
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-200 h-80 flex flex-col justify-between">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-[#141E46] text-lg">
          {monthNames[month]} {year}
        </h3>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-900"></div>
          <div className="w-2 h-2 rounded-full bg-blue-200"></div>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 text-center mb-2">
        {days.map(day => (
          <span key={day} className="text-xs font-bold text-[#1679AB] uppercase tracking-wider">
            {day}
          </span>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 text-sm flex-grow">
        {renderDays()}
      </div>
      
      {/* Bottom subtle accent line to match clock theme */}
      <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#0033FF] to-transparent opacity-20 mt-2"></div>
    </div>
  );
};

export default DashboardCalendar;