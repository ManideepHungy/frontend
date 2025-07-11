"use client";
import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlusCircle } from "react-icons/fa";
import { toast } from 'react-toastify';

export default function ManageShiftsPage() {
  const [tab, setTab] = useState<'shiftcategory' | 'recurringshifts'>('recurringshifts');
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [recurringShifts, setRecurringShifts] = useState<any[]>([]);
  const [loadingRecurring, setLoadingRecurring] = useState(false);
  const [errorRecurring, setErrorRecurring] = useState("");
  const [addName, setAddName] = useState("");
  const [addIcon, setAddIcon] = useState("");
  const [addError, setAddError] = useState("");
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<number|null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [editError, setEditError] = useState("");
  const [editing, setEditing] = useState(false);

  // Recurring Shift Add/Edit Modal State
  const [showAddRecurring, setShowAddRecurring] = useState(false);
  const [addRecurring, setAddRecurring] = useState({
    name: '',
    dayOfWeek: 0,
    startTime: '',
    endTime: '',
    shiftCategoryId: '',
    location: '',
    slots: 1
  });
  const [addRecurringError, setAddRecurringError] = useState('');
  const [addingRecurring, setAddingRecurring] = useState(false);
  const [addRecurringTouched, setAddRecurringTouched] = useState<{[key: string]: boolean}>({});

  const [editRecurringId, setEditRecurringId] = useState<number|null>(null);
  const [editRecurring, setEditRecurring] = useState({
    name: '',
    dayOfWeek: 0,
    startTime: '',
    endTime: '',
    shiftCategoryId: '',
    location: '',
    slots: 1
  });
  const [editRecurringError, setEditRecurringError] = useState('');
  const [editingRecurring, setEditingRecurring] = useState(false);

  // Fetch shift categories for dropdown
  const [categoryOptions, setCategoryOptions] = useState<any[]>([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDay, setFilterDay] = useState('');
  const [filterShiftName, setFilterShiftName] = useState('');

  useEffect(() => {
    if (tab === 'recurringshifts' || showAddRecurring || editRecurringId) {
      fetchCategoryOptions();
    }
    // eslint-disable-next-line
  }, [tab, showAddRecurring, editRecurringId]);
  const fetchCategoryOptions = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shift-categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCategoryOptions(data);
    } catch {
      setCategoryOptions([]);
    }
  };

  useEffect(() => {
    if (tab === 'shiftcategory') fetchCategories();
    if (tab === 'recurringshifts') fetchRecurringShifts();
    // eslint-disable-next-line
  }, [tab]);

  const fetchCategories = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shift-categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch shift categories");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      setError("Failed to load shift categories.");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecurringShifts = async () => {
    setLoadingRecurring(true);
    setErrorRecurring("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/recurring-shifts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch recurring shifts");
      const data = await res.json();
      setRecurringShifts(data);
    } catch (err) {
      setErrorRecurring("Failed to load recurring shifts.");
      setRecurringShifts([]);
    } finally {
      setLoadingRecurring(false);
    }
  };

  // Add Shift Category
  const handleAddCategory = async () => {
    setAdding(true);
    setAddError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shift-categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: addName.trim(), icon: addIcon.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add category');
      setShowAdd(false);
      setAddName("");
      setAddIcon("");
      fetchCategories();
      toast.success('Category added successfully!');
    } catch (err: any) {
      setAddError(err.message || 'Failed to add category');
      toast.error(err.message || 'Failed to add category');
    } finally {
      setAdding(false);
    }
  };

  // Edit Shift Category
  const handleEdit = (cat: any) => {
    setEditId(cat.id);
    setEditName(cat.name);
    setEditIcon(cat.icon || "");
    setEditError("");
  };
  const handleEditCategory = async () => {
    if (!editId) return;
    setEditing(true);
    setEditError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shift-categories/${editId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: editName.trim(), icon: editIcon.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update category');
      setEditId(null);
      setEditName("");
      setEditIcon("");
      fetchCategories();
      toast.success('Category updated successfully!');
    } catch (err: any) {
      setEditError(err.message || 'Failed to update category');
      toast.error(err.message || 'Failed to update category');
    } finally {
      setEditing(false);
    }
  };
  const handleCancelEdit = () => {
    setEditId(null);
    setEditName("");
    setEditIcon("");
    setEditError("");
  };

  // Delete Shift Category
  const handleDelete = async (cat: any) => {
    if (!window.confirm(`Delete category "${cat.name}"? This cannot be undone.`)) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shift-categories/${cat.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete category');
      fetchCategories();
      toast.success('Category deleted successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete category');
    }
  };

  // Add Recurring Shift
  const handleAddRecurringShift = async () => {
    setAddingRecurring(true);
    setAddRecurringError('');
    try {
      // Validate that start time is at least 1 hour before end time
      const baseDate = '1969-06-10';
      if (addRecurring.startTime && addRecurring.endTime) {
        const start = new Date(`${baseDate}T${addRecurring.startTime}`);
        const end = new Date(`${baseDate}T${addRecurring.endTime}`);
        const diffMs = end.getTime() - start.getTime();
        if (diffMs < 60 * 60 * 1000) {
          setAddRecurringError('Shift end time must be at least 1 hour after start time.');
          setAddingRecurring(false);
          return;
        }
      }
      const token = localStorage.getItem("token");
      // Create times in Halifax timezone (UTC-3 or UTC-4 depending on DST)
      const startTime = addRecurring.startTime ? `${baseDate}T${addRecurring.startTime}:00-03:00` : '';
      const endTime = addRecurring.endTime ? `${baseDate}T${addRecurring.endTime}:00-03:00` : '';
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/recurring-shifts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...addRecurring,
          startTime,
          endTime,
          shiftCategoryId: Number(addRecurring.shiftCategoryId),
          dayOfWeek: Number(addRecurring.dayOfWeek),
          slots: Number(addRecurring.slots)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add recurring shift');
      setShowAddRecurring(false);
      setAddRecurring({ name: '', dayOfWeek: 0, startTime: '', endTime: '', shiftCategoryId: '', location: '', slots: 1 });
      fetchRecurringShifts();
      toast.success('Recurring shift added successfully!');
    } catch (err: any) {
      setAddRecurringError(err.message || 'Failed to add recurring shift');
      toast.error(err.message || 'Failed to add recurring shift');
    } finally {
      setAddingRecurring(false);
    }
  };

  // Edit Recurring Shift
  const handleEditRecurring = (shift: any) => {
    setEditRecurringId(shift.id);
    setEditRecurring({
      name: shift.name,
      dayOfWeek: shift.dayOfWeek,
      startTime: shift.startTime ? shift.startTime.slice(11, 16) : '',
      endTime: shift.endTime ? shift.endTime.slice(11, 16) : '',
      shiftCategoryId: String(shift.shiftCategoryId),
      location: shift.location,
      slots: shift.slots
    });
    setEditRecurringError('');
  };
  const handleEditRecurringShift = async () => {
    if (!editRecurringId) return;
    setEditingRecurring(true);
    setEditRecurringError('');
    try {
      // Validate that start time is at least 1 hour before end time
      const baseDate = '1969-06-10';
      if (editRecurring.startTime && editRecurring.endTime) {
        const start = new Date(`${baseDate}T${editRecurring.startTime}`);
        const end = new Date(`${baseDate}T${editRecurring.endTime}`);
        const diffMs = end.getTime() - start.getTime();
        if (diffMs < 60 * 60 * 1000) {
          setEditRecurringError('Shift end time must be at least 1 hour after start time.');
          setEditingRecurring(false);
          return;
        }
      }
      const token = localStorage.getItem("token");
      // Create times in Halifax timezone (UTC-3 or UTC-4 depending on DST)
      const startTime = editRecurring.startTime ? `${baseDate}T${editRecurring.startTime}:00-03:00` : '';
      const endTime = editRecurring.endTime ? `${baseDate}T${editRecurring.endTime}:00-03:00` : '';
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/recurring-shifts/${editRecurringId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...editRecurring,
          startTime,
          endTime,
          shiftCategoryId: Number(editRecurring.shiftCategoryId),
          dayOfWeek: Number(editRecurring.dayOfWeek),
          slots: Number(editRecurring.slots)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update recurring shift');
      setEditRecurringId(null);
      fetchRecurringShifts();
      toast.success('Recurring shift updated successfully!');
    } catch (err: any) {
      setEditRecurringError(err.message || 'Failed to update recurring shift');
      toast.error(err.message || 'Failed to update recurring shift');
    } finally {
      setEditingRecurring(false);
    }
  };
  const handleCancelEditRecurring = () => {
    setEditRecurringId(null);
    setEditRecurringError('');
  };

  // Delete Recurring Shift
  const handleDeleteRecurring = async (shift: any) => {
    if (!window.confirm(`Delete recurring shift "${shift.name}"? This cannot be undone.`)) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/recurring-shifts/${shift.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete recurring shift');
      fetchRecurringShifts();
      toast.success('Recurring shift deleted successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete recurring shift');
    }
  };

  const isRecurringNameValid = /^[A-Za-z\s]+$/.test(addRecurring.name.trim());
  const isRecurringDayValid = typeof addRecurring.dayOfWeek === 'number' && addRecurring.dayOfWeek >= 0 && addRecurring.dayOfWeek <= 6;
  const isRecurringStartTimeValid = !!addRecurring.startTime;
  const isRecurringEndTimeValid = !!addRecurring.endTime;
  const isRecurringCategoryValid = !!addRecurring.shiftCategoryId;
  const isRecurringLocationValid = addRecurring.location.trim().length > 0;
  const isRecurringSlotsValid = Number(addRecurring.slots) > 0;
  const isRecurringFormValid = isRecurringNameValid && isRecurringDayValid && isRecurringStartTimeValid && isRecurringEndTimeValid && isRecurringCategoryValid && isRecurringLocationValid && isRecurringSlotsValid;

  const isCategoryNameValid = addName.trim().length > 0;

  // Unique shift names for dropdown (case-insensitive, trimmed)
  const shiftNameOptions = Array.from(
    recurringShifts
      .filter(shift => !filterCategory || String(shift.shiftCategoryId) === filterCategory)
      .reduce((map, shift) => {
        const normalized = shift.name.trim().toLowerCase();
        if (!map.has(normalized)) {
          map.set(normalized, shift.name.trim());
        }
        return map;
      }, new Map<string, string>())
      .values()
  ) as string[];
  shiftNameOptions.sort();

  return (
    <main style={{ padding: 32 }}>
      <div style={{ fontWeight: 700, fontSize: 28, marginBottom: 24 }}>Manage Shifts</div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <button
          onClick={() => setTab('recurringshifts')}
          style={{
            padding: '10px 24px',
            borderRadius: 8,
            border: 'none',
            background: tab === 'recurringshifts' ? '#ff9800' : '#eee',
            color: tab === 'recurringshifts' ? '#fff' : '#888',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: tab === 'recurringshifts' ? '0 2px 8px #ffd699' : 'none',
            transition: 'all 0.15s'
          }}
        >
          Recurring Shifts
        </button>
        <button
          onClick={() => setTab('shiftcategory')}
          style={{
            padding: '10px 24px',
            borderRadius: 8,
            border: 'none',
            background: tab === 'shiftcategory' ? '#ff9800' : '#eee',
            color: tab === 'shiftcategory' ? '#fff' : '#888',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: tab === 'shiftcategory' ? '0 2px 8px #ffd699' : 'none',
            transition: 'all 0.15s'
          }}
        >
          Shift Category
        </button>
      </div>
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.03)', padding: 32, minHeight: 200, position: 'relative' }}>
        {tab === 'shiftcategory' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <button onClick={() => setShowAdd(true)} style={{ background: 'none', border: 'none', color: '#ff9800', fontSize: 28, cursor: 'pointer' }} title="Add Shift Category">
                <FaPlusCircle />
              </button>
            </div>
            {loading ? (
              <div style={{ textAlign: 'center', color: '#888' }}>Loading...</div>
            ) : error ? (
              <div style={{ textAlign: 'center', color: 'red' }}>{error}</div>
            ) : categories.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#888' }}>No shift categories found.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#fafafa', color: '#888', fontWeight: 600 }}>
                    <th style={{ textAlign: 'left', padding: '12px 0 12px 12px' }}>Icon</th>
                    <th style={{ textAlign: 'left', padding: '12px 0' }}>Name</th>
                    <th style={{ textAlign: 'center', padding: 12 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(cat => (
                    <tr key={cat.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '12px 0 12px 12px' }}>{cat.icon || <span style={{ color: '#ccc' }}>-</span>}</td>
                      <td style={{ padding: '12px 0' }}>{cat.name}</td>
                      <td style={{ padding: 12, textAlign: 'center' }}>
                        <button style={{ background: 'none', border: 'none', color: '#ff9800', cursor: 'pointer', marginRight: 12 }} title="Edit" onClick={() => handleEdit(cat)}>
                          <FaEdit />
                        </button>
                        <button style={{ background: 'none', border: 'none', color: '#e53935', cursor: 'pointer' }} title="Delete" onClick={() => handleDelete(cat)}>
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {/* Add Shift Category Modal */}
            {showAdd && (
              <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.15)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ background: '#fff', borderRadius: 10, padding: 32, minWidth: 320, boxShadow: '0 2px 16px #ddd', position: 'relative' }}>
                  <button onClick={() => setShowAdd(false)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', fontSize: 20, color: '#888', cursor: 'pointer' }}>×</button>
                  <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 18 }}>Add Shift Category</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <input placeholder="Name" value={addName} onChange={e => setAddName(e.target.value)} style={{ padding: 8, borderRadius: 5, border: '1px solid #eee', width: '100%' }} />
                      <div style={{ color: '#666', fontSize: 12, marginTop: 4 }}>
                        Category names must be unique within your organization
                      </div>
                      {addName.trim() && categories.find(
                        cat => cat.name.toLowerCase() === addName.trim().toLowerCase()
                      ) && (
                        <div style={{ color: '#f44336', fontSize: 12, marginTop: 4 }}>
                          Category "{addName.trim()}" already exists
                        </div>
                      )}
                    </div>
                    <input placeholder="Icon (optional)" value={addIcon} onChange={e => setAddIcon(e.target.value)} style={{ padding: 8, borderRadius: 5, border: '1px solid #eee' }} />
                    {addError && <div style={{ color: 'red', fontSize: 13, textAlign: 'center' }}>{addError}</div>}
                    <button onClick={handleAddCategory} style={{ background: (isCategoryNameValid && !categories.find(cat => cat.name.toLowerCase() === addName.trim().toLowerCase())) ? '#ff9800' : '#ccc', color: '#fff', fontWeight: 700, border: 'none', borderRadius: 6, padding: '10px 0', fontSize: 16, marginTop: 8, cursor: adding ? 'not-allowed' : (isCategoryNameValid && !categories.find(cat => cat.name.toLowerCase() === addName.trim().toLowerCase())) ? 'pointer' : 'not-allowed', opacity: adding ? 0.7 : 1 }} disabled={adding || !isCategoryNameValid || !!categories.find(cat => cat.name.toLowerCase() === addName.trim().toLowerCase())}>
                      {adding ? 'Adding...' : 'Add'}
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* Edit Shift Category Modal */}
            {editId && (
              <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.15)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ background: '#fff', borderRadius: 10, padding: 32, minWidth: 320, boxShadow: '0 2px 16px #ddd', position: 'relative' }}>
                  <button onClick={handleCancelEdit} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', fontSize: 20, color: '#888', cursor: 'pointer' }}>×</button>
                  <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 18 }}>Edit Shift Category</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <input placeholder="Name" value={editName} onChange={e => setEditName(e.target.value)} style={{ padding: 8, borderRadius: 5, border: '1px solid #eee' }} />
                    <input placeholder="Icon (optional)" value={editIcon} onChange={e => setEditIcon(e.target.value)} style={{ padding: 8, borderRadius: 5, border: '1px solid #eee' }} />
                    {editError && <div style={{ color: 'red', fontSize: 13, textAlign: 'center' }}>{editError}</div>}
                    <button onClick={handleEditCategory} style={{ background: '#ff9800', color: '#fff', fontWeight: 700, border: 'none', borderRadius: 6, padding: '10px 0', fontSize: 16, marginTop: 8, cursor: editing ? 'not-allowed' : 'pointer', opacity: editing ? 0.7 : 1 }} disabled={editing || !editName.trim()}>
                      {editing ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        {tab === 'recurringshifts' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ padding: 8, borderRadius: 5, border: '1px solid #eee', minWidth: 180 }}>
                  <option value="">All Categories</option>
                  {categoryOptions.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.icon ? `${opt.icon} ` : ''}{opt.name}</option>
                  ))}
                </select>
                <select value={filterDay} onChange={e => setFilterDay(e.target.value)} style={{ padding: 8, borderRadius: 5, border: '1px solid #eee', minWidth: 180 }}>
                  <option value="">All Days</option>
                  {['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map((day, i) => (
                    <option key={i} value={i}>{day}</option>
                  ))}
                </select>
                {/* Shift Name Dropdown */}
                <select
                  value={filterShiftName}
                  onChange={e => setFilterShiftName(e.target.value)}
                  style={{
                    padding: 8,
                    borderRadius: 5,
                    border: '1px solid #eee',
                    minWidth: 180
                  }}
                >
                  <option value="">All Shifts</option>
                  {shiftNameOptions.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
              <button onClick={() => setShowAddRecurring(true)} style={{ background: 'none', border: 'none', color: '#ff9800', fontSize: 28, cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Add Recurring Shift">
                <FaPlusCircle />
              </button>
            </div>
            {loadingRecurring ? (
              <div style={{ textAlign: 'center', color: '#888' }}>Loading...</div>
            ) : errorRecurring ? (
              <div style={{ textAlign: 'center', color: 'red' }}>{errorRecurring}</div>
            ) : recurringShifts.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#888' }}>No recurring shifts found.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#fafafa', color: '#888', fontWeight: 600 }}>
                    <th style={{ textAlign: 'left', padding: '12px 0 12px 12px' }}>Category</th>
                    <th style={{ textAlign: 'left', padding: '12px 0' }}>Name</th>
                    <th style={{ textAlign: 'left', padding: 12 }}>Day</th>
                    <th style={{ textAlign: 'left', padding: 12 }}>Start</th>
                    <th style={{ textAlign: 'left', padding: 12 }}>End</th>
                    <th style={{ textAlign: 'left', padding: 12 }}>Location</th>
                    <th style={{ textAlign: 'left', padding: 12 }}>Slots</th>
                    <th style={{ textAlign: 'center', padding: 12 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recurringShifts
                    .filter(shift => !filterCategory || String(shift.shiftCategoryId) === filterCategory)
                    .filter(shift => filterDay === '' || String(shift.dayOfWeek) === filterDay)
                    .filter(shift => !filterShiftName || shift.name.trim() === filterShiftName)
                    .map(shift => (
                      <tr key={shift.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '12px 0 12px 12px', whiteSpace: 'nowrap' }}>
                          {shift.ShiftCategory?.icon || <span style={{ color: '#ccc' }}>-</span>}
                          <span style={{ marginLeft: 0 }}>{shift.ShiftCategory?.name || '-'}</span>
                        </td>
                        <td style={{ padding: '12px 0' }}>{shift.name}</td>
                        <td style={{ padding: 12 }}>{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][shift.dayOfWeek]}</td>
                        <td style={{ padding: 12 }}>{shift.startTime ? new Date(shift.startTime).toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Halifax' }) : ''}</td>
                        <td style={{ padding: 12 }}>{shift.endTime ? new Date(shift.endTime).toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Halifax' }) : ''}</td>
                        <td style={{ padding: 12 }}>{shift.location}</td>
                        <td style={{ padding: 12 }}>{shift.slots}</td>
                        <td style={{ padding: 12, textAlign: 'center' }}>
                          <button style={{ background: 'none', border: 'none', color: '#ff9800', cursor: 'pointer', marginRight: 12 }} title="Edit" onClick={() => handleEditRecurring(shift)}>
                            <FaEdit />
                          </button>
                          <button style={{ background: 'none', border: 'none', color: '#e53935', cursor: 'pointer' }} title="Delete" onClick={() => handleDeleteRecurring(shift)}>
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
            {/* Add Recurring Shift Modal */}
            {showAddRecurring && (
              <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.15)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ background: '#fff', borderRadius: 10, padding: 32, minWidth: 340, boxShadow: '0 2px 16px #ddd', position: 'relative' }}>
                  <button onClick={() => setShowAddRecurring(false)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', fontSize: 20, color: '#888', cursor: 'pointer' }}>×</button>
                  <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 18 }}>Add Recurring Shift</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <input placeholder="Name" value={addRecurring.name} onChange={e => setAddRecurring(r => ({ ...r, name: e.target.value }))} onBlur={() => setAddRecurringTouched(t => ({ ...t, name: true }))} onFocus={() => setAddRecurringTouched(t => ({ ...t, name: true }))} style={{ padding: 8, borderRadius: 5, border: '1px solid #eee' }} />
                    {addRecurringTouched.name && !isRecurringNameValid && <div style={{ color: 'red', fontSize: 13 }}>Name is required.</div>}
                    <select value={addRecurring.dayOfWeek} onChange={e => setAddRecurring(r => ({ ...r, dayOfWeek: Number(e.target.value) }))} onBlur={() => setAddRecurringTouched(t => ({ ...t, dayOfWeek: true }))} onFocus={() => setAddRecurringTouched(t => ({ ...t, dayOfWeek: true }))} style={{ padding: 8, borderRadius: 5, border: '1px solid #eee' }}>
                      {[...Array(7)].map((_, i) => <option key={i} value={i}>{['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][i]}</option>)}
                    </select>
                    {addRecurringTouched.dayOfWeek && !isRecurringDayValid && <div style={{ color: 'red', fontSize: 13 }}>Day is required.</div>}
                    <input type="time" value={addRecurring.startTime} onChange={e => setAddRecurring(r => ({ ...r, startTime: e.target.value }))} onBlur={() => setAddRecurringTouched(t => ({ ...t, startTime: true }))} onFocus={() => setAddRecurringTouched(t => ({ ...t, startTime: true }))} style={{ padding: 8, borderRadius: 5, border: '1px solid #eee' }} />
                    {addRecurringTouched.startTime && !isRecurringStartTimeValid && <div style={{ color: 'red', fontSize: 13 }}>Start time is required.</div>}
                    <input type="time" value={addRecurring.endTime} onChange={e => setAddRecurring(r => ({ ...r, endTime: e.target.value }))} onBlur={() => setAddRecurringTouched(t => ({ ...t, endTime: true }))} onFocus={() => setAddRecurringTouched(t => ({ ...t, endTime: true }))} style={{ padding: 8, borderRadius: 5, border: '1px solid #eee' }} />
                    {addRecurringTouched.endTime && !isRecurringEndTimeValid && <div style={{ color: 'red', fontSize: 13 }}>End time is required.</div>}
                    <select value={addRecurring.shiftCategoryId} onChange={e => setAddRecurring(r => ({ ...r, shiftCategoryId: e.target.value }))} onBlur={() => setAddRecurringTouched(t => ({ ...t, shiftCategoryId: true }))} onFocus={() => setAddRecurringTouched(t => ({ ...t, shiftCategoryId: true }))} style={{ padding: 8, borderRadius: 5, border: '1px solid #eee' }}>
                      <option value="">Select Category</option>
                      {categoryOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.icon ? `${opt.icon} ` : ''}{opt.name}</option>)}
                    </select>
                    {addRecurringTouched.shiftCategoryId && !isRecurringCategoryValid && <div style={{ color: 'red', fontSize: 13 }}>Category is required.</div>}
                    <input placeholder="Location" value={addRecurring.location} onChange={e => setAddRecurring(r => ({ ...r, location: e.target.value }))} onBlur={() => setAddRecurringTouched(t => ({ ...t, location: true }))} onFocus={() => setAddRecurringTouched(t => ({ ...t, location: true }))} style={{ padding: 8, borderRadius: 5, border: '1px solid #eee' }} />
                    {addRecurringTouched.location && !isRecurringLocationValid && <div style={{ color: 'red', fontSize: 13 }}>Location is required.</div>}
                    <input type="number" min={1} placeholder="Slots" value={addRecurring.slots} onChange={e => setAddRecurring(r => ({ ...r, slots: Number(e.target.value) }))} onBlur={() => setAddRecurringTouched(t => ({ ...t, slots: true }))} onFocus={() => setAddRecurringTouched(t => ({ ...t, slots: true }))} style={{ padding: 8, borderRadius: 5, border: '1px solid #eee' }} />
                    {addRecurringTouched.slots && !isRecurringSlotsValid && <div style={{ color: 'red', fontSize: 13 }}>Slots must be at least 1.</div>}
                    {addRecurringError && <div style={{ color: 'red', fontSize: 13, textAlign: 'center' }}>{addRecurringError}</div>}
                    <button onClick={handleAddRecurringShift} style={{ background: isRecurringFormValid ? '#EF5C11' : '#ccc', color: '#fff', fontWeight: 700, border: 'none', borderRadius: 6, padding: '10px 0', fontSize: 16, marginTop: 8, cursor: isRecurringFormValid ? 'pointer' : 'not-allowed', opacity: addingRecurring ? 0.7 : 1 }} disabled={addingRecurring || !isRecurringFormValid}>
                      {addingRecurring ? 'Adding...' : 'Add'}
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* Edit Recurring Shift Modal */}
            {editRecurringId && (
              <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.15)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ background: '#fff', borderRadius: 10, padding: 32, minWidth: 340, boxShadow: '0 2px 16px #ddd', position: 'relative' }}>
                  <button onClick={handleCancelEditRecurring} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', fontSize: 20, color: '#888', cursor: 'pointer' }}>×</button>
                  <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 18 }}>Edit Recurring Shift</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <input placeholder="Name" value={editRecurring.name} onChange={e => setEditRecurring(r => ({ ...r, name: e.target.value }))} style={{ padding: 8, borderRadius: 5, border: '1px solid #eee' }} />
                    <select value={editRecurring.dayOfWeek} onChange={e => setEditRecurring(r => ({ ...r, dayOfWeek: Number(e.target.value) }))} style={{ padding: 8, borderRadius: 5, border: '1px solid #eee' }}>
                      {[...Array(7)].map((_, i) => <option key={i} value={i}>{['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][i]}</option>)}
                    </select>
                    <input type="time" value={editRecurring.startTime} onChange={e => setEditRecurring(r => ({ ...r, startTime: e.target.value }))} style={{ padding: 8, borderRadius: 5, border: '1px solid #eee' }} />
                    <input type="time" value={editRecurring.endTime} onChange={e => setEditRecurring(r => ({ ...r, endTime: e.target.value }))} style={{ padding: 8, borderRadius: 5, border: '1px solid #eee' }} />
                    <select value={editRecurring.shiftCategoryId} onChange={e => setEditRecurring(r => ({ ...r, shiftCategoryId: e.target.value }))} style={{ padding: 8, borderRadius: 5, border: '1px solid #eee' }}>
                      <option value="">Select Category</option>
                      {categoryOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.icon ? `${opt.icon} ` : ''}{opt.name}</option>)}
                    </select>
                    <input placeholder="Location" value={editRecurring.location} onChange={e => setEditRecurring(r => ({ ...r, location: e.target.value }))} style={{ padding: 8, borderRadius: 5, border: '1px solid #eee' }} />
                    <input type="number" min={1} placeholder="Slots" value={editRecurring.slots} onChange={e => setEditRecurring(r => ({ ...r, slots: Number(e.target.value) }))} style={{ padding: 8, borderRadius: 5, border: '1px solid #eee' }} />
                    {editRecurringError && <div style={{ color: 'red', fontSize: 13, textAlign: 'center' }}>{editRecurringError}</div>}
                    <button onClick={handleEditRecurringShift} style={{ background: '#ff9800', color: '#fff', fontWeight: 700, border: 'none', borderRadius: 6, padding: '10px 0', fontSize: 16, marginTop: 8, cursor: editingRecurring ? 'not-allowed' : 'pointer', opacity: editingRecurring ? 0.7 : 1 }} disabled={editingRecurring || !editRecurring.name.trim() || !editRecurring.startTime || !editRecurring.endTime || !editRecurring.shiftCategoryId || !editRecurring.location || !editRecurring.slots}>
                      {editingRecurring ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
} 