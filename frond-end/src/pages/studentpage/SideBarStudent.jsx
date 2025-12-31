import React from 'react'

function SideBarStudent() {
  return (
    <>
      <ul className="space-y-3 p-4 text-gray-700">
  <li className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-100 cursor-pointer">
    📊 <span>Dashboard</span>
  </li>

  <li className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-100 cursor-pointer">
    👤 <span>Attendance</span>
  </li>

  <li className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-100 cursor-pointer">
    📝 <span>Leave</span>
  </li>

  <li className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-100 cursor-pointer">
    📅 <span>Holiday</span>
  </li>


  <li className="flex items-center gap-2 p-2 rounded-lg text-red-500 hover:bg-red-100 cursor-pointer">
    🚪 <span>Logout</span>
  </li>
</ul>

    </>
  )
}

export default SideBarStudent
