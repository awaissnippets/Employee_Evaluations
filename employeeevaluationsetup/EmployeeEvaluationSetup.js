import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Users, UserCheck, Target, Info, Plus, Trash2, X } from 'lucide-react';

// --- STUBBED API FUNCTIONS ---------------------------------------
async function fetchCampaigns() {
  return [
    { id: '1', name: 'Annual Review 2025', status: 'draft', description: 'Yearly performance cycle' },
    { id: '2', name: 'Mid-Year Review 2025', status: 'active', description: 'Mid-year performance check' },
  ];
}

async function fetchEmployees() {
  return [
    { id: 'EMP001', name: 'John Smith', department: 'IT', designation: 'Senior Developer' },
    { id: 'EMP002', name: 'Sarah Johnson', department: 'HR', designation: 'HR Manager' },
    { id: 'EMP003', name: 'Mike Wilson', department: 'Finance', designation: 'Analyst' },
  ];
}

async function fetchEvaluators() {
  return [
    { id: 'EVAL001', username: 'admin', name: 'Admin User', department: 'Management' },
    { id: 'EVAL002', username: 'hr_manager', name: 'HR Manager', department: 'HR' },
    { id: 'EVAL003', username: 'teamlead_it', name: 'IT Lead', department: 'IT' },
  ];
}

async function fetchFactors() {
  return [
    { id: 1, name: 'Teamwork', type: 'qualitative', description: 'Works well with others', marksLevel: 5 },
    { id: 2, name: 'Quality', type: 'qualitative', description: 'Quality of deliverables', marksLevel: 5 },
    { id: 3, name: 'Sales Target', type: 'quantitative', description: 'Quarterly sales', totalMarks: 100, passingMarks: 50 },
    { id: 4, name: 'Attendance', type: 'quantitative', description: 'Presence at work', totalMarks: 100, passingMarks: 80 },
    { id: 5, name: 'Innovation', type: 'recommended', description: 'Suggests improvements' },
  ];
}

async function saveCampaign(data) {
  console.log('POST /campaigns (stub)', data);
  return { id: 'new-id', ...data };
}

async function updateCampaign(data) {
  console.log('PUT /campaigns/:id (stub)', data);
  return { ...data };
}
// -----------------------------------------------------------------

