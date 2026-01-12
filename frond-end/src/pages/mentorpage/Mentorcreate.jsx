import React, { useState } from "react";
import Sidebar from "../adminpage/sidebar";


function Mentorcreate() {
  const [showModal, setShowModal] = useState(false);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [course, setCourse] = useState("");
  const [mentor,setMentor] = useState([])
 

  const handleAddmentor = async ()=>{
    e.preventDefault();
    // if (!isVerified) {
    //     setMessage("Please verify email before creating student");
    //     return;
    //   }
  
     
  
      try {
        const res = await axios.post(
          "http://localhost:3001/admin/addMentor",
          { name, email, password, course, },
          
        );
  
        if (res.data.success) {
          setMentor([...mentor, res.data.mentor]);
          resetForm();
        }
      } catch (error) {
        console.error(error);
        alert(error.response?.data?.message || "Failed to create mentor");
      }
    
  };

  const resetForm = () =>{
    setName("");
    setEmail("");
    setPassword("");
    setCourse("");

  }




  return (
    <div className="min-h-screen bg-[#EEF6FB] p-4 sm:p-6">
      <Sidebar />

      <div className="ml-52 p-6 max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-semibold text-[#141E46]">
            Students Management
          </h1>

          <button
            onClick={() => setShowModal(true)}
            className="bg-[#141E46] text-white px-6 py-2 rounded-lg"
          >
            + Create Student
          </button>
        </div>

        {/* TABLE (Static UI) */}
        <div className="bg-white rounded-3xl shadow-2xl p-5">
  <table className="w-full text-sm border-separate border-spacing-y-3">
    <thead>
      <tr className="text-[#1679AB] text-center">
        <th className="p-3">#</th>
        <th className="p-3">Name</th>
        <th className="p-3">Email</th>
        <th className="p-3">Course</th>
        <th className="p-3">Status</th>
        <th className="p-3">Action</th>
      </tr>
    </thead>

    <tbody>
      <tr className="bg-[#EEF6FB] hover:bg-[#D1E8FF] text-center">
        <td className="p-3">1</td>
        <td className="p-3">John Doe</td>
        <td className="p-3 break-all">john@gmail.com</td>
        <td className="p-3">React</td>

        {/* STATUS BUTTON */}
        <td className="p-3">
          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-1 rounded-full text-xs">
            Active
          </button>
        </td>

        {/* ACTION BUTTON */}
        <td className="p-3">
  <div className="flex justify-center gap-3">
    <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-1 rounded-full text-xs">
      Active
    </button>

    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded text-xs">
      Edit
    </button>
  </div>
</td>
      </tr>
    </tbody>
  </table>
</div>


      </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 relative">
            <button
              onClick={resetForm}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold text-center mb-5">
              Create Student
            </h2>

            <form 
            onSubmit={handleAddmentor}
            className="space-y-3">
              <input
                type="text"
                placeholder="Name"
                className="w-full border p-2 rounded"
              />

              <input
                type="email"
                placeholder="Email"
                className="w-full border p-2 rounded"
              />

              <input
                type="password"
                placeholder="Password"
                className="w-full border p-2 rounded"
              />

              <select className="w-full border p-2 rounded">
                <option>Select Course</option>
                <option>React</option>
                <option>Node</option>
              </select>

              <button
                type="button"
                className="w-full bg-[#141E46] text-white py-2 rounded"
              >
                Create Student
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Mentorcreate;
