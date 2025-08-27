import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Target, 
  UserCheck, 
  Plus, 
  Settings,
  CheckCircle,
  AlertCircle,
  Info,
  Trash2,
  Search,
  X,
  Filter
} from 'lucide-react';


// --- API LAYER ----------------------------------------------------
const API_BASE = import.meta?.env?.VITE_API_BASE || "/api";

async function api(path, { method = "GET", params, body, headers } = {}) {
  const url = new URL(`${API_BASE}${path}`, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
    });
  }

  const res = await fetch(url.toString(), {
    method,
    headers: { "Content-Type": "application/json", ...(headers || {}) },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}${text ? ` - ${text}` : ""}`);
  }
  return res.status === 204 ? null : res.json();
}

const CampaignAPI = {
  list: (params) => api("/campaigns", { params }),
};

const EmployeeAPI = {
  list: (params) => api("/employees", { params }),
  addToCampaign: (campaignId, employeeIds) =>
    api(`/campaigns/${campaignId}/employees`, {
      method: "POST",
      body: { employeeIds },
    }),
  removeFromCampaign: (campaignId, employeeIds) =>
    api(`/campaigns/${campaignId}/employees`, {
      method: "DELETE",
      body: { employeeIds },
    }),
  updateInCampaign: (campaignId, payload) =>
    api(`/campaigns/${campaignId}/employees`, {
      method: "PUT",
      body: payload,
    }),
};

const EvaluatorAPI = {
  list: (params) => api("/evaluators", { params }),
  addToCampaign: (campaignId, evaluatorIds) =>
    api(`/campaigns/${campaignId}/evaluators`, {
      method: "POST",
      body: { evaluatorIds },
    }),
  removeFromCampaign: (campaignId, evaluatorIds) =>
    api(`/campaigns/${campaignId}/evaluators`, {
      method: "DELETE",
      body: { evaluatorIds },
    }),
  create: (payload) => api(`/evaluators`, { method: "POST", body: payload }),
};
// -----------------------------------------------------------------


// Simple Table Component
const Table = ({ 
  columns = [], 
  data = [], 
  onRemove = null,
  emptyMessage = "No data available",
  className = ""
}) => {
  if (data.length === 0) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-8 text-center ${className}`}>
        <p className="text-gray-500 text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <div className="max-h-96 overflow-y-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={column.key || index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
                >
                  {column.label}
                </th>
              ))}
              {onRemove && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                  Action
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={item.id || index} className="hover:bg-gray-50 transition-colors">
                {columns.map((column, colIndex) => (
                  <td
                    key={column.key || colIndex}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {column.render
                      ? column.render(item[column.key], item, index)
                      : item[column.key] || '-'}
                  </td>
                ))}
                {onRemove && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => onRemove(index)}
                      className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Employee Selection Modal
const EmployeeModal = ({
  isOpen = false,
  onClose = () => {},
  data = [],
  selectedItems = [],
  onConfirm = () => {}
}) => {
  const [filters, setFilters] = useState({
    id: '',
    name: '',
    group: '',
    designation: '',
    department: '',
  });

  const [localSelectedItems, setLocalSelectedItems] = useState([]);
  const [filteredData, setFilteredData] = useState(data);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalSelectedItems([...selectedItems]);
      setFilters({
        id: '',
        name: '',
        group: '',
        designation: '',
        department: '',
      });
    }
  }, [isOpen, selectedItems]);

  // Debounced filtering
  useEffect(() => {
    const handler = setTimeout(() => {
      const f = data.filter(emp => {
        return (
          (!filters.id || String(emp.id).toLowerCase().includes(filters.id.toLowerCase())) &&
          (!filters.name || emp.name.toLowerCase().includes(filters.name.toLowerCase())) &&
          (!filters.group || (emp.group ?? '').toLowerCase().includes(filters.group.toLowerCase())) &&
          (!filters.designation || (emp.designation ?? '').toLowerCase().includes(filters.designation.toLowerCase())) &&
          (!filters.department || (emp.department ?? '').toLowerCase().includes(filters.department.toLowerCase()))
        );
      });
      setFilteredData(f);
    }, 300);

    return () => clearTimeout(handler);
  }, [filters, data]);

  // Toggle single item
  const handleItemToggle = (item) => {
    if (localSelectedItems.some(sel => sel.id === item.id)) {
      setLocalSelectedItems(prev => prev.filter(sel => sel.id !== item.id));
    } else {
      setLocalSelectedItems(prev => [...prev, item]);
    }
  };

  const isItemSelected = (item) => localSelectedItems.some(sel => sel.id === item.id);

  // Select all
  const handleSelectAll = (checked) => {
    if (checked) {
      const newItems = [...localSelectedItems];
      filteredData.forEach(item => {
        if (!newItems.some(sel => sel.id === item.id)) {
          newItems.push(item);
        }
      });
      setLocalSelectedItems(newItems);
    } else {
      const filteredIds = filteredData.map(item => item.id);
      setLocalSelectedItems(prev => prev.filter(sel => !filteredIds.includes(sel.id)));
    }
  };

  const isAllSelected =
    filteredData.length > 0 &&
    filteredData.every(item => isItemSelected(item));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Select Employees</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Search by ID"
              value={filters.id}
              onChange={(e) => setFilters({ ...filters, id: e.target.value })}
              className="px-3 py-2 border rounded-lg"
            />
            <input
              type="text"
              placeholder="Search by Name"
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
              className="px-3 py-2 border rounded-lg"
            />
            <input
              type="text"
              placeholder="Search by Group"
              value={filters.group}
              onChange={(e) => setFilters({ ...filters, group: e.target.value })}
              className="px-3 py-2 border rounded-lg"
            />
            <input
              type="text"
              placeholder="Search by Designation"
              value={filters.designation}
              onChange={(e) => setFilters({ ...filters, designation: e.target.value })}
              className="px-3 py-2 border rounded-lg"
            />
            <input
              type="text"
              placeholder="Search by Department"
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              className="px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="text-sm text-gray-600">
            Selected: {localSelectedItems.length} | Filtered: {filteredData.length} | Total: {data.length}
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-hidden">
          <div className="overflow-auto max-h-96">
            {filteredData.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">No employees found matching your criteria.</p>
              </div>
            ) : (
              <table className="min-w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="w-12 px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Designation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredData.map((item) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                        isItemSelected(item) ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleItemToggle(item)}
                    >
                      <td className="w-12 px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isItemSelected(item)}
                          onChange={() => handleItemToggle(item)}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.department}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.designation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(localSelectedItems)}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};


// Evaluator Selection Modal
const EvaluatorModal = ({
  isOpen = false,
  onClose = () => {},
  data = [],
  selectedItems = [],
  onConfirm = () => {}
}) => {
  const [filters, setFilters] = useState({
    id: '',
    name: '',
    department: '',
    designation: '',
  });

  const [localSelectedItems, setLocalSelectedItems] = useState([]);
  const [filteredData, setFilteredData] = useState(data);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalSelectedItems([...selectedItems]);
      setFilters({ id: '', name: '', department: '', designation: '' });
    }
  }, [isOpen, selectedItems]);

  // Debounced filtering
  useEffect(() => {
    const handler = setTimeout(() => {
      const f = data.filter(ev => {
        return (
          (!filters.id || String(ev.id).toLowerCase().includes(filters.id.toLowerCase())) &&
          (!filters.name || ev.name.toLowerCase().includes(filters.name.toLowerCase())) &&
          (!filters.department || (ev.department ?? '').toLowerCase().includes(filters.department.toLowerCase())) &&
          (!filters.designation || (ev.designation ?? '').toLowerCase().includes(filters.designation.toLowerCase()))
        );
      });
      setFilteredData(f);
    }, 300);

    return () => clearTimeout(handler);
  }, [filters, data]);

  const handleItemToggle = (item) => {
    if (localSelectedItems.some(sel => sel.id === item.id)) {
      setLocalSelectedItems(prev => prev.filter(sel => sel.id !== item.id));
    } else {
      setLocalSelectedItems(prev => [...prev, item]);
    }
  };

  const isItemSelected = (item) => localSelectedItems.some(sel => sel.id === item.id);

  const handleSelectAll = (checked) => {
    if (checked) {
      const newItems = [...localSelectedItems];
      filteredData.forEach(item => {
        if (!newItems.some(sel => sel.id === item.id)) {
          newItems.push(item);
        }
      });
      setLocalSelectedItems(newItems);
    } else {
      const filteredIds = filteredData.map(item => item.id);
      setLocalSelectedItems(prev => prev.filter(sel => !filteredIds.includes(sel.id)));
    }
  };

  const isAllSelected = filteredData.length > 0 && filteredData.every(item => isItemSelected(item));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Select Evaluators</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Search by ID"
              value={filters.id}
              onChange={(e) => setFilters({ ...filters, id: e.target.value })}
              className="px-3 py-2 border rounded-lg"
            />
            <input
              type="text"
              placeholder="Search by Name"
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
              className="px-3 py-2 border rounded-lg"
            />
            <input
              type="text"
              placeholder="Search by Department"
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              className="px-3 py-2 border rounded-lg"
            />
            <input
              type="text"
              placeholder="Search by Designation"
              value={filters.designation}
              onChange={(e) => setFilters({ ...filters, designation: e.target.value })}
              className="px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="text-sm text-gray-600">
            Selected: {localSelectedItems.length} | Filtered: {filteredData.length} | Total: {data.length}
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-hidden">
          <div className="overflow-auto max-h-96">
            {filteredData.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">No evaluators found matching your criteria.</p>
              </div>
            ) : (
              <table className="min-w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="w-12 px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Designation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredData.map((item) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                        isItemSelected(item) ? 'bg-purple-50' : ''
                      }`}
                      onClick={() => handleItemToggle(item)}
                    >
                      <td className="w-12 px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isItemSelected(item)}
                          onChange={() => handleItemToggle(item)}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.department}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.designation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(localSelectedItems)}
            className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const ManualEvaluatorModal = ({
  isOpen = false,
  onClose = () => {},
  onCreated = () => {}
}) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    department: '',
    designation: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email) {
      setError("Name and Email are required.");
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const newEvaluator = await EvaluatorAPI.create(form);

      // Pass back new evaluator to parent
      onCreated(newEvaluator);

      // Reset form and close
      setForm({ name: '', email: '', department: '', designation: '' });
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create evaluator.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Add Evaluator</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />
          <input
            type="text"
            placeholder="Department"
            value={form.department}
            onChange={(e) => handleChange('department', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />
          <input
            type="text"
            placeholder="Designation"
            value={form.designation}
            onChange={(e) => handleChange('designation', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100"
            // disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`font-semibold px-4 py-2 rounded-lg shadow-md text-white ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Saving...' : 'Add Evaluator'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Dummy data
const CAMPAIGNS = [
  { id: 1, name: 'Annual Performance Review 2024', status: 'active', description: 'Yearly comprehensive evaluation' },
  { id: 2, name: 'Quarterly Assessment Q1 2024', status: 'draft', description: 'Q1 performance assessment' },
  { id: 3, name: 'Mid-Year Review 2024', status: 'active', description: 'Mid-year performance check' },
  { id: 4, name: 'Project Performance Evaluation', status: 'completed', description: 'Project-based evaluation' },
  { id: 5, name: 'Leadership Assessment 2024', status: 'draft', description: 'Leadership skills evaluation' }
];

const EMPLOYEES = [
  { id: 'EMP001', name: 'John Smith', department: 'IT', designation: 'Senior Developer', email: 'john.smith@company.com' },
  { id: 'EMP002', name: 'Sarah Johnson', department: 'HR', designation: 'HR Manager', email: 'sarah.johnson@company.com' },
  { id: 'EMP003', name: 'Mike Wilson', department: 'Finance', designation: 'Financial Analyst', email: 'mike.wilson@company.com' },
  { id: 'EMP004', name: 'Emily Davis', department: 'Marketing', designation: 'Marketing Specialist', email: 'emily.davis@company.com' },
  { id: 'EMP005', name: 'David Brown', department: 'IT', designation: 'System Administrator', email: 'david.brown@company.com' },
  { id: 'EMP006', name: 'Lisa Anderson', department: 'Operations', designation: 'Operations Manager', email: 'lisa.anderson@company.com' },
  { id: 'EMP007', name: 'Robert Taylor', department: 'Sales', designation: 'Sales Executive', email: 'robert.taylor@company.com' },
  { id: 'EMP008', name: 'Jennifer White', department: 'IT', designation: 'Frontend Developer', email: 'jennifer.white@company.com' },
  { id: 'EMP009', name: 'Alex Rodriguez', department: 'Marketing', designation: 'Digital Marketing Manager', email: 'alex.rodriguez@company.com' },
  { id: 'EMP010', name: 'Maria Garcia', department: 'HR', designation: 'Recruitment Specialist', email: 'maria.garcia@company.com' }
];

const FACTOR_TYPES = [
  { id: 'performance', name: 'Performance', description: 'Work output and goal achievement' },
  { id: 'behavior', name: 'Behavior', description: 'Professional conduct and soft skills' },
  { id: 'technical', name: 'Technical Skills', description: 'Job-specific technical competencies' },
  { id: 'leadership', name: 'Leadership', description: 'Leadership and management abilities' },
  { id: 'innovation', name: 'Innovation', description: 'Creative thinking and problem-solving' }
];

const FACTORS_DATA = {
  performance: [
    { id: 'perf1', name: 'Goal Achievement', description: 'Meeting set objectives and targets' },
    { id: 'perf2', name: 'Quality of Work', description: 'Standard and accuracy of deliverables' },
    { id: 'perf3', name: 'Productivity', description: 'Efficiency and output volume' },
    { id: 'perf4', name: 'Initiative Taking', description: 'Proactive approach to tasks' },
    { id: 'perf5', name: 'Time Management', description: 'Meeting deadlines and managing priorities' }
  ],
  behavior: [
    { id: 'beh1', name: 'Team Collaboration', description: 'Working effectively with others' },
    { id: 'beh2', name: 'Communication Skills', description: 'Clear and effective communication' },
    { id: 'beh3', name: 'Punctuality', description: 'Timeliness and reliability' },
    { id: 'beh4', name: 'Professional Ethics', description: 'Integrity and ethical conduct' },
    { id: 'beh5', name: 'Adaptability', description: 'Flexibility to change and new situations' }
  ],
  technical: [
    { id: 'tech1', name: 'Technical Expertise', description: 'Domain-specific knowledge and skills' },
    { id: 'tech2', name: 'Problem Solving', description: 'Analytical and troubleshooting abilities' },
    { id: 'tech3', name: 'Innovation', description: 'Creative solutions and new ideas' },
    { id: 'tech4', name: 'Learning Agility', description: 'Ability to learn and adapt to new technologies' },
    { id: 'tech5', name: 'Documentation', description: 'Quality of technical documentation' }
  ],
  leadership: [
    { id: 'lead1', name: 'Team Management', description: 'Leading and managing team members' },
    { id: 'lead2', name: 'Decision Making', description: 'Making effective and timely decisions' },
    { id: 'lead3', name: 'Mentoring', description: 'Guiding and developing others' },
    { id: 'lead4', name: 'Strategic Thinking', description: 'Long-term planning and vision' },
    { id: 'lead5', name: 'Conflict Resolution', description: 'Managing and resolving disputes' }
  ],
  innovation: [
    { id: 'innov1', name: 'Creative Thinking', description: 'Generating novel ideas and solutions' },
    { id: 'innov2', name: 'Process Improvement', description: 'Enhancing existing workflows' },
    { id: 'innov3', name: 'Research & Development', description: 'Exploring new technologies and methods' },
    { id: 'innov4', name: 'Risk Taking', description: 'Taking calculated risks for innovation' }
  ]
};

const EVALUATORS = [
  { id: 'EVAL001', username: 'admin', role: 'Administrator', department: 'Management', email: 'admin@company.com' },
  { id: 'EVAL002', username: 'hr_manager', role: 'HR Manager', department: 'HR', email: 'hr.manager@company.com' },
  { id: 'EVAL003', username: 'team_lead_it', role: 'IT Team Lead', department: 'IT', email: 'it.lead@company.com' },
  { id: 'EVAL004', username: 'supervisor_ops', role: 'Operations Supervisor', department: 'Operations', email: 'ops.supervisor@company.com' },
  { id: 'EVAL005', username: 'director_sales', role: 'Sales Director', department: 'Sales', email: 'sales.director@company.com' },
  { id: 'EVAL006', username: 'finance_head', role: 'Finance Head', department: 'Finance', email: 'finance.head@company.com' }
];

export default function EmpEvaluations() {
  // Core state management
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedFactorType, setSelectedFactorType] = useState('');
  const [factorSelections, setFactorSelections] = useState({});
  const [selectedEvaluators, setSelectedEvaluators] = useState([]);
// Master lists from backend
const [campaigns, setCampaigns] = useState([]);
const [employees, setEmployees] = useState([]);
const [evaluators, setEvaluators] = useState([]);
const [showManualEvaluatorModal, setShowManualEvaluatorModal] = useState(false);
const [selectedEmployeeRows, setSelectedEmployeeRows] = useState([]);
const [selectedEvaluatorRows, setSelectedEvaluatorRows] = useState([]);

// Loading & error (basic)
const [loading, setLoading] = useState({ campaigns: false, employees: false, evaluators: false });
const [loadError, setLoadError] = useState(null);
useEffect(() => {
  const loadAll = async () => {
    try {
      setLoadError(null);
      setLoading({ campaigns: true, employees: true, evaluators: true });

      const [c, e, v] = await Promise.all([
        CampaignAPI.list(),
        EmployeeAPI.list(),
        EvaluatorAPI.list(),
      ]);

      setCampaigns(Array.isArray(c) ? c : c?.data ?? []);
      setEmployees(Array.isArray(e) ? e : e?.data ?? []);
      setEvaluators(Array.isArray(v) ? v : v?.data ?? []);
    } catch (err) {
      console.error(err);
      setLoadError(err.message);
    } finally {
      setLoading({ campaigns: false, employees: false, evaluators: false });
    }
  };

  loadAll();
}, []);

  // Modal states
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showEvaluatorModal, setShowEvaluatorModal] = useState(false);
  
  // UI states
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [saveError, setSaveError] = useState(null);

  const handleSaveAll = useCallback(async () => {
    try {
      setIsSaving(true);
      setSaveMessage(null);
      setSaveError(null);

      const payload = {
        campaignId: selectedCampaign || null,
        employees: selectedEmployees,
        evaluators: selectedEvaluators,
        factors: factorSelections,
      };

      await api('/employee-evaluations', { method: 'POST', body: payload });
      setSaveMessage('All changes saved successfully.');
    } catch (err) {
      console.error(err);
      setSaveError(err.message || 'Failed to save.');
    } finally {
      setIsSaving(false);
    }
  }, [selectedCampaign, selectedEmployees, selectedEvaluators, factorSelections]);

  // Get current factors based on selected type
  const getCurrentFactors = useCallback(() => {
    if (!selectedFactorType) return [];
    return FACTORS_DATA[selectedFactorType] || [];
  }, [selectedFactorType]);

  // Get total selected factors across all types
  const getTotalSelectedFactors = useCallback(() => {
    return Object.values(factorSelections).reduce((total, factors) => total + factors.length, 0);
  }, [factorSelections]);

  // Handle factor selection - Fixed to persist across type changes
  const handleFactorToggle = useCallback((factor) => {
    if (!selectedFactorType) return;

    setFactorSelections(prev => {
      const currentSelections = prev[selectedFactorType] || [];
      const isSelected = currentSelections.some(selected => selected.id === factor.id);
      
      if (isSelected) {
        return {
          ...prev,
          [selectedFactorType]: currentSelections.filter(selected => selected.id !== factor.id)
        };
      } else {
        return {
          ...prev,
          [selectedFactorType]: [...currentSelections, factor]
        };
      }
    });
  }, [selectedFactorType]);

  // Check if factor is selected - Fixed to work with persistent selections
  const isFactorSelected = useCallback((factor) => {
    if (!selectedFactorType) return false;
    const currentSelections = factorSelections[selectedFactorType] || [];
    return currentSelections.some(selected => selected.id === factor.id);
  }, [selectedFactorType, factorSelections]);

  // Handle employee confirmation from modal
