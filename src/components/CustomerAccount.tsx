import React, { useState, useEffect } from 'react';
import { ShoppingBag, Calendar, Clock, RefreshCw, Scissors, ChevronRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBusiness } from '../context/BusinessContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Order, OrderStatus } from '../types/database';

interface CustomerAccountProps {
  onBackToHome: () => void;
}

export const CustomerAccount: React.FC<CustomerAccountProps> = ({ onBackToHome }) => {
  const { user, profile } = useAuth();
  const { settings } = useBusiness();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchMyOrders = async () => {
    if (!user || !isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*),
          status_history:order_status_history(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders((data as Order[]) || []);
    } catch (err) {
      console.error('Error fetching customer orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, [user]);

  const formatPrice = (amount: number) => {
    return `${settings.currency_symbol}${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
  };

  // Strict Red, Black, White badges
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <span className="text-white bg-neutral-900 border border-neutral-800 px-2.5 py-0.5 rounded-full text-[11px] font-bold">Pending Review</span>;
      case 'contacted':
        return <span className="text-white bg-neutral-800 border border-neutral-700 px-2.5 py-0.5 rounded-full text-[11px] font-bold">Salon Contacted You</span>;
      case 'confirmed':
        return <span className="text-red-500 bg-red-950/40 border border-red-800/60 px-2.5 py-0.5 rounded-full text-[11px] font-bold">Appointment Confirmed</span>;
      case 'completed':
        return <span className="text-neutral-300 bg-neutral-900 border border-neutral-800 px-2.5 py-0.5 rounded-full text-[11px] font-bold">Completed</span>;
      case 'cancelled':
      case 'rejected':
        return <span className="text-neutral-500 bg-black border border-neutral-900 px-2.5 py-0.5 rounded-full text-[11px] font-bold">Cancelled</span>;
      default:
        return <span className="text-neutral-400 px-2 py-0.5 text-xs">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-neutral-900 gap-3">
        <div>
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Salon</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            My Appointments & Orders
          </h1>
          <p className="mt-0.5 text-xs text-neutral-400">
            Account: <span className="text-white font-medium">{profile?.full_name || user?.email}</span>
          </p>
        </div>

        <button
          onClick={fetchMyOrders}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-[#0A0A0A] px-3.5 py-2 text-xs font-semibold text-neutral-300 hover:text-white transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20 text-center text-xs text-neutral-500">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-red-500 mb-2" />
          Loading your order records...
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-900 bg-[#0A0A0A] p-10 text-center">
          <ShoppingBag className="h-10 w-10 text-neutral-700 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white">No Orders Found</h3>
          <p className="mt-1 text-xs text-neutral-400 max-w-sm mx-auto">
            You haven't submitted any hair styling or grooming requests yet.
          </p>
          <button
            onClick={onBackToHome}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition-colors"
          >
            Browse Services
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const isExpanded = selectedOrder?.id === order.id;

            return (
              <div
                key={order.id}
                className="rounded-2xl border border-neutral-900 bg-[#0A0A0A] overflow-hidden transition-all"
              >
                {/* Header Row */}
                <div
                  onClick={() => setSelectedOrder(isExpanded ? null : order)}
                  className="p-4 sm:p-5 cursor-pointer hover:bg-neutral-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-red-500">
                        {order.order_reference}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="text-xs text-neutral-400">
                      Placed: {new Date(order.created_at).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-white tabular-nums">
                        {formatPrice(order.total_amount)}
                      </div>
                      <div className="text-[10px] text-neutral-500">Pay at salon</div>
                    </div>
                    <ChevronRight
                      className={`h-4 w-4 text-neutral-500 transition-transform ${
                        isExpanded ? 'rotate-90 text-white' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 pt-0 border-t border-neutral-900 bg-black/60 space-y-4 text-xs">
                    
                    {/* Schedule */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                      <div className="rounded-xl border border-neutral-900 bg-[#0F0F0F] p-3">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block">Requested Slot</span>
                        <span className="text-white mt-1 block">
                          {order.preferred_date ? new Date(order.preferred_date).toLocaleDateString() : 'Flexible date'} · {order.preferred_time || 'Flexible time'}
                        </span>
                      </div>

                      <div className="rounded-xl border border-red-900/40 bg-[#0F0F0F] p-3">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-red-500 block">Confirmed Time</span>
                        <span className="text-white font-bold mt-1 block">
                          {order.confirmed_date
                            ? `${new Date(order.confirmed_date).toLocaleDateString()} at ${order.confirmed_time || ''}`
                            : 'Pending WhatsApp agreement'}
                        </span>
                      </div>
                    </div>

                    {/* Services */}
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block mb-1.5">Services</span>
                      <div className="rounded-xl border border-neutral-900 divide-y divide-neutral-900 bg-[#0F0F0F]">
                        {order.order_items?.map((item) => (
                          <div key={item.id} className="p-3 flex items-center justify-between text-neutral-300">
                            <span>{item.quantity}× {item.service_name}</span>
                            <span className="font-bold text-white tabular-nums">{formatPrice(item.total_price)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Attached Hairstyle */}
                    {order.hairstyle_name && (
                      <div className="flex items-center gap-2 text-red-400">
                        <Scissors className="h-4 w-4" />
                        <span>Style Reference: <strong className="text-white">{order.hairstyle_name}</strong></span>
                      </div>
                    )}

                    {order.customer_notes && (
                      <div className="text-neutral-400">
                        <span className="text-white font-semibold">Notes:</span> {order.customer_notes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
