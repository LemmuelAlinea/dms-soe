import { useEffect, useState } from "react";
import api from "../../services/api";
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  X
} from "lucide-react";

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [limit, setLimit] = useState("");

  const [editingDept, setEditingDept] = useState(null);
  const [deleteDept, setDeleteDept] = useState(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await api.get("/superadmin/departments");
      setDepartments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  /* =========================
     CREATE DEPARTMENT
  ========================= */
  const handleCreate = async () => {
    if (!name || !code || !limit) {
      return alert("All fields required");
    }

    try {
      await api.post("/superadmin/departments", {
        departmentName: name,
        departmentCode: code,
        storageLimitMB: limit
      });

      setName("");
      setCode("");
      setLimit("");
      fetchDepartments();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create department");
    }
  };

  /* =========================
     UPDATE DEPARTMENT
  ========================= */
  const handleUpdate = async () => {
    try {
      await api.put(
        `/superadmin/departments/${editingDept.departmentID}`,
        {
          departmentName: editingDept.departmentName,
          departmentCode: editingDept.departmentCode,
          storageLimitMB: editingDept.storageLimit / (1024 * 1024)
        }
      );

      setEditingDept(null);
      fetchDepartments();
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    }
  };

  /* =========================
     DELETE DEPARTMENT
  ========================= */
  const handleDelete = async () => {
    try {
      await api.delete(
        `/superadmin/departments/${deleteDept.departmentID}`
      );

      setDeleteDept(null);
      fetchDepartments();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-10">

      <h1 className="text-2xl font-semibold text-gray-800">
        Department Management
      </h1>

      {/* =========================
          CREATE FORM
      ========================= */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md">

        <div className="flex items-center gap-2 mb-4 text-gray-600 text-sm uppercase tracking-wide">
          <Plus size={16} />
          Create Department
        </div>

        <div className="flex gap-4">

          <input
            type="text"
            placeholder="Department Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 border border-gray-200 p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <input
            type="text"
            placeholder="Department Code (e.g. CCS)"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="w-40 border border-gray-200 p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <input
            type="number"
            placeholder="Storage Limit (MB)"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            className="w-40 border border-gray-200 p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <button
            onClick={handleCreate}
            className="bg-[#0F172A] text-white px-6 rounded-lg text-sm hover:bg-[#1E293B] transition"
          >
            Create
          </button>
        </div>
      </div>

      {/* =========================
          DEPARTMENT LIST
      ========================= */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md">

        {departments.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No departments found.
          </p>
        ) : (
          <div className="space-y-6">
            {departments.map((dept) => {

              const used = dept.usedStorage || 0;
              const limit = dept.storageLimit || 1;

              const usedMB = (used / (1024 * 1024)).toFixed(2);
              const limitMB = (limit / (1024 * 1024)).toFixed(2);

              const percent = Math.min(
                (used / limit) * 100,
                100
              );

              return (
                <div
                  key={dept.departmentID}
                  className="border border-gray-500 rounded-xl p-5 hover:shadow-[0px_0px_12px_0px_rgba(0,_0,_0,_0.8)] transition"
                >
                  <div className="flex justify-between items-center mb-4">

                    <div className="flex items-center gap-3">
                      <Building2 size={18} className="text-gray-500" />
                      <div>
                        <div className="font-semibold text-gray-800">
                          {dept.departmentName}
                        </div>
                        <div className="text-xs text-gray-500">
                          Code: {dept.departmentCode}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setEditingDept(dept)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() => setDeleteDept(dept)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* STORAGE BAR */}
                  <div className="w-full bg-gray-200 h-3 rounded-full">
                    <div
                      className="bg-[#0F172A] h-3 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="mt-2 text-sm text-gray-500">
                    {usedMB} MB / {limitMB} MB
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* =========================
          EDIT MODAL
      ========================= */}
      {editingDept && (
        <Modal onClose={() => setEditingDept(null)}>

          <h2 className="text-lg font-semibold mb-4">
            Edit Department
          </h2>

          <input
            type="text"
            value={editingDept.departmentName}
            onChange={(e) =>
              setEditingDept({
                ...editingDept,
                departmentName: e.target.value
              })
            }
            className="w-full border p-3 rounded-lg mb-3"
          />

          <input
            type="text"
            value={editingDept.departmentCode}
            onChange={(e) =>
              setEditingDept({
                ...editingDept,
                departmentCode: e.target.value.toUpperCase()
              })
            }
            className="w-full border p-3 rounded-lg mb-3"
          />

          <input
            type="number"
            value={editingDept.storageLimit / (1024 * 1024)}
            onChange={(e) =>
              setEditingDept({
                ...editingDept,
                storageLimit: e.target.value * 1024 * 1024
              })
            }
            className="w-full border p-3 rounded-lg mb-4"
          />

          <button
            onClick={handleUpdate}
            className="w-full bg-[#0F172A] text-white py-3 rounded-lg hover:bg-[#1E293B] transition"
          >
            Save Changes
          </button>

        </Modal>
      )}

      {/* =========================
          DELETE MODAL
      ========================= */}
      {deleteDept && (
        <Modal onClose={() => setDeleteDept(null)}>

          <h2 className="text-lg font-semibold mb-4 text-red-600">
            Delete Department
          </h2>

          <p className="text-sm text-gray-600 mb-6">
            Are you sure you want to delete{" "}
            <strong>{deleteDept.departmentName}</strong>?
          </p>

          <button
            onClick={handleDelete}
            className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition"
          >
            Confirm Delete
          </button>

        </Modal>
      )}

    </div>
  );
}

/* =========================
   SIMPLE MODAL
========================= */
function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[420px] shadow-xl relative animate-fadeIn">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
        >
          <X size={16} />
        </button>

        {children}
      </div>
    </div>
  );
}