import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Users,
  UserCheck,
  Target,
  Info,
  CheckCircle,
  Plus,
  Trash2,
  X
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
};
// -----------------------------------------------------------------

// --- Factors (static for now) ------------------------------------
const FACTOR_TYPES = [
  { id: 'performance', name: 'Performance', description: 'Work output and goal achievement' },
  { id: 'behavior', name: 'Behavior', description: 'Professional conduct and soft skills' },
  { id: 'technical', name: 'Technical Skills', description: 'Job-specific technical competencies' },
];

const FACTORS_DATA = {
  performance: [
    { id: 'perf1', name: 'Goal Achievement', description: 'Meeting set objectives and targets' },
    { id: 'perf2', name: 'Quality of Work', description: 'Standard and accuracy of deliverables' },
  ],
  behavior: [
    { id: 'beh1', name: 'Team Collaboration', description: 'Working effectively with others' },
    { id: 'beh2', name: 'Communication Skills', description: 'Clear and effective communication' },
  ],
  technical: [
    { id: 'tech1', name: 'Technical Expertise', description: 'Domain-specific knowledge and skills' },
    { id: 'tech2', name: 'Problem Solving', description: 'Analytical and troubleshooting abilities' },
  ],
};
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

// Employee Selection Modal
const EmployeeModal = ({ isOpen = false, onClose = () => {}, data = [], selectedItems = [], onConfirm = () => {} }) => {
  const [localSelectedItems, setLocalSelectedItems] = useState([]);
  useEffect(() => {
    if (isOpen) setLocalSelectedItems([...selectedItems]);
  }, [isOpen, selectedItems]);

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
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Select Employees</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
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
              {data.map((item) => (
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

// Evaluator Selection Modal
const EvaluatorModal = ({ isOpen = false, onClose = () => {}, data = [], selectedItems = [], onConfirm = () => {} }) => {
  const [localSelectedItems, setLocalSelectedItems] = useState([]);
  useEffect(() => {
    if (isOpen) setLocalSelectedItems([...selectedItems]);
  }, [isOpen, selectedItems]);

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
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Select Evaluators</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
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
              {data.map((item) => (
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

export default function EmployeeEvaluationSetup() {
  // Core state
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [employeeCategory, setEmployeeCategory] = useState('officer');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedEvaluators, setSelectedEvaluators] = useState([]);
  const [selectedFactorType, setSelectedFactorType] = useState('');
  const [factorSelections, setFactorSelections] = useState({});

  // Master lists
  const [campaigns, setCampaigns] = useState([]);
  const [employeesMaster, setEmployeesMaster] = useState([]);
  const [evaluatorsMaster, setEvaluatorsMaster] = useState([]);

  // UI state
  const [currentStep, setCurrentStep] = useState(0);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showEvaluatorModal, setShowEvaluatorModal] = useState(false);

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [saveError, setSaveError] = useState(null);

  // Load initial data
  useEffect(() => {
    const loadAll = async () => {
      try {
        const [c, e, v] = await Promise.all([
          CampaignAPI.list(),
          EmployeeAPI.list(),
          EvaluatorAPI.list(),
        ]);
        setCampaigns(Array.isArray(c) ? c : c?.data ?? []);
        setEmployeesMaster(Array.isArray(e) ? e : e?.data ?? []);
        setEvaluatorsMaster(Array.isArray(v) ? v : v?.data ?? []);
      } catch (err) {
        console.error(err);
      }
    };
    loadAll();
  }, []);

  // Derived: employees filtered by category
  const filteredEmployeesMaster = useMemo(() => {
    // TODO: confirm real field name for employee category (assuming `category` exists)
    return employeesMaster.filter(emp => {
      const cat = (emp.category || '').toString().toLowerCase();
      return employeeCategory ? cat === employeeCategory.toLowerCase() : true;
    });
  }, [employeesMaster, employeeCategory]);

  const getCurrentFactors = useCallback(() => {
    if (!selectedFactorType) return [];
    return FACTORS_DATA[selectedFactorType] || [];
  }, [selectedFactorType]);

  const getTotalSelectedFactors = useCallback(() => {
    return Object.values(factorSelections).reduce((total, factors) => total + factors.length, 0);
  }, [factorSelections]);

  const handleFactorToggle = useCallback((factor) => {
    if (!selectedFactorType) return;
    setFactorSelections(prev => {
      const current = prev[selectedFactorType] || [];
      const exists = current.some(f => f.id === factor.id);
      return {
        ...prev,
        [selectedFactorType]: exists ? current.filter(f => f.id !== factor.id) : [...current, factor]
      };
    });
  }, [selectedFactorType]);

  const isFactorSelected = useCallback((factor) => {
    if (!selectedFactorType) return false;
    return (factorSelections[selectedFactorType] || []).some(f => f.id === factor.id);
  }, [selectedFactorType, factorSelections]);

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
    { key: 'role', label: 'Role' },
    { key: 'department', label: 'Department' },
  ];

  const factorColumns = [
    { key: 'srNo', label: 'Sr. No', render: (value, item, index) => index + 1 },
    { key: 'name', label: 'Factor Name' },
    { key: 'description', label: 'Description' },
    {
      key: 'selected',
      label: 'Selected',
      render: (_value, item) => (
        <input
          type="checkbox"
          checked={isFactorSelected(item)}
          onChange={() => handleFactorToggle(item)}
          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
        />
      )
    }
  ];

  const handleEmployeeConfirm = useCallback(async (pickedEmployees) => {
    const ids = pickedEmployees.map(e => e.id);
    try {
      if (selectedCampaign) {
        await EmployeeAPI.addToCampaign(selectedCampaign, ids);
      }
      setSelectedEmployees(prev => {
        const map = new Map(prev.map(e => [e.id, e]));
        pickedEmployees.forEach(e => map.set(e.id, e));
        return Array.from(map.values());
      });
    } catch (err) {
      console.error(err);
      alert(`Failed to add employees: ${err.message}`);
    }
  }, [selectedCampaign]);

  const handleRemoveEmployee = useCallback(async (index) => {
    const emp = (prev => prev[index])(selectedEmployees);
    if (!emp) return;
    try {
      if (selectedCampaign) {
        await EmployeeAPI.removeFromCampaign(selectedCampaign, [emp.id]);
      }
      setSelectedEmployees(prev => prev.filter((_, i) => i !== index));
    } catch (err) {
      console.error(err);
      alert(`Failed to remove employee: ${err.message}`);
    }
  }, [selectedEmployees, selectedCampaign]);

  const handleEvaluatorConfirm = useCallback(async (pickedEvaluators) => {
    const ids = pickedEvaluators.map(e => e.id);
    try {
      if (selectedCampaign) {
        await EvaluatorAPI.addToCampaign(selectedCampaign, ids);
      }
      setSelectedEvaluators(prev => {
        const map = new Map(prev.map(e => [e.id, e]));
        pickedEvaluators.forEach(e => map.set(e.id, e));
        return Array.from(map.values());
      });
    } catch (err) {
      console.error(err);
      alert(`Failed to add evaluators: ${err.message}`);
    }
  }, [selectedCampaign]);

  const handleRemoveEvaluator = useCallback(async (index) => {
    const ev = (prev => prev[index])(selectedEvaluators);
    if (!ev) return;
    try {
      if (selectedCampaign) {
        await EvaluatorAPI.removeFromCampaign(selectedCampaign, [ev.id]);
      }
      setSelectedEvaluators(prev => prev.filter((_, i) => i !== index));
    } catch (err) {
      console.error(err);
      alert(`Failed to remove evaluator: ${err.message}`);
    }
  }, [selectedEvaluators, selectedCampaign]);

  const handleSaveAll = useCallback(async () => {
    try {
      setIsSaving(true);
      setSaveMessage(null);
      setSaveError(null);
      const payload = {
        campaignId: selectedCampaign || null,
        employeeCategory,
        employees: selectedEmployees,
        evaluators: selectedEvaluators,
        factors: factorSelections,
      };
      await api('/employee-evaluations', { method: 'POST', body: payload });
      setSaveMessage('Campaign saved successfully.');
    } catch (err) {
      console.error(err);
      setSaveError(err.message || 'Failed to save.');
    } finally {
      setIsSaving(false);
    }
  }, [selectedCampaign, employeeCategory, selectedEmployees, selectedEvaluators, factorSelections]);

  const steps = [
    { id: 0, name: 'Campaign' },
    { id: 1, name: 'Employees' },
    { id: 2, name: 'Evaluators' },
    { id: 3, name: 'Factors' },
    { id: 4, name: 'Review & Confirm' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
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

        {/* Stepper */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
              Campaign Selection
            </h2>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Employee Group</label>
                <select
                  value={employeeCategory}
                  onChange={(e) => setEmployeeCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="officer">Officer</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {currentStep === 1 && (
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
        )}

        {currentStep === 2 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <UserCheck className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-semibold text-gray-900">Evaluators</h2>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{selectedEvaluators.length} selected</span>
              </div>
              <button
                onClick={() => setShowEvaluatorModal(true)}
                className="inline-flex items-center gap-2 font-medium px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white focus:ring-2 focus:ring-purple-500 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Evaluators
              </button>
            </div>
            <Table
              columns={evaluatorColumns}
              data={selectedEvaluators}
              onRemove={handleRemoveEvaluator}
              emptyMessage="No evaluators selected. Click 'Add Evaluators' to get started."
            />
          </div>
        )}

        {currentStep === 3 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Target className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Evaluation Factors</h2>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{getTotalSelectedFactors()} total selected</span>
            </div>
            <div className="mb-6 max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">Factor Type</label>
              <select
                value={selectedFactorType}
                onChange={(e) => setSelectedFactorType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Select factor type...</option>
                {FACTOR_TYPES.map(t => (
                  <option key={t.id} value={t.id}>{t.name} - {t.description}</option>
                ))}
              </select>
            </div>
            {selectedFactorType && (
              <Table
                columns={factorColumns}
                data={getCurrentFactors()}
                emptyMessage="No factors available for the selected type."
              />
            )}
          </div>
        )}

        {currentStep === 4 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Info className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Review & Confirm</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-100">
                <div className="text-3xl font-bold text-blue-600 mb-2">{selectedEmployees.length}</div>
                <div className="text-sm font-medium text-blue-800">Employees</div>
                <div className="text-xs text-blue-600 mt-1">filtered group: {employeeCategory}</div>
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
                    <div className="text-base font-semibold text-gray-900">{campaigns.find(c => String(c.id) === String(selectedCampaign))?.name || '—'}</div>
                    <div className="text-xs text-gray-600 mt-2">{campaigns.find(c => String(c.id) === String(selectedCampaign))?.description || ''}</div>
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
            <div className="flex justify-end">
              <button
                onClick={handleSaveAll}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Save Campaign
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Modals */}
      <EmployeeModal
        isOpen={showEmployeeModal}
        onClose={() => setShowEmployeeModal(false)}
        data={filteredEmployeesMaster}
        selectedItems={[]}
        onConfirm={(items) => { setShowEmployeeModal(false); handleEmployeeConfirm(items); }}
      />
      <EvaluatorModal
        isOpen={showEvaluatorModal}
        onClose={() => setShowEvaluatorModal(false)}
        data={evaluatorsMaster}
        selectedItems={[]}
        onConfirm={(items) => { setShowEvaluatorModal(false); handleEvaluatorConfirm(items); }}
      />
    </div>
  );
}

