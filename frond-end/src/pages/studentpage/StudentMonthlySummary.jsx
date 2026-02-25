import React, { useState, useEffect, useMemo } from "react";
import SideBarStudent from "./SideBarStudent";
import GraphSection from "../GraphSection";
import api from "../../utils/axiosConfig";
import { Search, X } from "lucide-react";

function StudentMonthlySummary() {
  const [summary, setSummary] = useState({
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    leaveDays: 0,
    month: "",
    year: ""
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [dailyRecords, setDailyRecords] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search and filter states for leaves
  const [leaveSearch, setLeaveSearch] = useState("");
  const [leaveFromDate, setLeaveFromDate] = useState("");
  const [leaveToDate, setLeaveToDate] = useState("");

  // Search and filter states for daily attendance
  const [attendanceSearch, setAttendanceSearch] = useState("");
  const [attendanceFromDate, setAttendanceFromDate] = useState("");
  const [attendanceToDate, setAttendanceToDate] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchMonthlySummary(), fetchLeaves()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const fetchMonthlySummary = async () => {
    try {
      const response = await api.get("/student/monthly-summary");
      if (response.data.success) {
        setSummary(response.data.summary);
        setMonthlyData(response.data.monthlyData);
        setDailyRecords(response.data.dailyRecords || []);
      }
    } catch (error) {
      console.error("Error fetching monthly summary:", error);
    }
  };

  const fetchLeaves = async () => {
    try {
      const response = await api.get("/student/my-leaves");
      if (response.data.success) {
        setLeaves(response.data.leaves || []);
      }
    } catch (error) {
      console.error("Error fetching leaves:", error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-CA");
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getAttendanceStatusStyle = (status) => {
    if (status === 'Present') return 'bg-green-100 text-green-700';
    if (status === 'Absent') return 'bg-red-100 text-red-700';
    if (status === 'Weekend') return 'bg-gray-100 text-gray-600';
    if (status.includes('Leave')) return 'bg-yellow-100 text-yellow-700';
    return 'bg-gray-100 text-gray-600';
  };

  // Filtered leaves data
  const filteredLeaves = useMemo(() => {
    return leaves.filter((leave) => {
      const matchesSearch = 
        leave.type?.toLowerCase().includes(leaveSearch.toLowerCase()) ||
        leave.reason?.toLowerCase().includes(leaveSearch.toLowerCase()) ||
        leave.status?.toLowerCase().includes(leaveSearch.toLowerCase());
      
      const fromDate = leaveFromDate ? new Date(leaveFromDate) : null;
      const toDate = leaveToDate ? new Date(leaveToDate) : null;
      const leaveFrom = leave.from ? new Date(leave.from) : null;
      const leaveTo = leave.to ? new Date(leave.to) : null;
      
      const matchesFromDate = !fromDate || (leaveFrom && leaveFrom >= fromDate);
      const matchesToDate = !toDate || (leaveTo && leaveTo <= toDate);
      
      return matchesSearch && matchesFromDate && matchesToDate;
    });
  }, [leaves, leaveSearch, leaveFromDate, leaveToDate]);

  // Filtered daily records data
  const filteredDailyRecords = useMemo(() => {
    return dailyRecords.filter((record) => {
      const matchesSearch = 
        record.status?.toLowerCase().includes(attendanceSearch.toLowerCase()) ||
        record.day?.toLowerCase().includes(attendanceSearch.toLowerCase()) ||
        (record.punchIn || '').toLowerCase().includes(attendanceSearch.toLowerCase()) ||
        (record.punchOut || '').toLowerCase().includes(attendanceSearch.toLowerCase());
      
      const fromDate = attendanceFromDate ? new Date(attendanceFromDate) : null;
      const toDate = attendanceToDate ? new Date(attendanceToDate) : null;
      const recordDate = record.date ? new Date(record.date) : null;
      
      const matchesFromDate = !fromDate || (recordDate && recordDate >= fromDate);
      const matchesToDate = !toDate || (recordDate && recordDate <= toDate);
      
      return matchesSearch && matchesFromDate && matchesToDate;
    });
  }, [dailyRecords, attendanceSearch, attendanceFromDate, attendanceToDate]);

  // Reset filters
  const resetLeaveFilters = () => {
    setLeaveSearch("");
    setLeaveFromDate("");
    setLeaveToDate("");
  };

  const resetAttendanceFilters = () => {
    setAttendanceSearch("");
    setAttendanceFromDate("");
    setAttendanceToDate("");
  };

  return (
    <div className="min-h-screen bg-[#EEF6FB]">
      {/* Sidebar - Let SideBarStudent handle its own responsiveness */}
      <SideBarStudent />

      {/* Main Content */}
      <div className="lg:ml-64 flex-1 min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto w-full">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-center mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-[#141E46]">
              Monthly Summary
            </h2>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-[#141E46]">
              Monthly Summary - {summary.month} {summary.year}
            </h2>
          </div>

          {/* Stats / Summary Cards */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 animate-pulse">
                  <div className="h-5 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-12"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
              <div className="bg-white rounded-2xl shadow-2xl p-5 border hover:scale-105 transition">
                <h3 className="text-lg font-semibold">Total Working Days</h3>
                <p className="text-3xl font-bold text-[#0077b6]">{summary.totalDays}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-2xl p-5 border hover:scale-105 transition">
                <h3 className="text-lg font-semibold">Present</h3>
                <p className="text-3xl font-bold text-green-600">{summary.presentDays}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-2xl p-5 border hover:scale-105 transition">
                <h3 className="text-lg font-semibold"> Leaves</h3>
                <p className="text-3xl font-bold text-red-600">{summary.absentDays + summary.leaveDays}</p>
                <p className="text-sm text-gray-500 mt-1">
                  (Absent: {summary.absentDays}, Leaves: {summary.leaveDays})
                </p>
              </div>
            </div>
          )}

          {/* Graph Section */}
          <div className="bg-white rounded-2xl shadow-2xl p-5 mb-8 overflow-x-auto">
            <GraphSection monthlyData={monthlyData} loading={loading} />
          </div>

          {/* Leave Details Section */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden mb-8">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-center lg:text-left text-[#0a2540] px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8">
              Leave Details
            </h3>

            {/* Search and Filter Controls - Leave Details */}
            <div className="flex flex-col lg:flex-row flex-wrap gap-3 lg:gap-4 items-stretch lg:items-center px-4 sm:px-6 lg:px-8 pb-4 sticky top-0 backdrop-blur-sm z-10 bg-white border-b border-gray-100">
              {/* Search Input */}
              <div className="group relative w-full lg:w-72">
                <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] focus-within:shadow-2xl focus-within:-translate-y-[2px] focus-within:ring-2 focus-within:ring-[#0a2540]/40 active:scale-[0.98] border border-gray-200">
                  <input
                    type="text"
                    placeholder="Search by type, reason or status..."
                    value={leaveSearch}
                    onChange={(e) => setLeaveSearch(e.target.value)}
                    className="flex-1 px-4 sm:px-5 py-2 sm:py-3 text-sm text-gray-700 placeholder-gray-400 bg-transparent outline-none rounded-full"
                  />
                  <button type="button" className="relative flex items-center justify-center w-8 h-8 m-1 rounded-full bg-[#0a2540] transition-all duration-300 ease-out group-hover:scale-105 hover:scale-110 active:scale-95">
                    <Search className="h-4 w-4 text-white transition-transform duration-300 group-hover:rotate-12" />
                  </button>
                </div>
              </div>
              
              {/* Date Filters */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
                <div className="relative w-full sm:w-40 group">
                  <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] focus-within:shadow-2xl focus-within:-translate-y-[2px] focus-within:ring-2 focus-within:ring-[#0a2540]/40 active:scale-[0.98] border border-gray-200">
                    <input
                      type="date"
                      value={leaveFromDate}
                      onChange={(e) => setLeaveFromDate(e.target.value)}
                      className="flex-1 px-4 py-2 text-sm text-gray-700 bg-transparent outline-none rounded-full cursor-pointer"
                    />
                  </div>
                </div>
                <span className="text-gray-400 text-center sm:text-left">to</span>
                <div className="relative w-full sm:w-40 group">
                  <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] focus-within:shadow-2xl focus-within:-translate-y-[2px] focus-within:ring-2 focus-within:ring-[#0a2540]/40 active:scale-[0.98] border border-gray-200">
                    <input
                      type="date"
                      value={leaveToDate}
                      onChange={(e) => setLeaveToDate(e.target.value)}
                      className="flex-1 px-4 py-2 text-sm text-gray-700 bg-transparent outline-none rounded-full cursor-pointer"
                    />
                  </div>
                </div>
              </div>
              
              {/* Reset Button */}
              {(leaveSearch || leaveFromDate || leaveToDate) && (
                <button
                  onClick={resetLeaveFilters}
                  className="group flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-[#0a2540] transition-colors hover:bg-gray-50 rounded-lg"
                >
                  <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Clear All
                </button>
              )}
            </div>

            {/* Results count */}
            <p className="text-xs text-gray-500 mb-2 px-4 sm:px-6 lg:px-8">
              Showing {filteredLeaves.length} of {leaves.length} records
            </p>

            {/* Desktop Table - Leaves - With fixed height and scroll */}
            <div className="hidden lg:block px-4 sm:px-6 lg:px-8 pb-4">
              <div className="overflow-x-auto">
                <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  <table className="w-full text-sm border-separate border-spacing-y-3">
                    <thead className="sticky top-0 bg-white z-10">
                      <tr className="text-[#1679AB] text-left">
                        <th className="p-3 text-center">#</th>
                        <th className="p-3 text-center">From</th>
                        <th className="p-3 text-center">To</th>
                        <th className="p-3 text-center">Type</th>
                        <th className="p-3 text-center">Reason</th>
                        <th className="p-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeaves.length === 0 ? (
                        <tr className="bg-[#EEF6FB] hover:bg-[#D1E8FF]">
                          <td colSpan="6" className="text-center p-3 rounded-2xl">
                            No leave records found
                          </td>
                        </tr>
                      ) : (
                        filteredLeaves.map((leave, index) => (
                          <tr
                            key={leave._id}
                            className="bg-[#EEF6FB] hover:bg-[#D1E8FF] transform transition-all duration-300 hover:scale-98"
                          >
                            <td className="px-3 py-3 text-center">{index + 1}</td>
                            <td className="px-4 py-3 text-center break-words">
                              {formatDisplayDate(leave.from)}
                            </td>
                            <td className="px-4 py-3 text-center break-words">
                              {formatDisplayDate(leave.to)}
                            </td>
                            <td className="px-4 py-3 text-center break-words">
                              {leave.type}
                            </td>
                            <td className="px-4 py-3 text-center break-words max-w-[200px]">
                              {leave.reason}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`px-3 py-1 rounded-full text-xs ${getStatusStyle(leave.status)}`}
                              >
                                {leave.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Mobile Card View - Leaves - With fixed height and scroll */}
            <div className="block lg:hidden px-4 sm:px-6 lg:px-8 pb-4">
              <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-2 space-y-3">
                {filteredLeaves.length === 0 ? (
                  <div className="bg-[#EEF6FB] p-4 rounded-xl text-center">
                    No leave records found
                  </div>
                ) : (
                  filteredLeaves.map((leave, index) => (
                    <div
                      key={leave._id}
                      className="bg-[#EEF6FB] hover:bg-[#D1E8FF] p-4 rounded-xl transform transition-all duration-300"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 mb-1">#{index + 1}</p>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-gray-600">From:</span>
                            <span className="font-medium">{formatDisplayDate(leave.from)}</span>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-gray-600">To:</span>
                            <span className="font-medium">{formatDisplayDate(leave.to)}</span>
                          </div>
                          <p className="text-sm font-semibold text-[#141E46] mb-1">{leave.type}</p>
                          <p className="text-xs text-gray-600 bg-white/60 p-2 rounded-lg break-words">
                            {leave.reason || "No reason provided"}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs whitespace-nowrap ${getStatusStyle(leave.status)}`}
                        >
                          {leave.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Daily Attendance Section */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-center lg:text-left text-[#0a2540] px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8">
              Daily Attendance Report
            </h3>

            {/* Search and Filter Controls - Daily Attendance */}
            <div className="flex flex-col lg:flex-row flex-wrap gap-3 lg:gap-4 items-stretch lg:items-center px-4 sm:px-6 lg:px-8 pb-4 sticky top-0 backdrop-blur-sm z-10 bg-white border-b border-gray-100">
              {/* Search Input */}
              <div className="group relative w-full lg:w-72">
                <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] focus-within:shadow-2xl focus-within:-translate-y-[2px] focus-within:ring-2 focus-within:ring-[#0a2540]/40 active:scale-[0.98] border border-gray-200">
                  <input
                    type="text"
                    placeholder="Search by status, day or punch time..."
                    value={attendanceSearch}
                    onChange={(e) => setAttendanceSearch(e.target.value)}
                    className="flex-1 px-4 sm:px-5 py-2 sm:py-3 text-sm text-gray-700 placeholder-gray-400 bg-transparent outline-none rounded-full"
                  />
                  <button type="button" className="relative flex items-center justify-center w-8 h-8 m-1 rounded-full bg-[#0a2540] transition-all duration-300 ease-out group-hover:scale-105 hover:scale-110 active:scale-95">
                    <Search className="h-4 w-4 text-white transition-transform duration-300 group-hover:rotate-12" />
                  </button>
                </div>
              </div>
              
              {/* Date Filters */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
                <div className="relative w-full sm:w-40 group">
                  <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] focus-within:shadow-2xl focus-within:-translate-y-[2px] focus-within:ring-2 focus-within:ring-[#0a2540]/40 active:scale-[0.98] border border-gray-200">
                    <input
                      type="date"
                      value={attendanceFromDate}
                      onChange={(e) => setAttendanceFromDate(e.target.value)}
                      className="flex-1 px-4 py-2 text-sm text-gray-700 bg-transparent outline-none rounded-full cursor-pointer"
                    />
                  </div>
                </div>
                <span className="text-gray-400 text-center sm:text-left">to</span>
                <div className="relative w-full sm:w-40 group">
                  <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] focus-within:shadow-2xl focus-within:-translate-y-[2px] focus-within:ring-2 focus-within:ring-[#0a2540]/40 active:scale-[0.98] border border-gray-200">
                    <input
                      type="date"
                      value={attendanceToDate}
                      onChange={(e) => setAttendanceToDate(e.target.value)}
                      className="flex-1 px-4 py-2 text-sm text-gray-700 bg-transparent outline-none rounded-full cursor-pointer"
                    />
                  </div>
                </div>
              </div>
              
              {/* Reset Button */}
              {(attendanceSearch || attendanceFromDate || attendanceToDate) && (
                <button
                  onClick={resetAttendanceFilters}
                  className="group flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-[#0a2540] transition-colors hover:bg-gray-50 rounded-lg"
                >
                  <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Clear All
                </button>
              )}
            </div>

            {/* Results count */}
            <p className="text-xs text-gray-500 mb-2 px-4 sm:px-6 lg:px-8">
              Showing {filteredDailyRecords.length} of {dailyRecords.length} records
            </p>

            {/* Desktop Table - Attendance - With fixed height and scroll */}
            <div className="hidden lg:block px-4 sm:px-6 lg:px-8 pb-4">
              <div className="overflow-x-auto">
                <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  <table className="w-full text-sm border-separate border-spacing-y-3">
                    <thead className="sticky top-0 bg-white z-10">
                      <tr className="text-[#1679AB] text-left">
                        <th className="p-3 text-center">#</th>
                        <th className="p-3 text-center">Date</th>
                        <th className="p-3 text-center">Day</th>
                        <th className="p-3 text-center">Status</th>
                        <th className="p-3 text-center">Punch In</th>
                        <th className="p-3 text-center">Punch Out</th>
                        <th className="p-3 text-center">Working</th>
                        <th className="p-3 text-center">Break</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDailyRecords.length === 0 ? (
                        <tr className="bg-[#EEF6FB] hover:bg-[#D1E8FF]">
                          <td colSpan="8" className="text-center p-3 rounded-2xl">
                            No records found for this month
                          </td>
                        </tr>
                      ) : (
                        filteredDailyRecords.map((record, index) => (
                          <tr
                            key={index}
                            className="bg-[#EEF6FB] hover:bg-[#D1E8FF] transform transition-all duration-300 hover:scale-98"
                          >
                            <td className="px-3 py-3 text-center">{index + 1}</td>
                            <td className="px-4 py-3 text-center break-words">
                              {formatDisplayDate(record.date)}
                            </td>
                            <td className="px-4 py-3 text-center break-words">
                              {record.day}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`px-3 py-1 rounded-full text-xs ${getAttendanceStatusStyle(record.status)}`}
                              >
                                {record.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center break-words">
                              {record.punchIn || '-'}
                            </td>
                            <td className="px-4 py-3 text-center break-words">
                              {record.punchOut || '-'}
                            </td>
                            <td className="px-4 py-3 text-center font-medium text-[#141E46]">
                              {record.totalWorking || '-'}
                            </td>
                            <td className="px-4 py-3 text-center text-gray-500">
                              {record.totalBreak || '-'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Mobile Card View - Attendance - With fixed height and scroll */}
            <div className="block lg:hidden px-4 sm:px-6 lg:px-8 pb-4">
              <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-2 space-y-3">
                {filteredDailyRecords.length === 0 ? (
                  <div className="bg-[#EEF6FB] p-4 rounded-xl text-center">
                    No records found
                  </div>
                ) : (
                  filteredDailyRecords.map((record, index) => (
                    <div
                      key={index}
                      className="bg-[#EEF6FB] hover:bg-[#D1E8FF] p-4 rounded-xl transform transition-all duration-300"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 mb-1">#{index + 1}</p>
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-[#141E46]">{formatDisplayDate(record.date)}</span>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${getAttendanceStatusStyle(record.status)}`}
                            >
                              {record.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{record.day}</p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="bg-white/60 p-2 rounded-lg">
                              <p className="text-xs text-gray-500">Punch In</p>
                              <p className="font-medium">{record.punchIn || '-'}</p>
                            </div>
                            <div className="bg-white/60 p-2 rounded-lg">
                              <p className="text-xs text-gray-500">Punch Out</p>
                              <p className="font-medium">{record.punchOut || '-'}</p>
                            </div>
                            <div className="bg-white/60 p-2 rounded-lg">
                              <p className="text-xs text-gray-500">Working</p>
                              <p className="font-medium text-blue-600">{record.totalWorking || '-'}</p>
                            </div>
                            <div className="bg-white/60 p-2 rounded-lg">
                              <p className="text-xs text-gray-500">Break</p>
                              <p className="font-medium text-gray-600">{record.totalBreak || '-'}</p>
                              
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentMonthlySummary;