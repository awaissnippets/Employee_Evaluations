import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users,
  Target,
  UserCheck,
  Plus,
  Info,
  Trash2,
  X,
  CheckCircle
} from 'lucide-react';

// ===========================
// Temporary Stubbed API Calls
// ===========================
// TODO: Replace these with real API calls once backend endpoints are ready.
async function fetchCampaigns() {
  console.log("Fetching campaigns...");
  return [];
}

async function fetchEmployees() {
  console.log("Fetching employees...");
  return [];
}

async function fetchEvaluators() {
  console.log("Fetching evaluators...");
  return [];
}

async function fetchFactors() {
  console.log("Fetching factors...");
  return [];
}



// --- STUBBED API LAYER --------------------------------------------




async function saveCampaign(data) { return { ok: true, id: 'NEW_ID', ...data }; }
async function updateCampaign(data) { return { ok: true, ...data }; }
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
    level: '' // ✅ added
  });

  const [localSelectedItems, setLocalSelectedItems] = useState([]);
  const [filteredData, setFilteredData] = useState(data);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalSelectedItems([...selectedItems]);
      setFilters({ id: '', name: '', department: '', designation: '', level: '' });
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
          (!filters.designation || (ev.designation ?? '').toLowerCase().includes(filters.designation.toLowerCase())) &&
          (!filters.level || String(ev.level ?? '').toLowerCase().includes(filters.level.toLowerCase())) // ✅ level filter
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
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Select Evaluators</h2>
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th> {/* ✅ New column */}
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
                      <td className="px-4 py-3 text-sm text-gray-900">{item.level}</td> {/* ✅ New value */}
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

