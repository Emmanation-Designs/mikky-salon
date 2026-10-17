import React, { useState, useEffect } from 'react';
import {
  Shield, ShoppingBag, Scissors, Settings, FolderKanban, Sparkles,
  Search, Filter, MessageSquare, ExternalLink, CheckCircle, Clock,
  AlertTriangle, RefreshCw, Plus, Edit, Archive, Check, ArrowLeft,
  Calendar, Phone, Mail, User, Image as ImageIcon, Trash2, X, ChevronDown
} from 'lucide-react';
import { supabase, isSupabaseConfigured, ADMIN_EMAIL } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useBusiness } from '../context/BusinessContext';
import { generateOrderWhatsAppLink, normalizeWhatsAppNumber } from '../lib/whatsapp';
import type { Order, OrderStatus, Service, ServiceCategory, Hairstyle } from '../types/database';

interface AdminDashboardProps {
  onBackToHome: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToHome }) => {
  const { user, profile, isAdmin } = useAuth();
  const { settings, updateSettings, refreshSettings } = useBusiness();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'orders' | 'services' | 'hairstyles' | 'categories' | 'settings'>('orders');

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState<boolean>(true);
  const [orderSearch, setOrderSearch] = useState<string>('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null);

  // Status Change Modal State
  const [statusModalOrder, setStatusModalOrder] = useState<Order | null>(null);
  const [targetStatus, setTargetStatus] = useState<OrderStatus>('contacted');
  const [statusNote, setStatusNote] = useState<string>('');
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);

  // Confirmed Schedule Modal State
  const [scheduleModalOrder, setScheduleModalOrder] = useState<Order | null>(null);
  const [confirmedDate, setConfirmedDate] = useState<string>('');
  const [confirmedTime, setConfirmedTime] = useState<string>('');
  const [savingSchedule, setSavingSchedule] = useState<boolean>(false);

  // Services State
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [hairstyles, setHairstyles] = useState<Hairstyle[]>([]);
  const [catalogLoading, setCatalogLoading] = useState<boolean>(false);

  // Service Edit / Add Modal
  const [editingService, setEditingService] = useState<Partial<Service> | null>(null);
  const [isNewService, setIsNewService] = useState<boolean>(false);
  const [serviceSaving, setServiceSaving] = useState<boolean>(false);

  // Hairstyle Edit / Add Modal
  const [editingHairstyle, setEditingHairstyle] = useState<Partial<Hairstyle> | null>(null);
  const [isNewHairstyle, setIsNewHairstyle] = useState<boolean>(false);
  const [hairstyleSaving, setHairstyleSaving] = useState<boolean>(false);

  // Category Edit / Add Modal
  const [editingCategory, setEditingCategory] = useState<Partial<ServiceCategory> | null>(null);
  const [isNewCategory, setIsNewCategory] = useState<boolean>(false);
  const [categorySaving, setCategorySaving] = useState<boolean>(false);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    salon_name: settings.salon_name,
    salon_phone: settings.salon_phone,
    admin_email: settings.admin_email,
    description: settings.description,
    address: settings.address,
    opening_hours: settings.opening_hours,
    currency_symbol: settings.currency_symbol,
  });
  const [settingsSaving, setSettingsSaving] = useState<boolean>(false);
  const [settingsSuccess, setSettingsSuccess] = useState<boolean>(false);

  // File Upload State
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);

  // Fetch Orders
  const fetchOrders = async () => {
    if (!isSupabaseConfigured) {
      setOrdersLoading(false);
      return;
    }
    setOrdersLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*),
          status_history:order_status_history(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders((data as Order[]) || []);
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Fetch Services & Categories
  const fetchCatalogData = async () => {
    if (!isSupabaseConfigured) return;
    setCatalogLoading(true);
    try {
      const [catsRes, srvsRes, hairsRes] = await Promise.all([
        supabase.from('service_categories').select('*').order('display_order', { ascending: true }),
        supabase.from('services').select('*, category:service_categories(*)').order('display_order', { ascending: true }),
        supabase.from('hairstyles').select('*, service:services(*)').order('display_order', { ascending: true }),
      ]);

      if (catsRes.data) setCategories(catsRes.data);
      if (srvsRes.data) setServices(srvsRes.data as Service[]);
      if (hairsRes.data) setHairstyles(hairsRes.data as Hairstyle[]);
    } catch (err) {
      console.error('Error fetching catalog data:', err);
    } finally {
      setCatalogLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchCatalogData();
  }, []);

  // Update Settings Form when settings context changes
  useEffect(() => {
    setSettingsForm({
      salon_name: settings.salon_name,
      salon_phone: settings.salon_phone,
      admin_email: settings.admin_email,
      description: settings.description,
      address: settings.address,
      opening_hours: settings.opening_hours,
      currency_symbol: settings.currency_symbol,
    });
  }, [settings]);

  // Statistics calculation (strictly from real orders dataset)
  const totalOrdersCount = orders.length;
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const contactedCount = orders.filter((o) => o.status === 'contacted').length;
  const confirmedCount = orders.filter((o) => o.status === 'confirmed').length;
  const completedCount = orders.filter((o) => o.status === 'completed').length;
  const cancelledCount = orders.filter((o) => o.status === 'cancelled' || o.status === 'rejected').length;

  // Filtered Orders
  const filteredOrders = orders.filter((order) => {
    // Status filter
    if (orderStatusFilter !== 'all') {
      if (orderStatusFilter === 'cancelled_rejected') {
        if (order.status !== 'cancelled' && order.status !== 'rejected') return false;
      } else if (order.status !== orderStatusFilter) {
        return false;
      }
    }

    // Search query
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      const matchRef = order.order_reference.toLowerCase().includes(q);
      const matchName = order.customer_name.toLowerCase().includes(q);
      const matchEmail = order.customer_email.toLowerCase().includes(q);
      const matchPhone = order.customer_phone.includes(q);
      return matchRef || matchName || matchEmail || matchPhone;
    }

    return true;
  });

  const formatPrice = (amount: number) => {
    return `${settings.currency_symbol}${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
  };

  // Order status transition handler
  const handleConfirmStatusChange = async () => {
    if (!statusModalOrder) return;
    setUpdatingStatus(true);

    try {
      // 1. Update order status
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: targetStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', statusModalOrder.id);

      if (updateError) throw updateError;

      // 2. Insert into status history
      await supabase.from('order_status_history').insert({
        order_id: statusModalOrder.id,
        previous_status: statusModalOrder.status,
        new_status: targetStatus,
        note: statusNote.trim() || `Status updated to ${targetStatus}`,
        changed_by: user?.id,
      });

      // Update local state
      setOrders((prev) =>
        prev.map((o) =>
          o.id === statusModalOrder.id ? { ...o, status: targetStatus } : o
        )
      );

      setStatusModalOrder(null);
      setStatusNote('');
    } catch (err: any) {
      alert(`Error updating order status: ${err.message}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Quick action: Mark as Contacted
  const handleMarkAsContacted = async (order: Order) => {
    if (order.status === 'contacted') return;
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'contacted',
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      if (error) throw error;

      await supabase.from('order_status_history').insert({
        order_id: order.id,
        previous_status: order.status,
        new_status: 'contacted',
        note: 'Administrator marked order as contacted on WhatsApp.',
        changed_by: user?.id,
      });

      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: 'contacted' } : o))
      );
    } catch (err: any) {
      alert(`Failed to mark as contacted: ${err.message}`);
    }
  };

  // Save Confirmed Date and Time
  const handleSaveConfirmedSchedule = async () => {
    if (!scheduleModalOrder) return;
    setSavingSchedule(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          confirmed_date: confirmedDate || null,
          confirmed_time: confirmedTime || null,
          status: 'confirmed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', scheduleModalOrder.id);

      if (error) throw error;

      await supabase.from('order_status_history').insert({
        order_id: scheduleModalOrder.id,
        previous_status: scheduleModalOrder.status,
        new_status: 'confirmed',
        note: `Appointment confirmed for ${confirmedDate} at ${confirmedTime}`,
        changed_by: user?.id,
      });

      setOrders((prev) =>
        prev.map((o) =>
          o.id === scheduleModalOrder.id
            ? {
                ...o,
                status: 'confirmed',
                confirmed_date: confirmedDate || null,
                confirmed_time: confirmedTime || null,
              }
            : o
        )
      );

      setScheduleModalOrder(null);
    } catch (err: any) {
      alert(`Failed to save confirmed schedule: ${err.message}`);
    } finally {
      setSavingSchedule(false);
    }
  };

  // Image upload to Supabase Storage
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'service' | 'hairstyle') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isSupabaseConfigured) {
      alert('Supabase must be configured to upload images.');
      return;
    }

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${target}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('salon-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('salon-media')
        .getPublicUrl(filePath);

      if (target === 'service' && editingService) {
        setEditingService({ ...editingService, image_url: publicUrl });
      } else if (target === 'hairstyle' && editingHairstyle) {
        setEditingHairstyle({ ...editingHairstyle, image_url: publicUrl });
      }
    } catch (err: any) {
      alert(`Image upload error: ${err.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  // Save Service
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService?.name || editingService.price === undefined) {
      alert('Service name and price are required.');
      return;
    }
    setServiceSaving(true);
    try {
      const payload = {
        name: editingService.name,
        category_id: editingService.category_id || null,
        description: editingService.description || null,
        price: Number(editingService.price),
        promo_price: editingService.promo_price ? Number(editingService.promo_price) : null,
        duration_minutes: Number(editingService.duration_minutes || 30),
        image_url: editingService.image_url || null,
        is_active: editingService.is_active ?? true,
        is_featured: editingService.is_featured ?? false,
        display_order: Number(editingService.display_order || 0),
        updated_at: new Date().toISOString(),
      };

      if (isNewService) {
        const { data, error } = await supabase.from('services').insert(payload).select().single();
        if (error) throw error;
        setServices((prev) => [...prev, data as Service]);
      } else {
        const { data, error } = await supabase.from('services').update(payload).eq('id', editingService.id).select().single();
        if (error) throw error;
        setServices((prev) => prev.map((s) => (s.id === data.id ? (data as Service) : s)));
      }

      setEditingService(null);
    } catch (err: any) {
      alert(`Failed to save service: ${err.message}`);
    } finally {
      setServiceSaving(false);
    }
  };

  // Toggle Service Active / Archive
  const handleToggleServiceActive = async (service: Service) => {
    const updatedStatus = !service.is_active;
    try {
      const { error } = await supabase
        .from('services')
        .update({ is_active: updatedStatus, updated_at: new Date().toISOString() })
        .eq('id', service.id);

      if (error) throw error;
      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? { ...s, is_active: updatedStatus } : s))
      );
    } catch (err: any) {
      alert(`Error toggling service status: ${err.message}`);
    }
  };

  // Save Hairstyle
  const handleSaveHairstyle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHairstyle?.name || !editingHairstyle?.image_url) {
      alert('Hairstyle name and image are required.');
      return;
    }
    setHairstyleSaving(true);
    try {
      const payload = {
        name: editingHairstyle.name,
        description: editingHairstyle.description || null,
        image_url: editingHairstyle.image_url,
        service_id: editingHairstyle.service_id || null,
        price_hint: editingHairstyle.price_hint ? Number(editingHairstyle.price_hint) : null,
        is_published: editingHairstyle.is_published ?? true,
        display_order: Number(editingHairstyle.display_order || 0),
      };

      if (isNewHairstyle) {
        const { data, error } = await supabase.from('hairstyles').insert(payload).select().single();
        if (error) throw error;
        setHairstyles((prev) => [...prev, data as Hairstyle]);
      } else {
        const { data, error } = await supabase.from('hairstyles').update(payload).eq('id', editingHairstyle.id).select().single();
        if (error) throw error;
        setHairstyles((prev) => prev.map((h) => (h.id === data.id ? (data as Hairstyle) : h)));
      }

      setEditingHairstyle(null);
    } catch (err: any) {
      alert(`Failed to save hairstyle: ${err.message}`);
    } finally {
      setHairstyleSaving(false);
    }
  };

  // Save Category
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name) {
      alert('Category name is required.');
      return;
    }
    setCategorySaving(true);
    try {
      const slug = editingCategory.slug || editingCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const payload = {
        name: editingCategory.name,
        slug,
        description: editingCategory.description || null,
        display_order: Number(editingCategory.display_order || 0),
        is_active: editingCategory.is_active ?? true,
      };

      if (isNewCategory) {
        const { data, error } = await supabase.from('service_categories').insert(payload).select().single();
        if (error) throw error;
        setCategories((prev) => [...prev, data as ServiceCategory]);
      } else {
        const { data, error } = await supabase.from('service_categories').update(payload).eq('id', editingCategory.id).select().single();
        if (error) throw error;
        setCategories((prev) => prev.map((c) => (c.id === data.id ? (data as ServiceCategory) : c)));
      }

      setEditingCategory(null);
    } catch (err: any) {
      alert(`Failed to save category: ${err.message}`);
    } finally {
      setCategorySaving(false);
    }
  };

  // Save Business Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaving(true);
    setSettingsSuccess(false);
    try {
      const { error } = await updateSettings(settingsForm);
      if (error) throw error;
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 4000);
    } catch (err: any) {
      alert(`Failed to save business settings: ${err.message}`);
    } finally {
      setSettingsSaving(false);
    }
  };

  // Security Access Guard check: only modestanwaije1@gmail.com
  const isAuthorizedAdmin = user?.email === ADMIN_EMAIL || isAdmin;

  if (!isAuthorizedAdmin) {
    return (
      <div className="min-h-[80vh] bg-black py-20 px-4 text-center">
        <div className="mx-auto max-w-md rounded-2xl border border-red-500/30 bg-neutral-950 p-8 shadow-2xl">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white">Administrator Access Required</h2>
          <p className="mt-2 text-xs text-neutral-400">
            This dashboard is restricted strictly to the Mikkys Barbing Salon administrator account:
            <br />
            <strong className="text-white font-mono mt-1 block">{ADMIN_EMAIL}</strong>
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={onBackToHome}
              className="rounded-lg bg-neutral-900 border border-neutral-800 px-4 py-2 text-xs text-neutral-200 hover:text-white"
            >
              Return to Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      
      {/* Top Admin Header Bar */}
      <div className="border-b border-neutral-900 bg-neutral-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <button
              onClick={onBackToHome}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white mb-2 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Customer View</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-xl font-bold uppercase tracking-wider text-white">
                  {settings.salon_name} — Admin Portal
                </h1>
                <span className="text-xs text-neutral-400">
                  Authorized Administrator: <strong className="text-amber-400">{ADMIN_EMAIL}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Refresh and Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                fetchOrders();
                fetchCatalogData();
                refreshSettings();
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Sync All Data</span>
            </button>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto border-t border-neutral-900 pt-1 pb-1">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'orders'
                ? 'bg-red-600 text-white'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Orders & WhatsApp ({pendingCount} pending)</span>
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'services'
                ? 'bg-red-600 text-white'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Scissors className="h-4 w-4" />
            <span>Services Menu ({services.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('hairstyles')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'hairstyles'
                ? 'bg-red-600 text-white'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>Hairstyle Gallery ({hairstyles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'categories'
                ? 'bg-red-600 text-white'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <FolderKanban className="h-4 w-4" />
            <span>Categories ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'settings'
                ? 'bg-red-600 text-white'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Business Settings</span>
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* ========================================================================= */}
        {/* TAB 1: DEDICATED ORDERS SECTION & METRICS */}
        {/* ========================================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-8">
            
            {/* Real Statistics Metric Strip (Strict Red, Black, White) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="rounded-xl border border-neutral-900 bg-neutral-950 p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">Total</span>
                <span className="text-2xl font-black text-white mt-1 block tabular-nums">{totalOrdersCount}</span>
              </div>
              <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-red-500 block">Pending</span>
                <span className="text-2xl font-black text-red-500 mt-1 block tabular-nums">{pendingCount}</span>
              </div>
              <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-white block">Contacted</span>
                <span className="text-2xl font-black text-white mt-1 block tabular-nums">{contactedCount}</span>
              </div>
              <div className="rounded-xl border border-red-900/40 bg-neutral-950 p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-red-400 block">Confirmed</span>
                <span className="text-2xl font-black text-white mt-1 block tabular-nums">{confirmedCount}</span>
              </div>
              <div className="rounded-xl border border-neutral-900 bg-neutral-950 p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">Completed</span>
                <span className="text-2xl font-black text-neutral-200 mt-1 block tabular-nums">{completedCount}</span>
              </div>
              <div className="rounded-xl border border-neutral-900 bg-neutral-950 p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">Cancelled</span>
                <span className="text-2xl font-black text-neutral-400 mt-1 block tabular-nums">{cancelledCount}</span>
              </div>
            </div>

            {/* Filter and Search Controls */}
            <div className="rounded-xl border border-neutral-900 bg-neutral-950 p-4 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
              
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search by reference, name, phone, or email..."
                  className="w-full rounded-lg border border-neutral-800 bg-black pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:border-red-500 focus:outline-none"
                />
              </div>

              {/* Status Segmented Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'pending', label: 'Pending' },
                  { key: 'contacted', label: 'Contacted' },
                  { key: 'confirmed', label: 'Confirmed' },
                  { key: 'completed', label: 'Completed' },
                  { key: 'cancelled_rejected', label: 'Cancelled' },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setOrderStatusFilter(f.key)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                      orderStatusFilter === f.key
                        ? 'bg-neutral-800 text-white border border-neutral-700'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders List / Table */}
            {ordersLoading ? (
              <div className="py-20 text-center text-xs text-neutral-500">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto text-red-500 mb-2" />
                Loading orders from Supabase...
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="rounded-xl border border-dashed border-neutral-900 bg-neutral-950 p-12 text-center">
                <ShoppingBag className="h-10 w-10 text-neutral-600 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-white">No Orders Found</h3>
                <p className="mt-1 text-xs text-neutral-400">
                  {orderSearch || orderStatusFilter !== 'all'
                    ? 'No orders match your filter criteria.'
                    : 'No customer orders have been submitted yet.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Desktop View Table */}
                <div className="hidden lg:block overflow-hidden rounded-xl border border-neutral-900 bg-neutral-950">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-neutral-900 bg-black/60 text-[11px] uppercase font-semibold text-neutral-400">
                      <tr>
                        <th className="p-4">Reference</th>
                        <th className="p-4">Customer Details</th>
                        <th className="p-4">Services / Hairstyle</th>
                        <th className="p-4">Schedule Requested</th>
                        <th className="p-4">Total Amount</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">WhatsApp Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-900">
                      {filteredOrders.map((order) => {
                        const waLinkResult = generateOrderWhatsAppLink(
                          order.customer_phone,
                          order.customer_name,
                          order.order_reference
                        );

                        return (
                          <tr key={order.id} className="hover:bg-neutral-900/30 transition-colors">
                            {/* Reference & Date */}
                            <td className="p-4 align-top">
                              <span className="font-mono font-bold text-red-400 block">{order.order_reference}</span>
                              <span className="text-[10px] text-neutral-500 block mt-1">
                                {new Date(order.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </td>

                            {/* Customer */}
                            <td className="p-4 align-top">
                              <div className="font-bold text-white">{order.customer_name}</div>
                              <div className="text-[11px] text-neutral-400 font-mono mt-0.5">+{order.customer_phone}</div>
                              <div className="text-[11px] text-neutral-500 mt-0.5 truncate max-w-[160px]">{order.customer_email}</div>
                            </td>

                            {/* Services & Hairstyle */}
                            <td className="p-4 align-top max-w-[200px]">
                              <div className="space-y-1">
                                {order.order_items?.map((item) => (
                                  <div key={item.id} className="text-neutral-300 truncate">
                                    <span className="font-semibold">{item.quantity}×</span> {item.service_name}
                                  </div>
                                ))}
                                {order.hairstyle_name && (
                                  <div className="text-[11px] text-red-400 flex items-center gap-1 mt-1">
                                    <Scissors className="h-3 w-3 shrink-0" />
                                    <span className="truncate">Style: {order.hairstyle_name}</span>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Schedule */}
                            <td className="p-4 align-top">
                              <div className="text-neutral-300">
                                {order.preferred_date ? new Date(order.preferred_date).toLocaleDateString() : 'No date'}
                              </div>
                              <div className="text-[11px] text-neutral-500">{order.preferred_time || 'Flexible time'}</div>
                              {order.confirmed_date && (
                                <div className="mt-1 text-[11px] text-white font-bold">
                                  Confirmed: {new Date(order.confirmed_date).toLocaleDateString()} {order.confirmed_time}
                                </div>
                              )}
                            </td>

                            {/* Total */}
                            <td className="p-4 align-top">
                              <span className="font-bold text-white tabular-nums text-sm">
                                {formatPrice(order.total_amount)}
                              </span>
                              <div className="text-[10px] text-neutral-500">At salon</div>
                            </td>

                            {/* Status */}
                            <td className="p-4 align-top">
                              <button
                                onClick={() => {
                                  setStatusModalOrder(order);
                                  setTargetStatus(order.status);
                                }}
                                className="inline-flex items-center gap-1 rounded border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-[11px] font-semibold text-neutral-200 hover:border-neutral-700"
                              >
                                <span>{order.status.toUpperCase()}</span>
                                <ChevronDown className="h-3 w-3 text-neutral-400" />
                              </button>
                            </td>

                            {/* Direct WhatsApp Action Button (Strict Red, Black, White) */}
                            <td className="p-4 align-top text-right space-y-1.5">
                              {waLinkResult.link ? (
                                <a
                                  href={waLinkResult.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center justify-end gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 shadow-sm shadow-red-950/40"
                                  title="Open direct customer WhatsApp chat with prefilled message"
                                >
                                  <MessageSquare className="h-3.5 w-3.5" />
                                  <span>Message on WhatsApp</span>
                                </a>
                              ) : (
                                <span className="inline-block text-[11px] text-red-400">
                                  {waLinkResult.error || 'Invalid phone'}
                                </span>
                              )}

                              <div className="flex items-center justify-end gap-2">
                                {order.status === 'pending' && (
                                  <button
                                    onClick={() => handleMarkAsContacted(order)}
                                    className="text-[11px] font-semibold text-white hover:text-neutral-300 underline"
                                  >
                                    Mark as Contacted
                                  </button>
                                )}

                                <button
                                  onClick={() => {
                                    setScheduleModalOrder(order);
                                    setConfirmedDate(order.confirmed_date || order.preferred_date || '');
                                    setConfirmedTime(order.confirmed_time || order.preferred_time || '');
                                  }}
                                  className="text-[11px] font-semibold text-red-400 hover:text-red-300 underline"
                                >
                                  Confirm Schedule
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View: High-Legibility Order Cards */}
                <div className="lg:hidden space-y-4">
                  {filteredOrders.map((order) => {
                    const waLinkResult = generateOrderWhatsAppLink(
                      order.customer_phone,
                      order.customer_name,
                      order.order_reference
                    );

                    return (
                      <div
                        key={order.id}
                        className="rounded-xl border border-neutral-900 bg-neutral-950 p-5 space-y-4"
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-mono text-xs font-bold text-red-400 block">{order.order_reference}</span>
                            <h4 className="text-base font-bold text-white mt-1">{order.customer_name}</h4>
                            <div className="text-xs text-neutral-400 font-mono mt-0.5">+{order.customer_phone}</div>
                          </div>
                          <button
                            onClick={() => {
                              setStatusModalOrder(order);
                              setTargetStatus(order.status);
                            }}
                            className="rounded border border-neutral-800 bg-neutral-900 px-2 py-1 text-[11px] font-semibold text-white"
                          >
                            {order.status.toUpperCase()}
                          </button>
                        </div>

                        {/* Order Items */}
                        <div className="rounded-lg border border-neutral-900 bg-black/40 p-3 space-y-1 text-xs">
                          {order.order_items?.map((item) => (
                            <div key={item.id} className="flex justify-between text-neutral-300">
                              <span>{item.quantity}× {item.service_name}</span>
                              <span className="font-semibold text-white tabular-nums">{formatPrice(item.total_price)}</span>
                            </div>
                          ))}
                          {order.hairstyle_name && (
                            <div className="text-red-400 text-[11px] pt-1">
                              Style: {order.hairstyle_name}
                            </div>
                          )}
                          <div className="pt-2 border-t border-neutral-900 flex justify-between font-bold text-white text-sm">
                            <span>Total (Pay at salon):</span>
                            <span className="text-red-500 font-extrabold">{formatPrice(order.total_amount)}</span>
                          </div>
                        </div>

                        {/* Schedule */}
                        <div className="text-xs text-neutral-400 space-y-1">
                          <div>Requested: {order.preferred_date ? new Date(order.preferred_date).toLocaleDateString() : 'No date'} · {order.preferred_time || 'Flexible'}</div>
                          {order.confirmed_date && (
                            <div className="text-white font-bold">Confirmed: {new Date(order.confirmed_date).toLocaleDateString()} at {order.confirmed_time}</div>
                          )}
                          {order.customer_notes && (
                            <div className="text-neutral-500 italic">Notes: "{order.customer_notes}"</div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2 border-t border-neutral-900 flex flex-col sm:flex-row gap-2">
                          {waLinkResult.link ? (
                            <a
                              href={waLinkResult.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-700 shadow-md shadow-red-950/40"
                            >
                              <MessageSquare className="h-4 w-4" />
                              <span>Message on WhatsApp</span>
                            </a>
                          ) : (
                            <div className="text-xs text-red-400 py-1">
                              {waLinkResult.error || 'Invalid phone number'}
                            </div>
                          )}

                          <button
                            onClick={() => {
                              setScheduleModalOrder(order);
                              setConfirmedDate(order.confirmed_date || order.preferred_date || '');
                              setConfirmedTime(order.confirmed_time || order.preferred_time || '');
                            }}
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-neutral-200 hover:text-white"
                          >
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Schedule</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: SERVICE MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">Service Catalogue Management</h3>
                <p className="text-xs text-neutral-400">Add, edit, change prices, and toggle active status for salon services.</p>
              </div>

              <button
                onClick={() => {
                  setIsNewService(true);
                  setEditingService({
                    name: '',
                    price: 3000,
                    duration_minutes: 30,
                    category_id: categories[0]?.id || null,
                    is_active: true,
                    is_featured: false,
                    display_order: services.length + 1,
                  });
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
              >
                <Plus className="h-4 w-4" />
                <span>Add New Service</span>
              </button>
            </div>

            {/* Services Table */}
            <div className="overflow-hidden rounded-xl border border-neutral-900 bg-neutral-950">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-neutral-900 bg-black/60 text-[11px] uppercase font-semibold text-neutral-400">
                  <tr>
                    <th className="p-4">Service</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Duration</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900">
                  {services.map((service) => (
                    <tr key={service.id} className="hover:bg-neutral-900/30">
                      <td className="p-4">
                        <div className="font-bold text-white">{service.name}</div>
                        {service.description && (
                          <div className="text-[11px] text-neutral-500 line-clamp-1 max-w-xs">{service.description}</div>
                        )}
                      </td>
                      <td className="p-4 text-neutral-400">
                        {service.category?.name || 'Uncategorized'}
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-white tabular-nums">{formatPrice(service.price)}</span>
                        {service.promo_price && service.promo_price > 0 && (
                          <span className="text-[10px] text-red-400 block">Promo: {formatPrice(service.promo_price)}</span>
                        )}
                      </td>
                      <td className="p-4 text-neutral-400">
                        {service.duration_minutes} mins
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          service.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-neutral-800 text-neutral-500'
                        }`}>
                          {service.is_active ? 'Active' : 'Archived / Inactive'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setIsNewService(false);
                            setEditingService(service);
                          }}
                          className="inline-flex items-center gap-1 rounded bg-neutral-900 border border-neutral-800 px-2.5 py-1 text-xs text-neutral-300 hover:text-white"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleToggleServiceActive(service)}
                          className={`inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs font-semibold ${
                            service.is_active
                              ? 'text-amber-400 hover:bg-amber-950/20'
                              : 'text-emerald-400 hover:bg-emerald-950/20'
                          }`}
                        >
                          {service.is_active ? 'Archive' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: HAIRSTYLE GALLERY MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'hairstyles' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">Hairstyle Gallery & Lookbook</h3>
                <p className="text-xs text-neutral-400">Showcase cuts, fades, and styles for customers to reference.</p>
              </div>

              <button
                onClick={() => {
                  setIsNewHairstyle(true);
                  setEditingHairstyle({
                    name: '',
                    description: '',
                    image_url: '/src/assets/images/haircut_fade_classic_1792138006925.jpg',
                    service_id: services[0]?.id || null,
                    is_published: true,
                    display_order: hairstyles.length + 1,
                  });
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
              >
                <Plus className="h-4 w-4" />
                <span>Add Hairstyle</span>
              </button>
            </div>

            {/* Hairstyles Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {hairstyles.map((style) => (
                <div key={style.id} className="rounded-xl border border-neutral-900 bg-neutral-950 overflow-hidden">
                  <div className="relative aspect-4/3 w-full bg-neutral-900">
                    <img
                      src={style.image_url}
                      alt={style.name}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 right-2 rounded bg-black/80 px-2 py-0.5 text-[10px] text-white">
                      {style.is_published ? 'Published' : 'Draft'}
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <h4 className="font-bold text-white text-sm">{style.name}</h4>
                    {style.description && (
                      <p className="text-xs text-neutral-400 line-clamp-2">{style.description}</p>
                    )}
                    <div className="pt-2 border-t border-neutral-900 flex items-center justify-between">
                      <span className="text-xs text-amber-400">
                        {style.service?.name ? `Linked: ${style.service.name}` : 'General Style'}
                      </span>
                      <button
                        onClick={() => {
                          setIsNewHairstyle(false);
                          setEditingHairstyle(style);
                        }}
                        className="inline-flex items-center gap-1 rounded bg-neutral-900 border border-neutral-800 px-2.5 py-1 text-xs text-neutral-300 hover:text-white"
                      >
                        <Edit className="h-3 w-3" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: CATEGORY MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">Service Categories</h3>
                <p className="text-xs text-neutral-400">Manage categories such as Haircuts, Beard grooming, combos, etc.</p>
              </div>

              <button
                onClick={() => {
                  setIsNewCategory(true);
                  setEditingCategory({
                    name: '',
                    slug: '',
                    description: '',
                    display_order: categories.length + 1,
                    is_active: true,
                  });
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
              >
                <Plus className="h-4 w-4" />
                <span>Add Category</span>
              </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-neutral-900 bg-neutral-950">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-neutral-900 bg-black/60 text-[11px] uppercase font-semibold text-neutral-400">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Slug</th>
                    <th className="p-4">Order</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-neutral-900/30">
                      <td className="p-4 font-bold text-white">{cat.name}</td>
                      <td className="p-4 text-neutral-400 font-mono">{cat.slug}</td>
                      <td className="p-4 text-neutral-400">{cat.display_order}</td>
                      <td className="p-4">
                        <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] font-semibold">
                          Active
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => {
                            setIsNewCategory(false);
                            setEditingCategory(cat);
                          }}
                          className="inline-flex items-center gap-1 rounded bg-neutral-900 border border-neutral-800 px-2.5 py-1 text-xs text-neutral-300 hover:text-white"
                        >
                          <Edit className="h-3 w-3" />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: BUSINESS SETTINGS */}
        {/* ========================================================================= */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto rounded-xl border border-neutral-900 bg-neutral-950 p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">Salon Business Information</h3>
              <p className="text-xs text-neutral-400">
                These settings configure the public phone numbers, hours, address, and name on the website.
              </p>
            </div>

            {settingsSuccess && (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-3 text-xs text-emerald-400">
                Business settings successfully updated in Supabase!
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Salon Display Name</label>
                <input
                  type="text"
                  required
                  value={settingsForm.salon_name}
                  onChange={(e) => setSettingsForm({ ...settingsForm, salon_name: e.target.value })}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-xs text-white focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Salon WhatsApp Phone Number (Configured Line)
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.salon_phone}
                  onChange={(e) => setSettingsForm({ ...settingsForm, salon_phone: e.target.value })}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-xs text-white focus:border-red-500 focus:outline-none font-mono"
                />
                <span className="text-[11px] text-neutral-500 mt-1 block">Default: +2349038418469</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Administrator Email (Owner)
                </label>
                <input
                  type="email"
                  disabled
                  value={settingsForm.admin_email}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-900/50 px-3.5 py-2.5 text-xs text-neutral-400 cursor-not-allowed font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Physical Salon Address (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Enter physical address when available..."
                  value={settingsForm.address}
                  onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-xs text-white focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Opening Hours
                </label>
                <input
                  type="text"
                  value={settingsForm.opening_hours}
                  onChange={(e) => setSettingsForm({ ...settingsForm, opening_hours: e.target.value })}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-xs text-white focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Currency Symbol
                </label>
                <input
                  type="text"
                  value={settingsForm.currency_symbol}
                  onChange={(e) => setSettingsForm({ ...settingsForm, currency_symbol: e.target.value })}
                  className="w-24 rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-xs text-white focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Short Business Description
                </label>
                <textarea
                  rows={3}
                  value={settingsForm.description}
                  onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-xs text-white focus:border-red-500 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-4 border-t border-neutral-900 flex justify-end">
                <button
                  type="submit"
                  disabled={settingsSaving}
                  className="rounded-lg bg-red-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {settingsSaving ? 'Saving Changes...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* STATUS CHANGE MODAL */}
      {/* ========================================================================= */}
      {statusModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl border border-neutral-900 bg-neutral-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-white">Update Order Status</h4>
              <button onClick={() => setStatusModalOrder(null)} className="text-neutral-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-400">
              Change status for order <strong className="font-mono text-red-400">{statusModalOrder.order_reference}</strong> ({statusModalOrder.customer_name}):
            </p>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Select New Status</label>
              <select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value as OrderStatus)}
                className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-xs text-white focus:border-red-500 focus:outline-none"
              >
                <option value="pending">pending (Awaiting review)</option>
                <option value="contacted">contacted (Admin reached out on WhatsApp)</option>
                <option value="confirmed">confirmed (Appointment agreed)</option>
                <option value="completed">completed (Service done & paid)</option>
                <option value="cancelled">cancelled (Customer cancelled)</option>
                <option value="rejected">rejected (Salon cannot fulfill)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Optional Note for History</label>
              <input
                type="text"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="e.g. Discussed time on WhatsApp, agreed on 2 PM"
                className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:border-red-500 focus:outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setStatusModalOrder(null)}
                className="px-3 py-2 text-xs text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStatusChange}
                disabled={updatingStatus}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {updatingStatus ? 'Updating...' : 'Confirm Status Change'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONFIRMED SCHEDULE MODAL */}
      {/* ========================================================================= */}
      {scheduleModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl border border-neutral-900 bg-neutral-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-white">Record Confirmed Schedule</h4>
              <button onClick={() => setScheduleModalOrder(null)} className="text-neutral-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-400">
              Record the appointment date & time agreed with <strong className="text-white">{scheduleModalOrder.customer_name}</strong> on WhatsApp.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Confirmed Date</label>
                <input
                  type="date"
                  value={confirmedDate}
                  onChange={(e) => setConfirmedDate(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Confirmed Time</label>
                <input
                  type="text"
                  placeholder="e.g. 2:30 PM"
                  value={confirmedTime}
                  onChange={(e) => setConfirmedTime(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setScheduleModalOrder(null)}
                className="px-3 py-2 text-xs text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfirmedSchedule}
                disabled={savingSchedule}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {savingSchedule ? 'Saving...' : 'Save & Mark Confirmed'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SERVICE EDIT/ADD MODAL */}
      {/* ========================================================================= */}
      {editingService && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-xl border border-neutral-900 bg-neutral-950 p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-white">
                {isNewService ? 'Add New Barbering Service' : 'Edit Service'}
              </h4>
              <button onClick={() => setEditingService(null)} className="text-neutral-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Service Name *</label>
                <input
                  type="text"
                  required
                  value={editingService.name || ''}
                  onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                  placeholder="e.g. Luxury Beard Sculpt & Wash"
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Price ({settings.currency_symbol}) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="100"
                    value={editingService.price ?? ''}
                    onChange={(e) => setEditingService({ ...editingService, price: Number(e.target.value) })}
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Promo Price (Optional)</label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={editingService.promo_price ?? ''}
                    onChange={(e) => setEditingService({ ...editingService, promo_price: e.target.value ? Number(e.target.value) : null })}
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={editingService.duration_minutes ?? 30}
                    onChange={(e) => setEditingService({ ...editingService, duration_minutes: Number(e.target.value) })}
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Category</label>
                  <select
                    value={editingService.category_id || ''}
                    onChange={(e) => setEditingService({ ...editingService, category_id: e.target.value || null })}
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                  >
                    <option value="">Uncategorized</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingService.description || ''}
                  onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                  placeholder="Detail the haircut, fade technique, or treatment..."
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-xs text-white focus:border-red-500 focus:outline-none resize-none"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Service Photo / Asset</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'service')}
                    disabled={uploadingImage}
                    className="text-xs text-neutral-400 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-neutral-800 file:text-neutral-200 hover:file:bg-neutral-700"
                  />
                  {uploadingImage && <span className="text-xs text-amber-400">Uploading...</span>}
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingService.is_active ?? true}
                    onChange={(e) => setEditingService({ ...editingService, is_active: e.target.checked })}
                    className="rounded bg-neutral-900 border-neutral-800 text-red-600 focus:ring-0"
                  />
                  <span>Active & Visible to Customers</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingService.is_featured ?? false}
                    onChange={(e) => setEditingService({ ...editingService, is_featured: e.target.checked })}
                    className="rounded bg-neutral-900 border-neutral-800 text-red-600 focus:ring-0"
                  />
                  <span>Featured Service</span>
                </label>
              </div>

              <div className="pt-3 border-t border-neutral-900 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="px-3 py-2 text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={serviceSaving}
                  className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {serviceSaving ? 'Saving...' : 'Save Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HAIRSTYLE EDIT/ADD MODAL */}
      {/* ========================================================================= */}
      {editingHairstyle && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-xl border border-neutral-900 bg-neutral-950 p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-white">
                {isNewHairstyle ? 'Add Hairstyle to Lookbook' : 'Edit Hairstyle'}
              </h4>
              <button onClick={() => setEditingHairstyle(null)} className="text-neutral-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHairstyle} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Hairstyle Name *</label>
                <input
                  type="text"
                  required
                  value={editingHairstyle.name || ''}
                  onChange={(e) => setEditingHairstyle({ ...editingHairstyle, name: e.target.value })}
                  placeholder="e.g. High Drop Fade with Sponge Twist"
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Image URL / Upload *</label>
                <input
                  type="text"
                  required
                  value={editingHairstyle.image_url || ''}
                  onChange={(e) => setEditingHairstyle({ ...editingHairstyle, image_url: e.target.value })}
                  placeholder="/src/assets/images/... or public Supabase URL"
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-xs text-white focus:border-red-500 focus:outline-none mb-2"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'hairstyle')}
                  disabled={uploadingImage}
                  className="text-xs text-neutral-400 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-neutral-800 file:text-neutral-200"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Associated Service (Optional)</label>
                <select
                  value={editingHairstyle.service_id || ''}
                  onChange={(e) => setEditingHairstyle({ ...editingHairstyle, service_id: e.target.value || null })}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                >
                  <option value="">No specific service</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({formatPrice(s.price)})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingHairstyle.description || ''}
                  onChange={(e) => setEditingHairstyle({ ...editingHairstyle, description: e.target.value })}
                  placeholder="Details on fade gradient, hair length, product styling..."
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-xs text-white focus:border-red-500 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-3 border-t border-neutral-900 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingHairstyle(null)}
                  className="px-3 py-2 text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={hairstyleSaving}
                  className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {hairstyleSaving ? 'Saving...' : 'Save Hairstyle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CATEGORY EDIT/ADD MODAL */}
      {/* ========================================================================= */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl border border-neutral-900 bg-neutral-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-white">
                {isNewCategory ? 'Create Service Category' : 'Edit Category'}
              </h4>
              <button onClick={() => setEditingCategory(null)} className="text-neutral-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={editingCategory.name || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  placeholder="e.g. VIP Treatments"
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Display Order</label>
                <input
                  type="number"
                  value={editingCategory.display_order ?? 1}
                  onChange={(e) => setEditingCategory({ ...editingCategory, display_order: Number(e.target.value) })}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-neutral-900 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-3 py-2 text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={categorySaving}
                  className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {categorySaving ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