// Add employees to campaign
const handleEmployeeConfirm = useCallback(async (pickedEmployees) => {
  if (!selectedCampaign) {
    alert("Please select a campaign first.");
    return;
  }
  const ids = pickedEmployees.map((e) => e.id);

  try {
    await EmployeeAPI.addToCampaign(selectedCampaign, ids);
    // Merge & de-dup local state
    setSelectedEmployees((prev) => {
      const map = new Map(prev.map((e) => [e.id, e]));
      pickedEmployees.forEach((e) => map.set(e.id, e));
      return Array.from(map.values());
    });
  } catch (err) {
    console.error(err);
    alert(`Failed to add employees: ${err.message}`);
  }
}, [selectedCampaign]);

// Add evaluators to campaign
const handleEvaluatorConfirm = useCallback(async (pickedEvaluators) => {
  if (!selectedCampaign) {
    alert("Please select a campaign first.");
    return;
  }
  const ids = pickedEvaluators.map((e) => e.id);

  try {
    await EvaluatorAPI.addToCampaign(selectedCampaign, ids);
    setSelectedEvaluators((prev) => {
      const map = new Map(prev.map((e) => [e.id, e]));
      pickedEvaluators.forEach((e) => map.set(e.id, e));
      return Array.from(map.values());
    });
  } catch (err) {
    console.error(err);
    alert(`Failed to add evaluators: ${err.message}`);
  }
}, [selectedCampaign]);

