"use client";
import React, { useEffect, useState, useRef } from "react";
import { FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";
import { MultiSelect } from "react-multi-select-component";
import { toast } from 'react-toastify';
import type { ToastContainerProps } from 'react-toastify';


export default function ScheduleShiftsPage() {
  const [shifts, setShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<number>(0);
  const [bookedUserIds, setBookedUserIds] = useState<number[]>([]);

  // Add modal state
  const [addData, setAddData] = useState<{
    shiftCategoryId: string;
    shiftName: string;
    shiftTiming: string;
    userIds: number[];
    location?: string;
  }>({
    shiftCategoryId: '',
    shiftName: '',
    shiftTiming: '',
    userIds: []
  });
  const [users, setUsers] = useState<any[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<any[]>([]);

  // Edit modal state
  const [editId, setEditId] = useState<number|null>(null);
  const [editData, setEditData] = useState<any>({ userId: null, shiftId: null });
  const [editError, setEditError] = useState("");
  const [editing, setEditing] = useState(false);

  const [recurringShifts, setRecurringShifts] = useState<any[]>([]);
  const [addDayOfWeek, setAddDayOfWeek] = useState<string>("");
  const [selectedSlotId, setSelectedSlotId] = useState<string>("");
  const [addDate, setAddDate] = useState<string>("");

  // Add state for editing signup
  const [editSignupId, setEditSignupId] = useState<number|null>(null);
  const [editSignupUserId, setEditSignupUserId] = useState<number|null>(null);

  // Add state to track which shift row is being edited and the edited userIds
  const [editShiftId, setEditShiftId] = useState<number|null>(null);
  const [editSignupUserIds, setEditSignupUserIds] = useState<{[signupId: string]: number}>({});

  const [showCategoryWarning, setShowCategoryWarning] = useState(false);
  const [showRecurringWarning, setShowRecurringWarning] = useState(false);

  // Add state for date filter
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'custom'>('today');
  const [customDate, setCustomDate] = useState<string>('');

  // Add a new state for the card tabs' selected category
  const [selectedCardCategory, setSelectedCardCategory] = useState<string>("");

  // Add a ref for the custom date input
  const customDateRef = useRef<HTMLInputElement>(null);

  // Add state for selected card and selected users for the card
  const [selectedRecurringId, setSelectedRecurringId] = useState<number|null>(null);
  const [selectedRecurringUsers, setSelectedRecurringUsers] = useState<any[]>([]);

  const [scheduling, setScheduling] = useState(false);

  // Add new state for employee selection popup
  const [showEmployeePopup, setShowEmployeePopup] = useState(false);
  const [selectedShiftForPopup, setSelectedShiftForPopup] = useState<any>(null);
  const [scheduledEmployees, setScheduledEmployees] = useState<{[shiftId: string]: any[]}>({});
  const [selectedEmployees, setSelectedEmployees] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);

  // Add state for open employee dropdowns
  const [openEmployeeDropdown, setOpenEmployeeDropdown] = useState<{[shiftId: number]: boolean}>({});

  // Add state for which shift's dropdown is open
  const [openUserDropdownShiftId, setOpenUserDropdownShiftId] = useState<number | null>(null);
  const [dropdownSelectedEmployees, setDropdownSelectedEmployees] = useState<any[]>([]);
  const [dropdownLoading, setDropdownLoading] = useState(false);

  // Add state for dropdown selected user IDs
  const [dropdownSelectedUserIds, setDropdownSelectedUserIds] = useState<number[]>([]);

  // Compute today's date string for disabling past dates in custom date picker
  const todayStr = new Date().toISOString().split('T')[0];

  // --- Manage Employees Modal State ---
  const [manageModalOpen, setManageModalOpen] = useState(false);
  const [manageModalData, setManageModalData] = useState<{ scheduled: any[]; unscheduled: any[]; slots: number; booked: number } | null>(null);
  const [manageModalShift, setManageModalShift] = useState<any>(null);
  const [manageModalLoading, setManageModalLoading] = useState(false);

  // Add state for shift name filter
  const [selectedShiftName, setSelectedShiftName] = useState<string>("");

  const handleToggleEmployeeDropdown = (shiftId: number) => {
    setOpenEmployeeDropdown(prev => ({
      ...prev,
      [shiftId]: !prev[shiftId]
    }));
  };

  useEffect(() => {
    fetchShifts();
    fetchUsers();
    fetchCategories();
    fetchRecurringShifts();
  }, []);

  // Fetch users on page load
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      // Ensure we have the correct user data structure
      const formattedUsers = data.map((user: any) => ({
        ...user,
        name: `${user.firstName} ${user.lastName}`.trim()
      }));
      setUsers(formattedUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
      setUsers([]);
    }
  };

  // Fetch categories for dropdown (existing code, but also for add modal)
  useEffect(() => {
    if (showAdd) fetchCategories();
  }, [showAdd]);
  const fetchCategories = async () => {
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

  const fetchShifts = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shifts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch shifts");
      const data = await res.json();
      console.log('Raw shifts data:', data); // Debug log for raw data
      setShifts(data);
    } catch (err) {
      console.error('Error fetching shifts:', err);
      setError("Failed to load shifts.");
      setShifts([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch recurring shifts for add modal
  useEffect(() => {
    if (showAdd) fetchRecurringShifts();
  }, [showAdd]);
  const fetchRecurringShifts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/recurring-shifts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRecurringShifts(data);
    } catch {
      setRecurringShifts([]);
    }
  };

  // Fetch categories and recurring shifts on page load
  useEffect(() => {
    fetchCategories();
    fetchRecurringShifts();
  }, []);

  // Find all recurring shifts for selected category and day
  const matchingSlots = recurringShifts.filter(
    (r) =>
      String(r.shiftCategoryId) === addData.shiftCategoryId &&
      String(r.dayOfWeek) === addDayOfWeek
  );

  // When selectedSlotId changes, set start/end, location, and slots from that slot
  useEffect(() => {
    if (selectedSlotId) {
      const slot = matchingSlots.find(s => String(s.id) === selectedSlotId);
      if (slot) {
        setAddData((d: any) => ({
          ...d,
          startTime: slot.startTime.slice(0, 16),
          endTime: slot.endTime.slice(0, 16),
          location: slot.location,
          slots: slot.slots
        }));
      }
    }
  }, [selectedSlotId]);

  // Reset selectedSlotId if category or day changes
  useEffect(() => {
    setSelectedSlotId("");
  }, [addData.shiftCategoryId, addDayOfWeek]);

  // Update available slots when category or recurring shift is selected
  useEffect(() => {
    if (addData.shiftCategoryId && addData.shiftName) {
      const rec = recurringShifts.find(r => r.name === addData.shiftName && String(r.shiftCategoryId) === addData.shiftCategoryId);
      if (rec) {
        // Calculate next occurrence date
        const today = new Date();
        const dayDiff = (rec.dayOfWeek - today.getDay() + 7) % 7 || 7;
        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + dayDiff);
        const start = new Date(nextDate);
        start.setHours(new Date(rec.startTime).getHours(), new Date(rec.startTime).getMinutes(), 0, 0);
        const end = new Date(nextDate);
        end.setHours(new Date(rec.endTime).getHours(), new Date(rec.endTime).getMinutes(), 0, 0);

        // Find all existing shifts for this category and recurring shift pattern
        const existingShifts = shifts.filter(shift => {
          const shiftStart = new Date(shift.startTime);
          const shiftEnd = new Date(shift.endTime);
          return (
            String(shift.shiftCategoryId) === String(addData.shiftCategoryId) &&
            shiftStart.getTime() === start.getTime() &&
            shiftEnd.getTime() === end.getTime() &&
            shift.location === rec.location
          );
        });

        // Get all booked user IDs from existing shifts
        const bookedIds = existingShifts.flatMap(shift => 
          (shift.ShiftSignup || []).map((signup: any) => signup.userId)
        );

        // Remove duplicates
        const uniqueBookedIds = [...new Set(bookedIds)];
        setBookedUserIds(uniqueBookedIds);

        // Calculate available slots
        const totalBookedSlots = uniqueBookedIds.length;
        const remainingSlots = Math.max(0, rec.slots - totalBookedSlots);
        setAvailableSlots(remainingSlots);
      }
    }
  }, [addData.shiftCategoryId, addData.shiftName]);

  // Filter out already booked users and limit selection based on available slots
  const availableUsers = users.filter(user => !bookedUserIds.includes(user.id));

  // Edit handlers
  const handleEdit = (shift: any) => {
    setEditId(shift.id);
    setEditData({
      userId: shift.ShiftSignup?.[0]?.userId || null,
      shiftId: shift.id
    });
    setEditError("");
  };

  // Update handleEditSave to use editSignupUserIds
  const handleEditSave = async (signupId: number) => {
    setEditing(true);
    try {
      const token = localStorage.getItem("token");
      const userId = editSignupUserIds[signupId];
      const signupRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shiftsignups/${signupId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
      });
      if (!signupRes.ok) {
        const errorData = await signupRes.json();
        throw new Error(errorData.error || 'Failed to update shift signup');
      }
      setEditShiftId(null);
      setEditSignupUserIds({});
      fetchShifts();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update shift signup');
    } finally {
      setEditing(false);
    }
  };

  // Delete handler
  const handleDelete = async (shift: any) => {
    if (!window.confirm(`Delete shift "${shift.name}"? This cannot be undone.`)) return;
    try {
      const token = localStorage.getItem("token");
      
      // Get the shiftsignup ID from the shift data
      const signupId = shift.ShiftSignup?.[0]?.id;
      if (!signupId) {
        throw new Error('Shift signup not found');
      }

      // Delete from shiftsignup table first
      const signupRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shiftsignups/${signupId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!signupRes.ok) {
        const errorData = await signupRes.json();
        throw new Error(errorData.error || 'Failed to delete shift signup');
      }

      // Then delete from shift table
      const shiftRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shifts/${shift.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!shiftRes.ok) {
        const errorData = await shiftRes.json();
        throw new Error(errorData.error || 'Failed to delete shift');
      }

      fetchShifts();
    } catch (err: any) {
      alert(err.message || 'Failed to delete shift');
    }
  };

  const options = users.map(u => ({
    label: u.name,
    value: u.id
  }));

  // Update the Schedule Shift button click handler
  const handleScheduleShift = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const rec = recurringShifts.find(r => r.name === addData.shiftName && String(r.shiftCategoryId) === addData.shiftCategoryId);
      if (!rec) {
        throw new Error('Recurring shift not found');
      }

      // Calculate next occurrence date
      const today = new Date();
      const dayDiff = (rec.dayOfWeek - today.getDay() + 7) % 7 || 7;
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + dayDiff);
      const start = new Date(nextDate);
      start.setHours(new Date(rec.startTime).getHours(), new Date(rec.startTime).getMinutes(), 0, 0);
      const end = new Date(nextDate);
      end.setHours(new Date(rec.endTime).getHours(), new Date(rec.endTime).getMinutes(), 0, 0);

      // Verify no duplicate shifts exist for these users
      const existingShifts = shifts.filter(shift => 
        shift.shiftCategoryId === rec.shiftCategoryId &&
        new Date(shift.startTime).getTime() === start.getTime() &&
        new Date(shift.endTime).getTime() === end.getTime() &&
        shift.location === rec.location
      );

      const existingUserIds = existingShifts.flatMap(shift => 
        (shift.ShiftSignup || []).map((signup: any) => signup.userId)
      );

      // Check for duplicate users
      const duplicateUsers = addData.userIds.filter((userId: number) => existingUserIds.includes(userId));
      if (duplicateUsers.length > 0) {
        const duplicateUserNames = duplicateUsers.map((userId: number) => {
          const user = users.find(u => u.id === userId);
          return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
        });
        throw new Error(`The following users are already booked for this shift: ${duplicateUserNames.join(', ')}`);
      }

      let successCount = 0;
      let errorCount = 0;

      // Process each user individually
      for (const userId of addData.userIds) {
        try {
          // 1. Create the shift for this user
          const shiftRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shifts`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              name: rec.name,
              shiftCategoryId: rec.shiftCategoryId,
              startTime: start.toISOString(),
              endTime: end.toISOString(),
              location: rec.location,
              slots: rec.slots,
              userId: userId
            })
          });

          if (!shiftRes.ok) {
            const errorData = await shiftRes.json();
            throw new Error(errorData.error || 'Failed to create shift');
          }

          const shiftData = await shiftRes.json();

          // 2. Create the shift signup for this user
          const signupRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shiftsignups`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              userId: userId,
              shiftId: shiftData.id,
              checkIn: start.toISOString(),
              checkOut: end.toISOString(),
              mealsServed: 0
            })
          });

          if (!signupRes.ok) {
            const errorData = await signupRes.json();
            throw new Error(errorData.error || 'Failed to create shift signup');
          }

          successCount++;
          const userName = users.find(u => u.id === userId);
          toast.success(`Successfully scheduled shift for ${userName ? `${userName.firstName} ${userName.lastName}` : 'user'}`);
        } catch (err: any) {
          errorCount++;
          const userName = users.find(u => u.id === userId);
          toast.error(`Failed to schedule shift for ${userName ? `${userName.firstName} ${userName.lastName}` : 'user'}: ${err.message}`);
        }
      }

      if (successCount > 0) {
        // Reset form and refresh data
        setAddData({ userIds: [], shiftCategoryId: '', shiftName: '', shiftTiming: '' });
        await fetchShifts();
      }

      if (errorCount > 0) {
        toast.warning(`${errorCount} out of ${addData.userIds.length} shifts failed to schedule`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to schedule shift');
      toast.error(err.message || 'Failed to schedule shift');
    } finally {
      setLoading(false);
    }
  };

  // Save all user assignments for a shift row
  const handleEditSaveAll = async (shift: any) => {
    setEditing(true);
    try {
      const token = localStorage.getItem("token");
      const updates = Object.entries(editSignupUserIds).map(async ([signupId, userId]) => {
        const signup = shift.ShiftSignup.find((s: any) => s.id === Number(signupId));
        if (signup && signup.userId !== userId) {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shiftsignups/${signupId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ userId })
          });
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Failed to update shift signup');
          }
        }
      });
      await Promise.all(updates);
      setEditShiftId(null);
      setEditSignupUserIds({});
      fetchShifts();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update shift signups');
    } finally {
      setEditing(false);
    }
  };

  // Cancel editing for a row
  const handleEditCancel = () => {
    setEditShiftId(null);
    setEditSignupUserIds({});
  };

  // For shift name dropdown, get unique names for the selected category
  const uniqueShiftNames = Array.from(new Set(
    recurringShifts
                .filter(r => String(r.shiftCategoryId) === String(addData.shiftCategoryId))
      .map(r => r.name)
  ));
  // For shift timing dropdown, get unique timings for the selected shift name and category
  const uniqueShiftTimings = Array.from(new Set(
    recurringShifts
      .filter(r => r.name === addData.shiftName && String(r.shiftCategoryId) === String(addData.shiftCategoryId))
                .map(opt => {
                  const today = new Date();
                  const dayDiff = (opt.dayOfWeek - today.getDay() + 7) % 7 || 7;
                  const nextDate = new Date(today);
                  nextDate.setDate(today.getDate() + dayDiff);
                  const start = new Date(nextDate);
                  start.setHours(new Date(opt.startTime).getHours(), new Date(opt.startTime).getMinutes(), 0, 0);
                  const end = new Date(nextDate);
                  end.setHours(new Date(opt.endTime).getHours(), new Date(opt.endTime).getMinutes(), 0, 0);
        return `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      })
  ));

  // Helper for date filtering
  const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
  const isSameWeek = (d1: Date, d2: Date) => {
    const startOfWeek = (date: Date) => {
      const d = new Date(date);
      d.setDate(d.getDate() - d.getDay());
      d.setHours(0,0,0,0);
      return d;
    };
    const endOfWeek = (date: Date) => {
      const d = new Date(date);
      d.setDate(d.getDate() - d.getDay() + 6);
      d.setHours(23,59,59,999);
      return d;
    };
    return d1 >= startOfWeek(d2) && d1 <= endOfWeek(d2);
  };

  // Helper to get next occurrence date for a recurring shift
  const getNextOccurrence = (rec: any) => {
          const today = new Date();
    const todayDay = today.getDay();
    let dayDiff = rec.dayOfWeek - todayDay;
    if (dayDiff < 0) dayDiff += 7;
    // If today is the recurring day, show today (not 7 days later)
          const nextDate = new Date(today);
          nextDate.setDate(today.getDate() + dayDiff);
    nextDate.setHours(new Date(rec.startTime).getHours(), new Date(rec.startTime).getMinutes(), 0, 0);
    return nextDate;
  };

  // Filtered shifts for cards
            const now = new Date();
  const todayDay = now.getDay();
  const weekDays = [0,1,2,3,4,5,6];
  let filteredShifts = shifts.filter((shift: any) => {
              const endTime = new Date(shift.endTime);
              return endTime >= now;
            });
  if (selectedCardCategory) {
    filteredShifts = filteredShifts.filter((shift: any) => String(shift.shiftCategoryId) === selectedCardCategory);
  }
  if (dateFilter === 'today') {
    filteredShifts = filteredShifts.filter((shift: any) => isSameDay(new Date(shift.startTime), now));
  } else if (dateFilter === 'week') {
    filteredShifts = filteredShifts.filter((shift: any) => isSameWeek(new Date(shift.startTime), now));
  } else if (dateFilter === 'custom' && customDate) {
    const custom = new Date(customDate);
    filteredShifts = filteredShifts.filter((shift: any) => isSameDay(new Date(shift.startTime), custom));
  }

  // Filter recurringShifts for the cards
  const filteredRecurring = recurringShifts.filter((rec: any) => {
    // Category filter
    if (selectedCardCategory && String(rec.shiftCategoryId) !== String(selectedCardCategory)) return false;
    // Shift name filter - show all shifts with the same name regardless of timing
    if (selectedShiftName && rec.name !== selectedShiftName) return false;
    // Date filter
    if (dateFilter === 'today') {
      if (rec.dayOfWeek !== todayDay) return false;
    } else if (dateFilter === 'week') {
      if (!weekDays.includes(rec.dayOfWeek)) return false;
    } else if (dateFilter === 'custom' && customDate) {
      // Use local midnight to avoid timezone issues
      const customDay = new Date(customDate + 'T00:00:00').getDay();
      if (rec.dayOfWeek !== customDay) return false;
    } else if (selectedDay && selectedDay !== 'all') {
      // Day filter (if not using dateFilter)
      if (rec.dayOfWeek !== Number(selectedDay)) return false;
    }
    return true;
  });

  // Get unique shift names for the dropdown - only filter by category, not timing, and remove case-insensitive duplicates
  const shiftNameOptions = Array.from(
    recurringShifts
      .filter(rec => !selectedCardCategory || String(rec.shiftCategoryId) === String(selectedCardCategory))
      .reduce((map, rec) => {
        const normalized = rec.name.trim().toLowerCase();
        if (!map.has(normalized)) {
          map.set(normalized, rec.name.trim());
        }
        return map;
      }, new Map<string, string>())
      .values()
  ) as string[];
  shiftNameOptions.sort();

  // Find the selected recurring shift for slot limiting
  const selectedRecurring = filteredRecurring.find((rec: any) => rec.id === selectedRecurringId);
  const maxSlots = selectedRecurring ? selectedRecurring.slots ?? 0 : 0;

  // Add function to fetch scheduled employees for a shift
  type FetchScheduledEmployeesType = (shiftId: number) => Promise<void>;

  const fetchScheduledEmployees: FetchScheduledEmployeesType = async (shiftId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shiftsignups?shiftId=${shiftId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch scheduled employees");
      const data = await res.json();
      setScheduledEmployees(prev => ({
        ...prev,
        [shiftId]: data
      }));
    } catch (err) {
      console.error('Error fetching scheduled employees:', err);
      toast.error("Failed to load scheduled employees");
    }
  };

  // Add function to handle employee selection
  const handleEmployeeSelection = async (shift: any) => {
    try {
      // Fetch existing scheduled employees for this shift
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shiftsignups?shiftId=${shift.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch scheduled employees");
      const existingSignups = await res.json();
      // Set the existing employees as selected
      const existingEmployees = existingSignups.map((signup: any) => ({
        label: signup.User?.name || 'Unknown',
        value: signup.userId
      }));
      setSelectedEmployees(existingEmployees);
      setSelectedShiftForPopup(shift);
      setShowEmployeePopup(true);
    } catch (err) {
      console.error('Error fetching scheduled employees:', err);
      toast.error("Failed to load scheduled employees");
    }
  };

  // Add function to save employee selections
  const handleSaveEmployeeSelection = async () => {
    if (!selectedShiftForPopup) return;
    try {
      setScheduling(true);
                                      const token = localStorage.getItem("token");
      // Get existing signups
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shiftsignups?shiftId=${selectedShiftForPopup.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch existing signups");
      const existingSignups = await res.json();
      // Find employees to add and remove
      const existingUserIds = existingSignups.map((signup: any) => signup.userId);
      const selectedUserIds = selectedEmployees.map(emp => emp.value);
      const toAdd = selectedUserIds.filter((id: number) => !existingUserIds.includes(id));
      const toRemove = existingUserIds.filter((id: number) => !selectedUserIds.includes(id));
      // Remove deselected employees
      for (const userId of toRemove) {
        const signup = existingSignups.find((s: any) => s.userId === userId);
        if (signup) {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shiftsignups/${signup.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          });
        }
      }
      // Add newly selected employees: for each, create shift then shiftsignup
      for (const userId of toAdd) {
        const start = new Date(selectedShiftForPopup.startTime);
        const end = new Date(selectedShiftForPopup.endTime);
        // 1. Create shift
        const shiftRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shifts`, {
                                          method: 'POST',
                                          headers: {
                                            'Content-Type': 'application/json',
                                            Authorization: `Bearer ${token}`
                                          },
                                          body: JSON.stringify({
            name: selectedShiftForPopup.name,
            shiftCategoryId: selectedShiftForPopup.shiftCategoryId,
            startTime: start.toISOString(),
            endTime: end.toISOString(),
            location: selectedShiftForPopup.location,
            slots: selectedShiftForPopup.slots,
            userId: userId
                                          })
                                        });
        if (!shiftRes.ok) throw new Error('Failed to create shift');
        const newShift = await shiftRes.json();
        // 2. Create shiftsignup for the new shift
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shiftsignups`, {
          method: 'POST',
                                          headers: {
                                            'Content-Type': 'application/json',
                                            Authorization: `Bearer ${token}`
                                          },
          body: JSON.stringify({
            userId: userId,
            shiftId: newShift.id,
            checkIn: start.toISOString(),
            checkOut: end.toISOString(),
            mealsServed: 0
          })
        });
      }
      // Refresh the scheduled employees list
      await fetchScheduledEmployees(selectedShiftForPopup.id);
      toast.success("Successfully updated shift employees");
      setShowEmployeePopup(false);
                                    } catch (err: any) {
      toast.error(err.message || "Failed to update shift employees");
                                    } finally {
      setScheduling(false);
    }
  };

  // Modify the shift card rendering to include scheduled employees and the new button
  const renderShiftCard = (rec: any) => {
    const nextDate = getNextOccurrence(rec);
    // Match by shiftCategoryId, location, and isSameDay only
    const matchingShifts = shifts.filter(shift => {
      const shiftStart = new Date(shift.startTime);
      return (
        String(shift.shiftCategoryId) === String(rec.shiftCategoryId) &&
        shift.location === rec.location &&
        isSameDay(shiftStart, nextDate)
      );
    });
    const shiftForModal = matchingShifts[0];

    // Helper to create a shift for this occurrence if it doesn't exist
    const handleManageEmployeesClick = async () => {
      let shiftToUse = shiftForModal;
      if (!shiftToUse) {
        // Create the shift for this occurrence
        try {
          const token = localStorage.getItem("token");
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shifts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              name: rec.name,
              shiftCategoryId: rec.shiftCategoryId,
              startTime: nextDate.toISOString(),
              endTime: (() => {
                const end = new Date(nextDate);
                end.setHours(new Date(rec.endTime).getHours(), new Date(rec.endTime).getMinutes(), 0, 0);
                return end.toISOString();
              })(),
              location: rec.location,
              slots: rec.slots
            })
          });
          if (!res.ok) throw new Error('Failed to create shift');
          shiftToUse = await res.json();
          // Optionally, refresh shifts list
          await fetchShifts();
        } catch (err) {
          toast.error('Failed to create shift for this occurrence');
          return;
        }
      }
      openManageModal(shiftToUse);
    };

    // Sum all signups for these shifts
    const bookedSlots = matchingShifts.reduce((sum, shift) => sum + (shift.ShiftSignup ? shift.ShiftSignup.length : 0), 0);
    const totalSlots = rec.slots || 0;
    const pendingSlots = Math.max(0, totalSlots - bookedSlots);

    return (
      <div key={rec.id} style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.03)', padding: '28px 36px', minHeight: 90, marginBottom: 16, border: '2px solid #f5f5f5', position: 'relative', transition: 'box-shadow 0.2s', gap: 24 }}>
        <div style={{ marginRight: 32, fontSize: 36, width: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span role="img" aria-label="meal">🍲</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 24, marginBottom: 4, fontFamily: 'Poppins,Inter,sans-serif', color: '#222' }}>{rec.name || 'Supper Shift'}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 2 }}>
            <span style={{ color: '#ff9800', fontWeight: 600, fontSize: 18 }}>
              {nextDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
            <span style={{ color: '#888', fontWeight: 500, fontSize: 16 }}>
              {new Date(rec.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}–{new Date(rec.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span style={{ color: '#bbb', fontSize: 15, marginLeft: 8 }}>{rec.location}</span>
          </div>
          {/* Removed Show Employees button for cleaner UI */}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: 180, marginLeft: 24, position: 'relative', gap: 4 }}>
          <span style={{ color: '#333', fontWeight: 500, fontSize: 15, marginBottom: 2 }}>
            <b>Total Slots:</b> {totalSlots}
          </span>
          <div style={{ display: 'flex', flexDirection: 'row', gap: 12, marginBottom: 8 }}>
            <span style={{ color: '#ff9800', fontWeight: 700, fontSize: 16, borderRadius: 14, padding: '6px 18px', background: '#f5f5f5', display: 'inline-block' }}>
              <b>Booked:</b> {bookedSlots}
            </span>
            <span style={{ color: '#ff9800', fontWeight: 700, fontSize: 16, borderRadius: 14, padding: '6px 18px', background: '#f5f5f5', display: 'inline-block' }}>
              <b>Pending:</b> {pendingSlots}
            </span>
          </div>
          <button
            onClick={handleManageEmployeesClick}
            style={{ 
              background: 'linear-gradient(90deg, #ff9800 60%, #ffa726 100%)',
              color: '#fff', 
              border: 'none', 
              borderRadius: 8,
              padding: '10px 22px',
              marginTop: 8,
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 16,
              boxShadow: '0 2px 8px rgba(255,152,0,0.10)',
              letterSpacing: 0.5
            }}
          >
            Manage Employees
          </button>
        </div>
      </div>
    );
  };

  // Initialize filtered users when users change
  useEffect(() => {
    setFilteredUsers(users);
  }, [users]);

  const renderEmployeePopup = () => {
    if (!showEmployeePopup || !selectedShiftForPopup) return null;

    const existingCount = selectedEmployees.length;
    const remainingSlots = selectedShiftForPopup.slots - existingCount;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: 32,
          width: '60%',
          minWidth: 600,
          maxWidth: 1000,
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 24,
            paddingBottom: 16,
            borderBottom: '1px solid #eee'
          }}>
            <h2 style={{ 
              fontSize: 28, 
              fontWeight: 700,
              color: '#333',
              margin: 0
            }}>
              Manage Employees for {selectedShiftForPopup.name}
            </h2>
                            <button
              onClick={() => setShowEmployeePopup(false)}
          style={{ 
                background: 'none',
            border: 'none', 
                fontSize: 24,
                color: '#666',
                cursor: 'pointer',
                padding: 4
              }}
            >
              ×
                            </button>
                          </div>

          <div style={{ 
            background: '#f8f8f8',
            padding: 20,
            borderRadius: 12,
            marginBottom: 24
          }}>
            <div style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16
            }}>
              <div>
                <p style={{ 
                  color: '#666',
                  fontSize: 16,
                  margin: '0 0 8px 0'
                }}>
                  {existingCount} employees currently scheduled
                </p>
                <p style={{ 
                  color: '#666',
                  fontSize: 16,
                  margin: 0
                }}>
                  {remainingSlots} slots remaining
                </p>
        </div>
              <span style={{
                background: '#ff9800',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: 20,
                fontSize: 14,
                fontWeight: 600
              }}>
                {selectedEmployees.length}/{selectedShiftForPopup.slots} Selected
              </span>
            </div>

            {/* Search input */}
            <div style={{ marginBottom: 16 }}>
              <input
                type="text"
                placeholder="Search employees..."
                onChange={(e) => {
                  const searchTerm = e.target.value.toLowerCase();
                  const filtered = users.filter(user => 
                    user.name.toLowerCase().includes(searchTerm)
                  );
                  setFilteredUsers(filtered);
                }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 8,
                  border: '1px solid #ddd',
                  fontSize: 16,
                  outline: 'none'
                }}
              />
            </div>

            {/* Employee list */}
            <div style={{
              background: '#fff',
              borderRadius: 8,
              border: '1px solid #eee',
              maxHeight: '400px',
              overflow: 'auto'
            }}>
              {filteredUsers.map((user) => {
                const isSelected = selectedEmployees.some(emp => emp.value === user.id);
                const wasScheduled = existingCount > 0 && isSelected;
            return (
                  <div
                    key={user.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 16px',
                      borderBottom: '1px solid #eee',
                      cursor: 'pointer',
                      background: isSelected ? '#fff8f3' : '#fff',
                      transition: 'all 0.2s',
                      position: 'relative'
                    }}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedEmployees(prev => prev.filter(emp => emp.value !== user.id));
                    } else {
                        if (selectedEmployees.length < selectedShiftForPopup.slots) {
                          setSelectedEmployees(prev => [...prev, { label: user.name, value: user.id }]);
                        } else {
                          toast.error(`Cannot select more than ${selectedShiftForPopup.slots} employees`);
                        }
                      }
                    }}
                  >
                        <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      style={{ marginRight: 12, width: 20, height: 20 }}
                    />
                    <span style={{
                      fontSize: 16,
                      color: '#333',
                      fontWeight: isSelected ? 600 : 400
                    }}>
                      {user.name}
                    </span>
                    {wasScheduled && (
                      <span style={{
                        position: 'absolute',
                        right: 16,
                        fontSize: 12,
                        color: '#ff9800',
                        background: '#fff8f3',
                        padding: '2px 8px',
                        borderRadius: 12,
                        border: '1px solid #ff9800'
                      }}>
                        Currently Scheduled
                      </span>
                                  )}
                        </div>
                );
              })}
                  </div>
          </div>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: 16,
            marginTop: 24,
            paddingTop: 24,
            borderTop: '1px solid #eee'
          }}>
                <button
              onClick={() => setShowEmployeePopup(false)}
              style={{
                padding: '12px 24px',
                background: '#f5f5f5',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 16,
                fontWeight: 600,
                color: '#666',
                transition: 'all 0.2s'
              }}
            >
              Cancel
                                  </button>
                                  <button
              onClick={handleSaveEmployeeSelection}
              disabled={scheduling}
              style={{
                padding: '12px 32px',
                background: scheduling ? '#ccc' : '#ff9800',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                cursor: scheduling ? 'not-allowed' : 'pointer',
                fontSize: 16,
                fontWeight: 600,
                transition: 'all 0.2s',
                boxShadow: scheduling ? 'none' : '0 2px 8px rgba(255, 152, 0, 0.3)'
              }}
            >
              {scheduling ? 'Saving...' : 'Save Changes'}
                                  </button>
                                </div>
                            </div>
      </div>
    );
  };

  // Add useEffect to fetch scheduled employees when a shift is selected
  useEffect(() => {
    if (selectedRecurringId) {
      fetchScheduledEmployees(selectedRecurringId);
    }
  }, [selectedRecurringId]);

  const handleOpenUserDropdown = async (rec: any) => {
    const nextDate = getNextOccurrence(rec);
    const shiftsForDay = shifts.filter(shift => isSameDay(new Date(shift.startTime), nextDate));
    const matchingShifts = shiftsForDay.filter(shift => {
      return (
        String(shift.shiftCategoryId) === String(rec.shiftCategoryId) &&
        shift.location === rec.location
      );
    });
    const alreadyScheduledUserIds = Array.from(new Set(
      matchingShifts.flatMap(shift => (shift.ShiftSignup || []).map((signup: any) => signup.userId))
    ));
    setDropdownSelectedUserIds(alreadyScheduledUserIds);
    setOpenUserDropdownShiftId(rec.id);
  };

  const handleCloseUserDropdown = () => {
    setOpenUserDropdownShiftId(null);
    setDropdownSelectedEmployees([]);
  };

  const handleSaveUserDropdown = async (shift: any, selectedUserIds: number[]) => {
    setDropdownLoading(true);
    try {
      const token = localStorage.getItem("token");
      // Get existing signups
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shiftsignups?shiftId=${shift.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch existing signups");
      const existingSignups = await res.json();
      const existingUserIds = existingSignups.map((signup: any) => Number(signup.userId));
      const toAdd = selectedUserIds.filter((id: number) => !existingUserIds.includes(id));
      const toRemove = existingUserIds.filter((id: number) => !selectedUserIds.includes(id));
      // Remove deselected employees
      for (const userId of toRemove) {
        const signup = existingSignups.find((s: any) => Number(s.userId) === userId);
        if (signup) {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shiftsignups/${signup.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          });
        }
      }
      // Add newly selected employees: for each, create shift then shiftsignup
      for (const userId of toAdd) {
        const start = new Date(shift.startTime);
        const end = new Date(shift.endTime);
        // 1. Create shift
        const shiftRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shifts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            name: shift.name,
            shiftCategoryId: shift.shiftCategoryId,
            startTime: start.toISOString(),
            endTime: end.toISOString(),
            location: shift.location,
            slots: shift.slots,
            userId: userId
          })
        });
        if (!shiftRes.ok) throw new Error('Failed to create shift');
        const newShift = await shiftRes.json();
        // 2. Create shiftsignup for the new shift
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shiftsignups`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            userId: userId,
            shiftId: newShift.id,
            checkIn: start.toISOString(),
            checkOut: end.toISOString(),
            mealsServed: 0
          })
        });
      }
      await fetchScheduledEmployees(shift.id); // Always refresh after save
      await fetchShifts(); // <--- Add this line to refresh shifts after saving
      toast.success("Successfully updated shift employees");
      handleCloseUserDropdown();
    } catch (err: any) {
      toast.error(err.message || "Failed to update shift employees");
    } finally {
      setDropdownLoading(false);
    }
  };

  const renderUserDropdown = (rec: any) => {
    if (openUserDropdownShiftId !== rec.id) return null;
    // Use dropdownSelectedUserIds and setDropdownSelectedUserIds from main state
    const handleCheckboxChange = (userId: number) => {
      setDropdownSelectedUserIds(prev =>
        prev.includes(userId)
          ? prev.filter(id => id !== userId)
          : prev.length < rec.slots ? [...prev, userId] : prev
      );
    };
    const slotsFull = dropdownSelectedUserIds.length >= rec.slots;
    return (
      <div style={{
        position: 'absolute',
        top: 60,
        right: 0,
        zIndex: 2000,
        background: '#fff',
        border: '1.5px solid #ff9800',
        borderRadius: 12,
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        padding: 24,
        minWidth: 320,
        maxWidth: 400
      }}>
        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 12 }}>Select Employees</div>
        <div style={{ marginBottom: 12, color: '#888', fontSize: 15 }}>
          {dropdownSelectedUserIds.length}/{rec.slots} selected
        </div>
        <div style={{ maxHeight: 220, overflowY: 'auto', marginBottom: 16 }}>
          {users.map(user => {
            const isSelected = dropdownSelectedUserIds.includes(user.id);
            const disableCheckbox = !isSelected && slotsFull;
            return (
              <div
                key={user.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 0',
                  cursor: disableCheckbox ? 'not-allowed' : 'pointer',
                  background: isSelected ? '#fff8f3' : '#fff',
                  borderRadius: 6,
                  opacity: disableCheckbox ? 0.5 : 1
                }}
                onClick={() => !disableCheckbox && handleCheckboxChange(user.id)}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={disableCheckbox}
                  onChange={() => handleCheckboxChange(user.id)}
                  style={{ marginRight: 10, width: 18, height: 18 }}
                />
                <span style={{ fontSize: 16, color: '#333', fontWeight: isSelected ? 600 : 400 }}>{user.name}</span>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button
            onClick={handleCloseUserDropdown}
            style={{ background: '#eee', color: '#333', border: 'none', borderRadius: 6, padding: '8px 20px', fontWeight: 600, fontSize: 15 }}
          >
            Cancel
          </button>
          <button
            onClick={() => handleSaveUserDropdown(rec, dropdownSelectedUserIds)}
            style={{ background: '#ff9800', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', fontWeight: 600, fontSize: 15 }}
          >
            Save
          </button>
        </div>
      </div>
    );
  };

  // Open modal and fetch data
  const openManageModal = async (shift: any) => {
    setManageModalLoading(true);
    setManageModalOpen(true);
    setManageModalShift(shift);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shift-employees?shiftId=${shift.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch shift employees");
      const data = await res.json();
      setManageModalData(data);
    } catch (err) {
      setManageModalData(null);
      toast.error("Failed to load shift employees");
    } finally {
      setManageModalLoading(false);
    }
  };

  // Add employee to shift
  const handleAddEmployee = async (userId: number) => {
    if (!manageModalShift) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shiftsignups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId, shiftId: manageModalShift.id })
      });
      if (!res.ok) throw new Error("Failed to add employee");
      await openManageModal(manageModalShift); // Refresh modal data
    } catch (err) {
      toast.error("Failed to add employee");
    }
  };

  // Remove employee from shift
  const handleRemoveEmployee = async (signupId: number) => {
    if (!manageModalShift) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shiftsignups/${signupId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to remove employee");
      await openManageModal(manageModalShift); // Refresh modal data
    } catch (err) {
      toast.error("Failed to remove employee");
    }
  };

  // Modal component
  const renderManageModal = () => {
    if (!manageModalOpen || !manageModalShift) return null;
    const handleCloseModal = async () => {
      setManageModalOpen(false);
      await fetchShifts(); // Refresh shifts data after closing modal
    };
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.35)',
        zIndex: 3000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: '#fff',
          borderRadius: 16,
          width: '60vw',
          minWidth: 500,
          maxWidth: 900,
          maxHeight: '80vh',
          padding: 36,
          boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
          overflow: 'auto',
          position: 'relative'
        }}>
          <button onClick={handleCloseModal} style={{ position: 'absolute', top: 18, right: 24, background: 'none', border: 'none', fontSize: 28, color: '#888', cursor: 'pointer' }}>×</button>
          <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 18 }}>Manage Employees for {manageModalShift.name}</h2>
          <div style={{ display: 'flex', gap: 32 }}>
            {/* Scheduled Employees */}
            <div style={{ flex: 1, minWidth: 200, background: '#f8f8f8', borderRadius: 10, padding: 18 }}>
              <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 10 }}>Scheduled ({manageModalData?.booked ?? 0}/{manageModalData?.slots ?? 0})</div>
              {manageModalLoading ? <div>Loading...</div> : (
                <>
                  {manageModalData?.scheduled.length === 0 ? (
                    <div style={{ color: '#888', fontSize: 15 }}>No employees scheduled.</div>
                  ) : (
                    manageModalData?.scheduled.map(emp => (
                      <div key={emp.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                        <span style={{ fontSize: 16 }}>{emp.name}</span>
                        <button onClick={() => handleRemoveEmployee(emp.signupId)} style={{ background: '#fff', color: '#e53935', border: '1px solid #e53935', borderRadius: 6, padding: '4px 14px', fontWeight: 600, cursor: 'pointer', fontSize: 15 }}>Remove</button>
                      </div>
                    ))
                  )}
                </>
              )}
            </div>
            {/* Unscheduled Employees */}
            <div style={{ flex: 1, minWidth: 200, background: '#f8f8f8', borderRadius: 10, padding: 18 }}>
              <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 10 }}>Available to Schedule</div>
              {manageModalLoading ? <div>Loading...</div> : (
                <>
                  {manageModalData?.unscheduled.length === 0 ? (
                    <div style={{ color: '#888', fontSize: 15 }}>No available employees.</div>
                  ) : (
                    manageModalData?.unscheduled.map(emp => (
                      <div key={emp.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                        <span style={{ fontSize: 16 }}>{emp.name}</span>
                        <button
                          onClick={() => handleAddEmployee(emp.id)}
                          disabled={!!manageModalData && manageModalData.booked >= manageModalData.slots}
                          style={{ background: '#fff', color: '#43a047', border: '1px solid #43a047', borderRadius: 6, padding: '4px 14px', fontWeight: 600, cursor: (!!manageModalData && manageModalData.booked >= manageModalData.slots) ? 'not-allowed' : 'pointer', fontSize: 15, opacity: (!!manageModalData && manageModalData.booked >= manageModalData.slots) ? 0.5 : 1 }}
                        >
                          Add
                        </button>
                      </div>
                    ))
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main style={{ padding: '24px 32px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Schedule Shifts</h1>
        <p style={{ color: '#666', fontSize: 16 }}>Manage and schedule shifts for your organization</p>
      </div>

      {/* Category and Day Filters */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            key="all"
            onClick={() => setSelectedCardCategory("")}
            style={{
              background: selectedCardCategory === "" ? '#ff9800' : '#f5f5f5',
              color: selectedCardCategory === "" ? '#fff' : '#333',
              border: 'none',
              borderRadius: 6,
              padding: '8px 18px',
              cursor: 'pointer',
              fontWeight: 600,
              minWidth: 120
            }}
          >
            All Categories
                </button>
          {categoryOptions.map(opt => (
            <button
              key={opt.id}
              onClick={() => setSelectedCardCategory(String(opt.id))}
              style={{
                background: selectedCardCategory === String(opt.id) ? '#ff9800' : '#f5f5f5',
                color: selectedCardCategory === String(opt.id) ? '#fff' : '#333',
                border: 'none',
                borderRadius: 6,
                padding: '8px 18px',
                cursor: 'pointer',
                fontWeight: 600,
                minWidth: 120,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              {opt.icon && <span style={{ fontSize: 18 }}>{opt.icon}</span>}
              {opt.name}
            </button>
          ))}
              </div>
            </div>

    

      {/* Shift Name Tabs */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => setSelectedShiftName("")}
            style={{
              background: selectedShiftName === "" ? '#ff9800' : '#f5f5f5',
              color: selectedShiftName === "" ? '#fff' : '#333',
              border: 'none',
              borderRadius: 6,
              padding: '8px 18px',
              cursor: 'pointer',
              fontWeight: 600,
              minWidth: 100
            }}
          >
            All Shifts
          </button>
          {shiftNameOptions.map(name => (
            <button
              key={name}
              onClick={() => setSelectedShiftName(name)}
              style={{
                background: selectedShiftName === name ? '#ff9800' : '#f5f5f5',
                color: selectedShiftName === name ? '#fff' : '#333',
                border: 'none',
                borderRadius: 6,
                padding: '8px 18px',
                cursor: 'pointer',
                fontWeight: 600,
                minWidth: 100
              }}
            >
              {name}
            </button>
          ))}
        </div>
      </div>


        
      {/* Date Filter Section */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Left side - Date filter buttons */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <button
              onClick={() => setDateFilter('today')}
              style={{
                background: dateFilter === 'today' ? '#ff9800' : '#f5f5f5',
                color: dateFilter === 'today' ? '#fff' : '#333',
                border: 'none',
                borderRadius: 6,
                padding: '8px 16px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Today
            </button>
            <button
              onClick={() => setDateFilter('week')}
              style={{
                background: dateFilter === 'week' ? '#ff9800' : '#f5f5f5',
                color: dateFilter === 'week' ? '#fff' : '#333',
                border: 'none',
                borderRadius: 6,
                padding: '8px 16px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              This Week
            </button>
            <button
              onClick={() => setDateFilter('custom')}
              style={{
                background: dateFilter === 'custom' ? '#ff9800' : '#f5f5f5',
                color: dateFilter === 'custom' ? '#fff' : '#333',
                border: 'none',
                borderRadius: 6,
                padding: '8px 16px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Custom Date
            </button>
            {dateFilter === 'custom' && (
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                min={todayStr}
                style={{
                  padding: 8,
                  borderRadius: 6,
                  border: '1px solid #eee',
                  fontSize: 14
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Shifts Display */}
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.03)', padding: 32 }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#888' }}>Loading...</div>
        ) : error ? (
          <div style={{ textAlign: 'center', color: 'red' }}>{error}</div>
        ) : filteredRecurring.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#888' }}>No recurring shifts found for the selected filters.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filteredRecurring.map(rec => renderShiftCard(rec))}
          </div>
        )}
      </div>

      {renderEmployeePopup()}
      {renderManageModal()}
    </main>
  );
} 