// Manual Evaluator Modal
const FactorModal = ({
  isOpen = false,
  onClose = () => {},
  factors = [],
  selectedByType = {},
  onConfirm = () => {}
}) => {
  const [type, setType] = useState('qualitative');
  const [localSelected, setLocalSelected] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const pre = selectedByType[type] || [];
      setLocalSelected(pre);
    }
  }, [isOpen, type, selectedByType]);

  const filtered = useMemo(() => factors.filter((f) => f.type === type), [factors, type]);
  const isSelected = (item) => localSelected.some((x) => x.id === item.id);
  const toggle = (item) => {
    setLocalSelected((prev) =>
      prev.some((x) => x.id === item.id) ? prev.filter((x) => x.id !== item.id) : [...prev, item]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add Factors</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 border-b border-gray-200 space-y-4">
          <div className="max-w-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="qualitative">Qualitative</option>
              <option value="quantitative">Quantitative</option>
              <option value="recommended">Recommended</option>
            </select>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="overflow-auto max-h-96">
            {filtered.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">No factors available for this type.</p>
              </div>
            ) : (
              <table className="min-w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="w-12 px-4 py-3 text-left"></th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    {type === 'qualitative' && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marks Level</th>
                    )}
                    {type === 'quantitative' && (
                      <>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Marks</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Passing Marks</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="w-12 px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected(item)}
                          onChange={() => toggle(item)}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                      {type === 'qualitative' && (
                        <td className="px-4 py-3 text-sm text-gray-900">{item.marksLevel ?? '-'}</td>
                      )}
                      {type === 'quantitative' && (
                        <>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.totalMarks ?? '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.passingMarks ?? '-'}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100">Cancel</button>
          <button
            onClick={() => onConfirm(type, localSelected)}
            className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
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

  // Simulate API call
  const newEvaluator = { ...form, id: Date.now().toString(), level: null };
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


// removed hardcoded demo data in favor of stubbed API

export default function EmployeeEvaluationSetup() {
  // Core state management
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [factorSelections, setFactorSelections] = useState({}); // key: type -> array of factors
  const [selectedEvaluators, setSelectedEvaluators] = useState([]);
  // Master lists from backend (stubbed)
  const [campaigns, setCampaigns] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [evaluators, setEvaluators] = useState([]);
  const [factors, setFactors] = useState([]);
  const [showManualEvaluatorModal, setShowManualEvaluatorModal] = useState(false);
  const [showFactorModal, setShowFactorModal] = useState(false);

// Loading & error (basic)
const [loading, setLoading] = useState({ campaigns: false, employees: false, evaluators: false, factors: false });
const [loadError, setLoadError] = useState(null);
useEffect(() => {
  const loadAll = async () => {
    try {
      setLoadError(null);
      setLoading({ campaigns: true, employees: true, evaluators: true, factors: true });

      const [c, e, v, f] = await Promise.all([
        fetchCampaigns(),
        fetchEmployees(),
        fetchEvaluators(),
        fetchFactors(),
      ]);
      setCampaigns(Array.isArray(c) ? c : []);
      setEmployees(Array.isArray(e) ? e : []);
      setEvaluators(Array.isArray(v) ? v : []);
      setFactors(Array.isArray(f) ? f : []);
    } catch (err) {
      console.error(err);
      setLoadError(err.message);
    } finally {
      setLoading({ campaigns: false, employees: false, evaluators: false, factors: false });
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
  // Stepper state
  const [activeStep, setActiveStep] = useState(0);

  const handleSaveAll = useCallback(async () => {
    try {
      setIsSaving(true);
      setSaveMessage(null);
      setSaveError(null);

      const employeesPayload = selectedEmployees.map((e) => ({ id: e.id }));
      const evaluatorsPayload = selectedEvaluators.map((e) => ({ id: e.id, level: Number(e.level || 0) }));
      const factorsPayload = Object.values(factorSelections)
        .flat()
        .map((f) => ({ id: f.id }));

      const payload = {
        id: selectedCampaign || undefined,
        employees: employeesPayload,
        evaluators: evaluatorsPayload,
        factors: factorsPayload,
      };

  if (selectedCampaign) await updateCampaign(payload);
  else await saveCampaign(payload);
      setSaveMessage('All changes saved successfully.');
    } catch (err) {
      console.error(err);
      setSaveError(err.message || 'Failed to save.');
    } finally {
      setIsSaving(false);
    }
  }, [selectedCampaign, selectedEmployees, selectedEvaluators, factorSelections]);


  // Filter employees by selected employeeCategory across UI
  // TODO: If the actual backend field is not `employee.category`, adjust normalization here
  const filteredEmployeesMaster = employees;
  const filteredSelectedEmployees = selectedEmployees;

  // Get current factors based on selected type
  const getFactorsByType = useCallback((type) => {
    return factors.filter((f) => f.type === type);
  }, [factors]);

  // Get total selected factors across all types
  const getTotalSelectedFactors = useCallback(() => {
    return Object.values(factorSelections).reduce((total, factors) => total + factors.length, 0);
  }, [factorSelections]);

  // Handle factor selection - Fixed to persist across type changes
  const handleFactorToggle = useCallback((type, factor) => {
    setFactorSelections(prev => {
      const currentSelections = prev[type] || [];
      const isSelected = currentSelections.some(selected => selected.id === factor.id);
      if (isSelected) {
        return { ...prev, [type]: currentSelections.filter(selected => selected.id !== factor.id) };
      }
      return { ...prev, [type]: [...currentSelections, factor] };
    });
  }, []);

  // Check if factor is selected - Fixed to work with persistent selections
  const isFactorSelected = useCallback((type, factor) => {
    const currentSelections = factorSelections[type] || [];
    return currentSelections.some(selected => selected.id === factor.id);
  }, [factorSelections]);

  // Handle employee confirmation from modal
// Add employees to campaign
const handleEmployeeConfirm = useCallback(async (pickedEmployees) => {
  if (!selectedCampaign) {
    alert("Please select a campaign first.");
    return;
  }
  const ids = pickedEmployees.map((e) => e.id);

  try {
    // stub: just merge into local state
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
// Replace existing handleEvaluatorConfirm with this
const handleEvaluatorConfirm = useCallback(async (pickedEvaluators) => {
  if (!selectedCampaign) {
    alert("Please select a campaign first.");
    return;
  }
  const ids = pickedEvaluators.map((e) => e.id);

  try {
    // stub: just merge into local state
    setSelectedEvaluators((prev) => {
      // keep existing evaluator.level if present, otherwise default to empty string
      const map = new Map(prev.map((e) => [e.id, e]));
      pickedEvaluators.forEach((e) => {
        const existing = map.get(e.id);
        if (existing) {
          // preserve existing.level
          map.set(e.id, { ...existing, ...e, level: existing.level ?? '' });
        } else {
          // new pick, set runtime level default
          map.set(e.id, { ...e, level: '' });
        }
      });
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
    // stub: just remove from local state
    setSelectedEmployees((prev) => prev.filter((_, i) => i !== index));
  } catch (err) {
    console.error(err);
    alert(`Failed to remove employee: ${err.message}`);
  }
}, [selectedEmployees, selectedCampaign]);

// Remove by employee id (used when rendering filtered views)
const handleRemoveEmployeeById = useCallback(async (employeeId) => {
  if (!employeeId) return;
  if (!selectedCampaign) {
    alert("Please select a campaign first.");
    return;
  }
  try {
    // stub: just remove from local state
    setSelectedEmployees((prev) => prev.filter((e) => e.id !== employeeId));
  } catch (err) {
    console.error(err);
    alert(`Failed to remove employee: ${err.message}`);
  }
}, [selectedCampaign]);

// Remove single evaluator row (trash icon)
const handleRemoveEvaluator = useCallback(async (index) => {
  const ev = selectedEvaluators[index];
  if (!ev) return;
  if (!selectedCampaign) {
    alert("Please select a campaign first.");
    return;
  }
  try {
    // stub: just remove from local state
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
    { key: 'department', label: 'Department' },
    {
      key: 'level',
      label: 'Level',
      render: (_value, item) => (
        <input
          type="number"
          min="1"
          placeholder="Level"
          value={item.level ?? ''}
          onChange={(e) => {
            const newLevel = e.target.value;
            setSelectedEvaluators((prev) =>
              prev.map((ev) =>
                ev.id === item.id ? { ...ev, level: newLevel } : ev
              )
            );
          }}
          className="w-24 px-2 py-1 border rounded-md text-sm"
        />
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {/* Header removed per new layout requirements */}

      <main className="w-full p-0 m-0 space-y-8">
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
          <div className="max-w-md space-y-4">
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
            {/* Employee Group removed per new requirements */}
          </div>
        </div>



        {/* Employees Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Employees</h2>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {filteredSelectedEmployees.length} selected
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
            data={filteredSelectedEmployees}
            onRemove={(idx) => {
              const row = filteredSelectedEmployees[idx];
              if (row) {
                // Remove by id to avoid index mismatch due to filtering
                handleRemoveEmployeeById(row.id);
              }
            }}
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
          
          {/* Factor Type dropdown removed from main area per new flow */}

          {/* Factor Type Summary */}
          {Object.keys(factorSelections).length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Selected Factors Summary:</h4>
              <div className="overflow-x-auto">
                <div className="flex gap-3 pb-2">
                  {['qualitative','quantitative','recommended'].map(type => {
                    const selectedCount = (factorSelections[type] || []).length;
                    if (selectedCount === 0) return null;
                    return (
                      <div key={type.id} className="flex-shrink-0 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-green-800">{type}</span>
                          <span className="text-sm text-green-600 bg-green-200 px-2 py-1 rounded-full">
                            {selectedCount}
                          </span>
                        </div>
                        <div className="text-xs text-green-600">
                          {factorSelections[type]?.map(f => f.name).join(', ')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          {/* Selection happens via Stepper Factor modal only */}
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
  Add Evaluators Externally
</button>

          </div>
          
          <Table
            columns={evaluatorColumns}
            data={selectedEvaluators}
            onRemove={handleRemoveEvaluator}
            emptyMessage="No evaluators selected. Click 'Add Evaluators' to get started."
          />
        </div>

        {/* Advanced Options removed */}

        {/* Summary Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Info className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Review & Confirm</h2>
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
          <div className="mt-6">
            <button
              onClick={handleSaveAll}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Save Campaign
            </button>
          </div>

        </div>

        {/* Stepper Wizard */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
          {/* Stepper header */}
          <div className="flex items-center justify-between mb-6">
            {[
              { id: 0, label: 'Campaign Info' },
              { id: 1, label: 'Employees' },
              { id: 2, label: 'Evaluators' },
              { id: 3, label: 'Factors' },
              { id: 4, label: 'Review & Confirm' },
            ].map((step, idx) => (
              <div key={step.id} className="flex-1 flex items-center">
                <button
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeStep === idx
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50 border border-transparent'
                  }`}
                  onClick={() => setActiveStep(idx)}
                >
                  {idx === 0 && <CheckCircle className="w-4 h-4 text-blue-600" />}
                  {idx === 1 && <Users className="w-4 h-4 text-blue-600" />}
                  {idx === 2 && <UserCheck className="w-4 h-4 text-purple-600" />}
                  {idx === 3 && <Target className="w-4 h-4 text-green-600" />}
                  {idx === 4 && <Info className="w-4 h-4 text-gray-700" />}
                  {step.label}
                </button>
                {idx < 4 && (
                  <div className="flex-1 h-px mx-2 bg-gray-200" />
                )}
              </div>
            ))}
          </div>

          {/* Step content */}
          <div className="space-y-4">
            {activeStep === 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Campaign Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                    <div className="text-sm text-gray-600">Selected Campaign</div>
                    <div className="text-base font-semibold text-gray-900 mt-1">
                      {campaigns.find((c) => String(c.id) === String(selectedCampaign))?.name || '—'}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {campaigns.find((c) => String(c.id) === String(selectedCampaign))?.description || ''}
                    </div>
                  </div>
                  {/* Employee Group display removed */}
                </div>
              </div>
            )}

            {activeStep === 1 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Employees</h3>
                <Table
                  columns={employeeColumns}
                  data={filteredSelectedEmployees}
                  onRemove={(idx) => {
                    const row = filteredSelectedEmployees[idx];
                    if (row) {
                      handleRemoveEmployeeById(row.id);
                    }
                  }}
                  emptyMessage="No employees selected. Use the Employees section above to add."
                />
              </div>
            )}

            {activeStep === 2 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Evaluators</h3>
                <Table
                  columns={evaluatorColumns}
                  data={selectedEvaluators}
                  onRemove={handleRemoveEvaluator}
                  emptyMessage="No evaluators selected. Use the Evaluators section above to add."
                />
              </div>
            )}

            {activeStep === 3 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Factors</h3>
                  <button
                    onClick={() => setShowFactorModal(true)}
                    className="inline-flex items-center gap-2 font-medium px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white focus:ring-2 focus:ring-green-500 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Factor
                  </button>
                </div>
                {/* Show selected factors grouped by type */}
                {['qualitative','quantitative','recommended'].map((type) => {
                  const list = factorSelections[type] || [];
                  if (list.length === 0) return null;
                  return (
                    <div key={type.id} className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium text-gray-700 capitalize">{type}</div>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{list.length}</span>
                      </div>
                      <div className="space-y-2">
                        {list.map((f) => (
                          <div key={f.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{f.name}</div>
                              {f.description && (
                                <div className="text-xs text-gray-600">{f.description}</div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                className="p-2 rounded hover:bg-red-50 text-red-600"
                                title="Remove factor"
                                onClick={() => {
                                  setFactorSelections((prev) => {
                                    const current = prev[type] || [];
                                    return { ...prev, [type]: current.filter((x) => x.id !== f.id) };
                                  });
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {/* If nothing selected at all */}
                {Object.values(factorSelections).reduce((n, arr) => n + (arr?.length || 0), 0) === 0 && (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                    No factors selected yet. Use the Factors section above to add.
                  </div>
                )}
              </div>
            )}

            {activeStep === 4 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Review & Confirm</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="text-2xl font-bold text-blue-600 mb-1">{filteredSelectedEmployees.length}</div>
                    <div className="text-sm font-medium text-blue-800">Employees</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                    <div className="text-2xl font-bold text-green-600 mb-1">{getTotalSelectedFactors()}</div>
                    <div className="text-sm font-medium text-green-800">Factors</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
                    <div className="text-2xl font-bold text-purple-600 mb-1">{selectedEvaluators.length}</div>
                    <div className="text-sm font-medium text-purple-800">Evaluators</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-sm font-medium text-gray-800 mb-1">Campaign</div>
                    <div className="text-base font-semibold text-gray-900">
                      {campaigns.find((c) => String(c.id) === String(selectedCampaign))?.name || '—'}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={handleSaveAll}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
                  >
                    Save Campaign
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Step navigation */}
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
              disabled={activeStep === 0}
              className={`px-4 py-2 rounded-lg border ${activeStep === 0 ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50 border-gray-300'}`}
            >
              Previous
            </button>
            {activeStep < 4 ? (
              <button
                onClick={() => setActiveStep((s) => Math.min(4, s + 1))}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSaveAll}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Save Campaign
              </button>
            )}
          </div>
        </div>

      </main>

      {/* Employee Selection Modal */}
     <EmployeeModal
  isOpen={showEmployeeModal}
  onClose={() => setShowEmployeeModal(false)}
  data={filteredEmployeesMaster}                 // Filtered by selected Employee Group
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
    // ensure runtime level exists
    const withLevel = { ...newEvaluator, level: newEvaluator.level ?? '' };

    // add to master evaluators
    setEvaluators(prev => [...prev, withLevel]);

    // add to selected evaluators, preserve existing levels if same id existed
    setSelectedEvaluators(prev => {
      const map = new Map(prev.map(e => [e.id, e]));
      const existing = map.get(withLevel.id);
      if (existing) {
        map.set(withLevel.id, { ...existing, ...withLevel, level: existing.level ?? withLevel.level });
      } else {
        map.set(withLevel.id, withLevel);
      }
      return Array.from(map.values());
    });

    // If a campaign is selected, assign evaluator to campaign in backend
    // stub: skip backend assign
  }}
/>

<FactorModal
  isOpen={showFactorModal}
  onClose={() => setShowFactorModal(false)}
  factors={factors}
  selectedByType={factorSelections}
  onConfirm={(type, list) => {
    setFactorSelections((prev) => ({ ...prev, [type]: list }));
    setShowFactorModal(false);
  }}
/>


    </div>
  );
}