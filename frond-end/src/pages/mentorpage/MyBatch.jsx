import React, { useState } from "react";

function MyBatch() {
  const [search, setSearch] = useState("");

  const batches = [
    {
      id: 1,
      batchName: "MERN Stack Batch A",
      course: "MERN",
      duration: "6 Months",
    },
    {
      id: 2,
      batchName: "Python Batch B",
      course: "Python",
      duration: "4 Months",
    },
    {
      id: 3,
      batchName: "Java Fullstack",
      course: "Java",
      duration: "5 Months",
    },
  ];

  const filteredBatches = batches.filter((batch) =>
    batch.batchName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 bg-[#EEF6FB] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#141E46]">My Batches</h1>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl p-6 shadow">

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search batches..."
            className="border rounded-lg px-4 py-2 w-72 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-3">
            <thead>
              <tr className="text-left text-blue-600">
                <th className="px-4">#</th>
                <th>Batch Name</th>
                <th>Course</th>
                <th>Duration</th>
              </tr>
            </thead>

            <tbody>
              {filteredBatches.map((batch, index) => (
                <tr key={batch.id} className="bg-[#EEF6FB] rounded-lg">
                  <td className="px-4 py-4">{index + 1}</td>
                  <td>{batch.batchName}</td>
                  <td>{batch.course}</td>
                  <td>{batch.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

export default MyBatch;