// Remove single employee row (trash icon)
const handleRemoveEmployee = useCallback(async (index) => {
  const emp = (prev => prev[index])(selectedEmployees);
  if (!emp) return;
  if (!selectedCampaign) {
    alert("Please select a campaign first.");
    return;
  }
  try {
    await EmployeeAPI.removeFromCampaign(selectedCampaign, [emp.id]);
    setSelectedEmployees((prev) => prev.filter((_, i) => i !== index));
  } catch (err) {
    console.error(err);
    alert(`Failed to remove employee: ${err.message}`);
  }
}, [selectedEmployees, selectedCampaign]);

// Remove single evaluator row (trash icon)
const handleRemoveEvaluator = useCallback(async (index) => {
  const ev = (prev => prev[index])(selectedEvaluators);
  if (!ev) return;
  if (!selectedCampaign) {
    alert("Please select a campaign first.");
    return;
  }
  try {
    await EvaluatorAPI.removeFromCampaign(selectedCampaign, [ev.id]);
    setSelectedEvaluators((prev) => prev.filter((_, i) => i !== index));
  } catch (err) {
    console.error(err);
    alert(`Failed to remove evaluator: ${err.message}`);
  }
}, [selectedEvaluators, selectedCampaign]);


  // Table columns
  const employeeColumns = [
    {
      key: 'srNo',
      label: 'Sr. No',
      render: (value, item, index) => index + 1
    },
    { key: 'id', label: 'Employee ID' },
    { key: 'name', label: 'Name' },
    { key: 'department', label: 'Department' },
    { key: 'designation', label: 'Designation' }
  ];

  const factorColumns = [
  {
    key: 'srNo',
    label: 'Sr. No',
    render: (value, item, index) => index + 1
  },
  { key: 'name', label: 'Factor Name' },
  { key: 'description', label: 'Description' },
  {
    key: 'selected',
    label: 'Selected',
    render: (_unused, item) => (
      <input
        type="checkbox"
        checked={isFactorSelected(item)}
        onChange={() => handleFactorToggle(item)}
        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
      />
    )
  }
];

  const evaluatorColumns = [
    {
      key: 'srNo',
      label: 'Sr. No',
      render: (value, item, index) => index + 1
    },
    { key: 'username', label: 'Username' },
    { key: 'role', label: 'Role' },
    { key: 'department', label: 'Department' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Employee Evaluation Setup</h1>
              <p className="text-gray-600 mt-2">Configure evaluation campaigns with employees, factors, and evaluators</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveAll}
                className={`inline-flex items-center gap-2 font-medium px-4 py-2 rounded-lg shadow-md text-white ${isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} focus:ring-2 focus:ring-indigo-500 transition-colors`}
                disabled={isSaving}
                title="Save entire setup"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-8">
        {(saveMessage || saveError) && (
          <div className={`${saveError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'} rounded-lg p-3`}>
            {saveError || saveMessage}
          </div>
        )}
        {/* Campaign Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
            Campaign Selection
          </h2>
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Campaign
            </label>
            <select
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose a campaign...</option>
{campaigns.map((campaign) => (
  <option key={campaign.id} value={campaign.id}>
    {campaign.name} {campaign.status ? `(${campaign.status})` : ""}
  </option>
))}

            </select>
           {selectedCampaign && (
  <div className="mt-2 p-3 bg-blue-50 rounded-lg">
    <p className="text-sm text-blue-700">
      {campaigns.find((c) => String(c.id) === String(selectedCampaign))?.description || " "}
    </p>
  </div>
)}

          </div>
        </div>

        {/* Employees Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Employees</h2>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {selectedEmployees.length} selected
              </span>
            </div>
            <button
  onClick={() => setShowEmployeeModal(true)}
  className="inline-flex items-center gap-2 font-medium px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white focus:ring-2 focus:ring-blue-500 transition-colors"
>
  <Plus className="w-4 h-4" />
  Add Employees
</button>

          </div>
          
          <Table
            columns={employeeColumns}
            data={selectedEmployees}
            onRemove={handleRemoveEmployee}
            emptyMessage="No employees selected. Click 'Add Employees' to get started."
          />
        </div>

        {/* Factors Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Target className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Evaluation Factors</h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {getTotalSelectedFactors()} total selected
            </span>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Factor Type
            </label>
            <div className="max-w-md">
              <select
                value={selectedFactorType}
                onChange={(e) => setSelectedFactorType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Select factor type...</option>
                {FACTOR_TYPES.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name} - {type.description}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Factor Type Summary */}
          {Object.keys(factorSelections).length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Selected Factors Summary:</h4>
              <div className="overflow-x-auto">
                <div className="flex gap-3 pb-2">
                  {FACTOR_TYPES.map(type => {
                    const selectedCount = factorSelections[type.id]?.length || 0;
                    if (selectedCount === 0) return null;
                    return (
                      <div key={type.id} className="flex-shrink-0 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-green-800">{type.name}</span>
                          <span className="text-sm text-green-600 bg-green-200 px-2 py-1 rounded-full">
                            {selectedCount}
                          </span>
                        </div>
                        <div className="text-xs text-green-600">
                          {factorSelections[type.id]?.map(f => f.name).join(', ')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {selectedFactorType && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Available factors for <strong>{FACTOR_TYPES.find(t => t.id === selectedFactorType)?.name}</strong>
                </p>
                <p className="text-sm text-gray-500">
                  {(factorSelections[selectedFactorType] || []).length} of {getCurrentFactors().length} selected
                </p>
              </div>
              <Table
                columns={factorColumns}
                data={getCurrentFactors()}
                emptyMessage="No factors available for the selected type."
              />
            </div>
          )}
        </div>

        {/* Evaluators Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <UserCheck className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">Evaluators</h2>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {selectedEvaluators.length} selected
              </span>
            </div>
           <button
  onClick={() => setShowEvaluatorModal(true)}
  className="inline-flex items-center gap-2 font-medium px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white focus:ring-2 focus:ring-purple-500 transition-colors"
>
  <Plus className="w-4 h-4" />
  Add Evaluators
</button>
<button
  onClick={() => setShowManualEvaluatorModal(true)}
  className="inline-flex items-center gap-2 font-medium px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white focus:ring-2 focus:ring-green-500"
>
  <Plus className="w-4 h-4" />
  Add Externally
</button>

          </div>
          
          <Table
            columns={evaluatorColumns}
            data={selectedEvaluators}
            onRemove={handleRemoveEvaluator}
            emptyMessage="No evaluators selected. Click 'Add Evaluators' to get started."
          />
        </div>

        {/* Advanced Options */}
        {showAdvancedOptions && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Settings className="w-6 h-6 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-900">Advanced Options</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Evaluation Period
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Start Date"
                  />
                  <input
                    type="date"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="End Date"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Evaluation Method
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                  <option value="standard">Standard Evaluation</option>
                  <option value="360">360-Degree Feedback</option>
                  <option value="self">Self Assessment</option>
                  <option value="peer">Peer Review</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating Scale
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                  <option value="5">5-Point Scale (1-5)</option>
                  <option value="10">10-Point Scale (1-10)</option>
                  <option value="100">Percentage (0-100%)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notifications
                </label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                    <span className="text-sm text-gray-600">Email notifications to evaluators</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                    <span className="text-sm text-gray-600">Reminder notifications</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Summary Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Info className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Campaign Summary</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-100">
              <div className="text-3xl font-bold text-blue-600 mb-2">{selectedEmployees.length}</div>
              <div className="text-sm font-medium text-blue-800">Employees</div>
              <div className="text-xs text-blue-600 mt-1">to be evaluated</div>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-xl border border-green-100">
              <div className="text-3xl font-bold text-green-600 mb-2">{getTotalSelectedFactors()}</div>
              <div className="text-sm font-medium text-green-800">Factors</div>
              <div className="text-xs text-green-600 mt-1">across all categories</div>
            </div>
            <div className="text-center p-6 bg-purple-50 rounded-xl border border-purple-100">
              <div className="text-3xl font-bold text-purple-600 mb-2">{selectedEvaluators.length}</div>
              <div className="text-sm font-medium text-purple-800">Evaluators</div>
              <div className="text-xs text-purple-600 mt-1">assigned to campaign</div>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-200">
              {selectedCampaign ? (
                <div>
                  <div className="text-sm font-medium text-gray-800 mb-1">Selected Campaign</div>
                  <div className="text-base font-semibold text-gray-900">
                    {campaigns.find((c) => String(c.id) === String(selectedCampaign))?.name || '—'}
                  </div>
                  <div className="text-xs text-gray-600 mt-2">
                    {campaigns.find((c) => String(c.id) === String(selectedCampaign))?.description || ''}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-3xl font-bold text-gray-600 mb-2">0</div>
                  <div className="text-sm font-medium text-gray-800">Campaign</div>
                  <div className="text-xs text-gray-600 mt-1">not selected</div>
                </div>
              )}
            </div>
          </div>
          
          
        </div>
      </main>

      {/* Employee Selection Modal */}
     <EmployeeModal
  isOpen={showEmployeeModal}
  onClose={() => setShowEmployeeModal(false)}
  data={employees}                 // <— was EMPLOYEES
  selectedItems={[]}               // fresh open (we’ll do full reset logic in Task 3)
  onConfirm={handleEmployeeConfirm}
/>

      {/* Evaluator Selection Modal */}
     <EvaluatorModal
  isOpen={showEvaluatorModal}
  onClose={() => setShowEvaluatorModal(false)}
  data={evaluators}                // <— was EVALUATORS
  selectedItems={[]}               // fresh open (we’ll do full reset logic in Task 3)
  onConfirm={handleEvaluatorConfirm}
/>
<ManualEvaluatorModal
  isOpen={showManualEvaluatorModal}
  onClose={() => setShowManualEvaluatorModal(false)}
  onCreated={(newEvaluator) => {
    // Add to master evaluators and immediately to selected list
    setEvaluators(prev => [...prev, newEvaluator]);
    setSelectedEvaluators(prev => {
      const map = new Map(prev.map(e => [e.id, e]));
      map.set(newEvaluator.id, newEvaluator);
      return Array.from(map.values());
    });
    // If a campaign is selected, assign evaluator to campaign in backend
    if (selectedCampaign) {
      EvaluatorAPI.addToCampaign(selectedCampaign, [newEvaluator.id]).catch((err) => {
        console.error(err);
        alert(`Failed to assign new evaluator to campaign: ${err.message}`);
      });
    }
  }}
/>

    </div>
  );
}