// Simple reusable Table
const Table = ({ columns = [], data = [], onRemove = null, emptyMessage = 'No data available' }) => {
  if (data.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-500 text-sm">{emptyMessage}</p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
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
                  <td key={column.key || colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {column.render ? column.render(item[column.key], item, index) : item[column.key] || '-'}
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

// Employee Selection Modal (with search + pre-check)
const EmployeeModal = ({ isOpen = false, onClose = () => {}, data = [], selectedItems = [], onConfirm = () => {} }) => {
  const [localSelectedItems, setLocalSelectedItems] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isOpen) setLocalSelectedItems([...selectedItems]);
  }, [isOpen, selectedItems]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter(d =>
      String(d.id).toLowerCase().includes(q) ||
      (d.name || '').toLowerCase().includes(q) ||
      (d.department || '').toLowerCase().includes(q)
    );
  }, [data, query]);

  const toggle = (item) => {
    if (localSelectedItems.some(sel => sel.id === item.id)) {
      setLocalSelectedItems(prev => prev.filter(sel => sel.id !== item.id));
    } else {
      setLocalSelectedItems(prev => [...prev, item]);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Select Employees</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
        </div>
        <div className="p-4 border-b border-gray-200">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by ID, Name or Department"
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div className="flex-1 overflow-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Designation</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Select</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{item.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.department}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.designation}</td>
                  <td className="px-4 py-3 text-sm">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={localSelectedItems.some(sel => sel.id === item.id)}
                      onChange={() => toggle(item)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100">Cancel</button>
          <button onClick={() => onConfirm(localSelectedItems)} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Confirm</button>
        </div>
      </div>
    </div>
  );
};

// Evaluator Selection Modal (with search + pre-check)
const EvaluatorModal = ({ isOpen = false, onClose = () => {}, data = [], selectedItems = [], onConfirm = () => {} }) => {
  const [localSelectedItems, setLocalSelectedItems] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isOpen) setLocalSelectedItems([...selectedItems]);
  }, [isOpen, selectedItems]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter(d =>
      String(d.id).toLowerCase().includes(q) ||
      (d.username || d.name || '').toLowerCase().includes(q) ||
      (d.department || '').toLowerCase().includes(q)
    );
  }, [data, query]);

  const toggle = (item) => {
    if (localSelectedItems.some(sel => sel.id === item.id)) {
      setLocalSelectedItems(prev => prev.filter(sel => sel.id !== item.id));
    } else {
      setLocalSelectedItems(prev => [...prev, item]);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Select Evaluators</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
        </div>
        <div className="p-4 border-b border-gray-200">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by ID, Name or Department"
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div className="flex-1 overflow-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Select</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{item.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.name || item.username}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.department}</td>
                  <td className="px-4 py-3 text-sm">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      checked={localSelectedItems.some(sel => sel.id === item.id)}
                      onChange={() => toggle(item)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100">Cancel</button>
          <button onClick={() => onConfirm(localSelectedItems)} className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700">Confirm</button>
        </div>
      </div>
    </div>
  );
};

// Factor Selection Modal (type dropdown + checkbox list)
const FactorModal = ({ isOpen = false, onClose = () => {}, factors = [], selectedItems = [], onConfirm = () => {} }) => {
  const [type, setType] = useState('qualitative');
  const [query, setQuery] = useState('');
  const [localSelectedItems, setLocalSelectedItems] = useState([]);

  useEffect(() => {
    if (isOpen) setLocalSelectedItems([...selectedItems]);
  }, [isOpen, selectedItems]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = factors.filter(f => f.type === type);
    if (!q) return list;
    return list.filter(f =>
      (f.name || '').toLowerCase().includes(q) ||
      (f.description || '').toLowerCase().includes(q)
    );
  }, [factors, type, query]);

  const toggle = (item) => {
    if (localSelectedItems.some(sel => sel.id === item.id)) {
      setLocalSelectedItems(prev => prev.filter(sel => sel.id !== item.id));
    } else {
      setLocalSelectedItems(prev => [...prev, item]);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add Factors</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
        </div>
        <div className="p-4 border-b border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-3">
          <select value={type} onChange={(e) => setType(e.target.value)} className="px-3 py-2 border rounded-lg">
            <option value="qualitative">Qualitative</option>
            <option value="quantitative">Quantitative</option>
            <option value="recommended">Recommended</option>
          </select>
          <div className="md:col-span-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or description"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Select</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{f.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{f.description}</td>
                  {type === 'qualitative' && (
                    <td className="px-4 py-3 text-sm text-gray-900">{f.marksLevel ?? '-'}</td>
                  )}
                  {type === 'quantitative' && (
                    <>
                      <td className="px-4 py-3 text-sm text-gray-900">{f.totalMarks ?? '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{f.passingMarks ?? '-'}</td>
                    </>
                  )}
                  <td className="px-4 py-3 text-sm">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      checked={localSelectedItems.some(sel => sel.id === f.id)}
                      onChange={() => toggle(f)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100">Cancel</button>
          <button onClick={() => onConfirm(localSelectedItems)} className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700">Confirm</button>
        </div>
      </div>
    </div>
  );
};

// Manual (External) Evaluator Modal - only place for typed input
const ManualEvaluatorModal = ({ isOpen = false, onClose = () => {}, onCreated = () => {} }) => {
  const [form, setForm] = useState({ name: '', email: '', department: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!form.name || !form.email) { setError('Name and Email are required'); return; }
    try {
      setLoading(true);
      setError(null);
      // Stub create
      const newEvaluator = { id: `EVAL_${Date.now()}`, name: form.name, username: form.email, department: form.department };
      onCreated(newEvaluator);
      onClose();
      setForm({ name: '', email: '', department: '' });
    } catch (e) {
      setError(e.message || 'Failed to create');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Add Evaluator Externally</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
        </div>
        {error && <div className="p-2 text-sm rounded bg-red-100 text-red-700">{error}</div>}
        <input className="w-full px-3 py-2 border rounded-lg" placeholder="Full Name" value={form.name} onChange={(e)=>setForm(f=>({...f,name:e.target.value}))} />
        <input className="w-full px-3 py-2 border rounded-lg" placeholder="Email" value={form.email} onChange={(e)=>setForm(f=>({...f,email:e.target.value}))} />
        <input className="w-full px-3 py-2 border rounded-lg" placeholder="Department" value={form.department} onChange={(e)=>setForm(f=>({...f,department:e.target.value}))} />
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className={`font-semibold px-4 py-2 rounded-lg shadow-md text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>{loading ? 'Saving...' : 'Add Evaluator'}</button>
        </div>
      </div>
    </div>
  );
};

export default function EmployeeEvaluationSetup() {
  // Core state
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState([]); // [{id,...}]
  const [selectedEvaluators, setSelectedEvaluators] = useState([]); // [{id,..., level}]
  const [selectedFactors, setSelectedFactors] = useState([]); // [{id, name, type, ...}]

  // Master lists
  const [campaigns, setCampaigns] = useState([]);
  const [employeesMaster, setEmployeesMaster] = useState([]);
  const [evaluatorsMaster, setEvaluatorsMaster] = useState([]);
  const [factorsMaster, setFactorsMaster] = useState([]);

  // UI state
  const [currentStep, setCurrentStep] = useState(0);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showEvaluatorModal, setShowEvaluatorModal] = useState(false);
  const [showFactorModal, setShowFactorModal] = useState(false);
  const [showManualEvaluatorModal, setShowManualEvaluatorModal] = useState(false);

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [saveError, setSaveError] = useState(null);

  // Load initial data via stubs
  useEffect(() => {
    const loadAll = async () => {
      try {
        const [c, e, v, f] = await Promise.all([
          fetchCampaigns(),
          fetchEmployees(),
          fetchEvaluators(),
          fetchFactors(),
        ]);
        setCampaigns(c || []);
        setEmployeesMaster(e || []);
        setEvaluatorsMaster(v || []);
        setFactorsMaster(f || []);
      } catch (err) {
        console.error(err);
      }
    };
    loadAll();
  }, []);

  const getTotalSelectedFactors = useCallback(() => selectedFactors.length, [selectedFactors]);

  const employeeColumns = [
    { key: 'srNo', label: 'Sr. No', render: (value, item, index) => index + 1 },
    { key: 'id', label: 'Employee ID' },
    { key: 'name', label: 'Name' },
    { key: 'department', label: 'Department' },
    { key: 'designation', label: 'Designation' },
  ];

  const evaluatorColumns = [
    { key: 'srNo', label: 'Sr. No', render: (value, item, index) => index + 1 },
    { key: 'username', label: 'Username', render: (v, item) => item.username || item.name || '-' },
    { key: 'department', label: 'Department' },
    { key: 'level', label: 'Level', render: (v, item, index) => (
      <input
        type="number"
        min={1}
        className="w-20 px-2 py-1 border rounded"
        value={Number(item.level ?? 1)}
        onChange={(e) => {
          const val = Number(e.target.value) || 1;
          setSelectedEvaluators(prev => prev.map((ev, i) => i === index ? { ...ev, level: val } : ev));
        }}
      />
    ) },
  ];

  const factorDynamicColumns = useMemo(() => {
    const hasQual = selectedFactors.some(f => f.type === 'qualitative');
    const hasQuant = selectedFactors.some(f => f.type === 'quantitative');
    const cols = [
      { key: 'srNo', label: 'Sr. No', render: (v, item, idx) => idx + 1 },
      { key: 'name', label: 'Factor Name' },
      { key: 'type', label: 'Type' },
      { key: 'description', label: 'Description' },
    ];
    if (hasQual) cols.push({ key: 'marksLevel', label: 'Marks Level' });
    if (hasQuant) {
      cols.push({ key: 'totalMarks', label: 'Total Marks' });
      cols.push({ key: 'passingMarks', label: 'Passing Marks' });
    }
    return cols;
  }, [selectedFactors]);

  const handleEmployeeConfirm = useCallback(async (pickedEmployees) => {
    setSelectedEmployees(prev => {
      const map = new Map(prev.map(e => [e.id, e]));
      pickedEmployees.forEach(e => map.set(e.id, e));
      return Array.from(map.values());
    });
  }, []);

  const handleRemoveEmployee = useCallback(async (index) => {
    const emp = (prev => prev[index])(selectedEmployees);
    if (!emp) return;
    setSelectedEmployees(prev => prev.filter((_, i) => i !== index));
  }, [selectedEmployees]);

  const handleEvaluatorConfirm = useCallback(async (pickedEvaluators) => {
    setSelectedEvaluators(prev => {
      const map = new Map(prev.map(e => [e.id, e]));
      pickedEvaluators.forEach(e => map.set(e.id, { ...e, level: map.get(e.id)?.level ?? 1 }));
      return Array.from(map.values());
    });
  }, []);

  const handleRemoveEvaluator = useCallback(async (index) => {
    const ev = (prev => prev[index])(selectedEvaluators);
    if (!ev) return;
    setSelectedEvaluators(prev => prev.filter((_, i) => i !== index));
  }, [selectedEvaluators]);

  const handleFactorConfirm = useCallback(async (pickedFactors) => {
    setSelectedFactors(prev => {
      const map = new Map(prev.map(f => [f.id, f]));
      pickedFactors.forEach(f => map.set(f.id, f));
      return Array.from(map.values());
    });
  }, []);

  const handleSaveAll = useCallback(async () => {
    try {
      setIsSaving(true);
      setSaveMessage(null);
      setSaveError(null);
      const payload = {
        campaignId: selectedCampaign || null,
        employees: selectedEmployees.map(e => ({ id: e.id })),
        evaluators: selectedEvaluators.map(e => ({ id: e.id, level: Number(e.level ?? 1) })),
        factors: selectedFactors.map(f => ({ id: f.id })),
      };
      if (selectedCampaign) {
        await updateCampaign(payload);
      } else {
        await saveCampaign(payload);
      }
      setSaveMessage('Campaign saved successfully.');
    } catch (err) {
      console.error(err);
      setSaveError(err.message || 'Failed to save.');
    } finally {
      setIsSaving(false);
    }
  }, [selectedCampaign, selectedEmployees, selectedEvaluators, selectedFactors]);

  const steps = [
    { id: 0, name: 'Campaign' },
    { id: 1, name: 'Employees' },
    { id: 2, name: 'Evaluators' },
    { id: 3, name: 'Factors' },
    { id: 4, name: 'Review & Confirm' },
  ];

  return (
    <div className="min-h-screen w-full bg-white">
      {(saveMessage || saveError) && (
        <div className={`${saveError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'} rounded-lg p-3 m-4`}>
          {saveError || saveMessage}
        </div>
      )}

      {/* Stepper */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          {steps.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(idx)}
              className={`flex-1 mx-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${currentStep === idx ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'}`}
            >
              {step.name}
            </button>
          ))}
        </div>
      </div>

      {/* Step Content */}
      {currentStep === 0 && (
        <div className="p-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Campaign Selection</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Campaign</label>
                <select
                  value={selectedCampaign}
                  onChange={(e) => setSelectedCampaign(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose a campaign...</option>
                  {campaigns.map(c => (
                    <option key={c.id} value={c.id}>{c.name}{c.status ? ` (${c.status})` : ''}</option>
                  ))}
                </select>
                {selectedCampaign && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">{campaigns.find(c => String(c.id) === String(selectedCampaign))?.description || ' '}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {currentStep === 1 && (
        <div className="p-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Users className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Employees</h2>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{selectedEmployees.length} selected</span>
              </div>
              <button
                onClick={() => setShowEmployeeModal(true)}
                className="inline-flex items-center gap-2 font-medium px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Employees
              </button>
            </div>
            <Table
              columns={employeeColumns}
              data={selectedEmployees}
              onRemove={handleRemoveEmployee}
              emptyMessage="No employees selected. Click 'Add Employees' to get started."
            />
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="p-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <UserCheck className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-semibold text-gray-900">Evaluators</h2>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{selectedEvaluators.length} selected</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowEvaluatorModal(true)}
                  className="inline-flex items-center gap-2 font-medium px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white focus:ring-2 focus:ring-purple-500 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Evaluators
                </button>
                <button
                  onClick={() => setShowManualEvaluatorModal(true)}
                  className="inline-flex items-center gap-2 font-medium px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white focus:ring-2 focus:ring-green-500 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Externally
                </button>
              </div>
            </div>
            <Table
              columns={evaluatorColumns}
              data={selectedEvaluators}
              onRemove={handleRemoveEvaluator}
              emptyMessage="No evaluators selected. Click 'Add Evaluators' to get started."
            />
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className="p-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Target className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">Evaluation Factors</h2>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{getTotalSelectedFactors()} selected</span>
              </div>
              <button
                onClick={() => setShowFactorModal(true)}
                className="inline-flex items-center gap-2 font-medium px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white focus:ring-2 focus:ring-green-500 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Factors
              </button>
            </div>
            <Table
              columns={factorDynamicColumns}
              data={selectedFactors}
              onRemove={(idx) => setSelectedFactors(prev => prev.filter((_, i) => i !== idx))}
              emptyMessage="No factors selected. Click 'Add Factors' to choose."
            />
          </div>
        </div>
      )}

      {currentStep === 4 && (
        <div className="p-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Review & Confirm</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{selectedEmployees.length}</div>
                  <div className="text-sm font-medium text-blue-800">Employees</div>
                </div>
                <div className="text-center p-6 bg-purple-50 rounded-xl border border-purple-100">
                  <div className="text-3xl font-bold text-purple-600 mb-2">{selectedEvaluators.length}</div>
                  <div className="text-sm font-medium text-purple-800">Evaluators</div>
                </div>
                <div className="text-center p-6 bg-green-50 rounded-xl border border-green-100">
                  <div className="text-3xl font-bold text-green-600 mb-2">{selectedFactors.length}</div>
                  <div className="text-sm font-medium text-green-800">Factors</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Employees</h3>
              <Table columns={employeeColumns} data={selectedEmployees} emptyMessage="No employees selected." />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Evaluators</h3>
              <Table columns={evaluatorColumns} data={selectedEvaluators} emptyMessage="No evaluators selected." />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Factors</h3>
              <Table columns={factorDynamicColumns} data={selectedFactors} emptyMessage="No factors selected." />
            </div>

            <div className="flex justify-end">
              <button onClick={handleSaveAll} disabled={isSaving} className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg ${isSaving ? 'opacity-75' : ''}`}>
                {isSaving ? 'Saving...' : 'Save Campaign'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <EmployeeModal
        isOpen={showEmployeeModal}
        onClose={() => setShowEmployeeModal(false)}
        data={employeesMaster}
        selectedItems={selectedEmployees}
        onConfirm={(items) => { setShowEmployeeModal(false); handleEmployeeConfirm(items); }}
      />
      <EvaluatorModal
        isOpen={showEvaluatorModal}
        onClose={() => setShowEvaluatorModal(false)}
        data={evaluatorsMaster}
        selectedItems={selectedEvaluators}
        onConfirm={(items) => { setShowEvaluatorModal(false); handleEvaluatorConfirm(items); }}
      />
      <FactorModal
        isOpen={showFactorModal}
        onClose={() => setShowFactorModal(false)}
        factors={factorsMaster}
        selectedItems={selectedFactors}
        onConfirm={(items) => { setShowFactorModal(false); handleFactorConfirm(items); }}
      />
      <ManualEvaluatorModal
        isOpen={showManualEvaluatorModal}
        onClose={() => setShowManualEvaluatorModal(false)}
        onCreated={(newEvaluator) => {
          setEvaluatorsMaster(prev => [...prev, newEvaluator]);
          setSelectedEvaluators(prev => {
            const map = new Map(prev.map(e => [e.id, e]));
            map.set(newEvaluator.id, { ...newEvaluator, level: 1 });
            return Array.from(map.values());
          });
        }}
      />
    </div>
  );
}

