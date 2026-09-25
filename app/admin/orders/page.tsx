'use client';

import { getOptimizedCloudinaryImage } from "@/lib/cloudinaryImage";
import AdminLayout from '@/app/components/AdminLayout';
import { useState, useEffect } from 'react';
import type { IOrder } from '@/models/Order';
type AdminOrder = Omit<IOrder, keyof import('mongoose').Document | 'createdAt' | 'updatedAt'> & { _id: string; createdAt: string; updatedAt: string };
const statuses = ['pending_payment', 'order_received', 'payment_confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'];
import { 
  Search, 
  Filter, 
  Eye, 
  Truck, 
  Clock, 
  Package, 
  CheckCircle, 
  XCircle,
  Calendar,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Box,
  UserCheck,
  Archive,
  ArchiveRestore
} from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [archiveView, setArchiveView] = useState<'active' | 'archived' | 'all'>('active');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [tracking, setTracking] = useState({ courierName: '', trackingNumber: '', trackingUrl: '' });
  const openOrder = (order: AdminOrder) => {
    setUpdateMessage('');
    setSelectedOrder(order);
    setTracking({ courierName: order.shipping?.courierName || '', trackingNumber: order.shipping?.trackingNumber || '', trackingUrl: order.shipping?.trackingUrl || '' });
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchOrders();
  }, [search, paymentStatus, orderStatus, archiveView]);

  const fetchOrders = async () => {
    setLoading(true);
    const query = new URLSearchParams();
    if (search) query.set('search', search);
    if (paymentStatus) query.set('paymentStatus', paymentStatus);
    if (orderStatus) query.set('orderStatus', orderStatus);
    query.set('archive', archiveView);
    
    try {
      const res = await fetch(`/api/admin/orders?${query.toString()}`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateArchiveStatus = async (order: AdminOrder) => {
    const willArchive = !order.archived;
    const confirmed = window.confirm(
      willArchive
        ? `Archive order ${order.orderId}? It will move to Archived Orders and can be restored later.`
        : `Restore order ${order.orderId} to Active Orders?`
    );
    if (!confirmed) return;

    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${order._id}/archive`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: willArchive }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to update archive status.');
        return;
      }

      setSelectedOrder(data);
      if (archiveView !== 'all') setIsModalOpen(false);
      await fetchOrders();
    } catch (error) {
      alert('Failed to update archive status.');
    } finally {
      setUpdating(false);
    }
  };

  const updateOrder = async (id: string, changes: { orderStatus?: string; courierName?: string; trackingNumber?: string; trackingUrl?: string }) => {
    setUpdating(true);
    setUpdateMessage('');
    try {
      const res = await fetch(`/api/admin/orders/${id}/status`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(changes),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update order');
      setOrders(previous => previous.map(order => order._id === id ? data : order)
        .filter(order => !orderStatus || order.orderStatus === orderStatus));
      setSelectedOrder(previous => previous?._id === id ? data : previous);
      setUpdateMessage('Order saved.');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update order');
    } finally { setUpdating(false); }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'order_received': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'payment_confirmed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'processing': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'packed': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'shipped': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'out_for_delivery': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'refunded': return 'bg-slate-50 text-slate-600 border-slate-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-10">
        {updateMessage && !isModalOpen && <p role="status" className="text-sm font-bold text-emerald-700">{updateMessage}</p>}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Order Logistics</h1>
            <p className="text-slate-500 font-medium italic mt-1">Monitor fulfillment, tracking, and payment verification.</p>
          </div>
          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse ml-2"></span>
            <span className="text-xs font-black text-slate-900 uppercase tracking-widest mr-2">Sync Active</span>
          </div>
        </header>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatBox title="Active Orders" value={orders.filter(o => !['delivered', 'cancelled', 'refunded'].includes(o.orderStatus)).length} sub="Pending fulfillment" />
          <StatBox title="Verified Revenue" value={`${orders.filter(o => o.payment.paymentStatus === 'paid').reduce((acc, o) => acc + o.amounts.totalAmount, 0).toFixed(2)} USD`} sub="Completed payments" />
          <StatBox title="Processing" value={orders.filter(o => o.orderStatus === 'processing').length} sub="In packaging phase" />
          <StatBox title="Global Orders" value={orders.length} sub="Total lifetime orders" />
        </div>

        {/* Filters & Table */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row gap-4 bg-slate-50/30">
            <div className="relative flex-[2]">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by Order ID, Name, Email, Phone..."
                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all outline-none font-bold"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="flex-1 px-6 py-4 rounded-2xl bg-white border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all outline-none font-black text-slate-700"
              value={orderStatus}
              onChange={(e) => setOrderStatus(e.target.value)}
            >
              <option value="">Order Status</option>
              <option value="order_received">Received</option>
              <option value="payment_confirmed">Paid</option>
              <option value="processing">Processing</option>
              <option value="packed">Packed</option>
              <option value="shipped">Shipped</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              className="flex-1 px-6 py-4 rounded-2xl bg-white border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all outline-none font-black text-slate-700"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
            >
              <option value="">Payment Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div className="px-8 py-4 border-b border-slate-100 flex flex-wrap gap-2 bg-white">
            {(['active', 'archived', 'all'] as const).map((view) => (
              <button
                key={view}
                type="button"
                onClick={() => setArchiveView(view)}
                className={`rounded-xl px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                  archiveView === view
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {view === 'active' ? 'Active Orders' : view === 'archived' ? 'Archived Orders' : 'All Orders'}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100 bg-white">
                  <th className="px-8 py-6">Order ID & Tracking ID</th>
                  <th className="px-8 py-6">Customer</th>
                  <th className="px-8 py-6">Items</th>
                  <th className="px-8 py-6">Amount</th>
                  <th className="px-8 py-6">Status</th>
                  <th className="px-8 py-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                   Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-8 py-6 h-20 bg-slate-50/50"></td>
                    </tr>
                  ))
                ) : orders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-8 py-6">
                      <div className="font-black text-slate-900 tracking-tight">{order.orderId}</div>
                      <div className="text-[10px] font-black text-orange-600 uppercase tracking-widest mt-0.5">
                        {order.trackingId}
                      </div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                      {order.archived && (
                        <div className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mt-1">
                          Archived {order.archivedAt ? new Date(order.archivedAt).toLocaleDateString() : ''}
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-bold text-slate-900">{order.customerInfo.name}</div>
                      <div className="text-xs text-slate-400 font-medium">{order.customerInfo.email}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex -space-x-2">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="w-10 h-10 rounded-xl border-2 border-white bg-slate-100 overflow-hidden shadow-sm">
                            <img src={getOptimizedCloudinaryImage(item.image, 420)} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="w-10 h-10 rounded-xl border-2 border-white bg-slate-900 flex items-center justify-center text-[10px] font-black text-white">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-black text-slate-900">{order.amounts.currency} {order.amounts.totalAmount.toFixed(2)}</div>
                      <div className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border w-fit mt-1 ${order.payment.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                        {order.payment.paymentStatus}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <select aria-label={`Status for order ${order.orderId}`} value={order.orderStatus}
                        disabled={updating || order.archived}
                        onChange={event => void updateOrder(order._id, { orderStatus: event.target.value })}
                        className={`max-w-48 rounded-xl border px-3 py-2 text-xs font-bold disabled:opacity-50 ${getStatusColor(order.orderStatus)}`}>
                        {statuses.map(status => <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>)}
                      </select>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button
                        type="button"
                        disabled={updating}
                        onClick={() => updateArchiveStatus(order)}
                        title={order.archived ? 'Restore order' : 'Archive order'}
                        className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all disabled:opacity-50"
                      >
                        {order.archived ? <ArchiveRestore size={20} /> : <Archive size={20} />}
                      </button>
                      <button 
                        onClick={() => openOrder(order)}
                        className="p-3 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-2xl transition-all"
                      >
                        <Eye size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">Deployment Detail</p>
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Order #{selectedOrder.orderId}</h2>
                <div className="flex items-center gap-2 mt-1">
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tracking ID:</span>
                   <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{selectedOrder.trackingId}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => updateArchiveStatus(selectedOrder)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-indigo-600 disabled:opacity-50"
                >
                  {selectedOrder.archived ? <ArchiveRestore size={17} /> : <Archive size={17} />}
                  {selectedOrder.archived ? 'Restore' : 'Archive'}
                </button>
                <button onClick={() => setIsModalOpen(false)} className="p-4 hover:bg-white rounded-2xl text-slate-400 transition-all">
                  <XCircle size={28} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Customer & Items */}
              <div className="space-y-8">
                <section>
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <div className="w-1 h-4 bg-slate-400 rounded-full"></div>
                    Customer Profile
                  </h3>
                  <div className="bg-slate-50 p-6 rounded-3xl space-y-4">
                    <div className="flex items-center gap-4 text-slate-600 font-bold">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400">
                        <Phone size={18} />
                      </div>
                      {selectedOrder.customerInfo.phone}
                    </div>
                    <div className="flex items-center gap-4 text-slate-600 font-bold">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400">
                        <Mail size={18} />
                      </div>
                      {selectedOrder.customerInfo.email}
                    </div>
                    <div className="flex items-start gap-4 text-slate-600 font-bold">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                        <MapPin size={18} />
                      </div>
                      <div className="text-xs">
                        <p>{selectedOrder.shippingAddress.address}</p>
                        {selectedOrder.shippingAddress.apartment && <p>{selectedOrder.shippingAddress.apartment}</p>}
                        <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zip}</p>
                        <p>{selectedOrder.shippingAddress.country}</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <div className="w-1 h-4 bg-slate-400 rounded-full"></div>
                    Payload Contents ({selectedOrder.items.length})
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl">
                        <div className="w-16 h-16 rounded-xl bg-slate-50 overflow-hidden shrink-0">
                          <img src={getOptimizedCloudinaryImage(item.image, 420)} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <p className="font-black text-slate-900 leading-tight">{item.title}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{item.color} / {item.size}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-slate-900">{selectedOrder.amounts.currency} {item.unitPrice.toFixed(2)}</p>
                          <p className="text-xs font-bold text-orange-600">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Right Column: Status Control & Timeline */}
              <div className="space-y-8">
                <section>
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <div className="w-1 h-4 bg-slate-400 rounded-full"></div>
                    Deployment Control
                  </h3>
                  <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white">
                    {selectedOrder.archived && (
                      <div className="mb-5 rounded-2xl border border-indigo-400/30 bg-indigo-400/10 p-4 text-xs font-bold text-indigo-100">
                        This order is archived and read-only. Restore it before changing fulfillment details.
                      </div>
                    )}
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-4">Master Status Override</p>
                    <select aria-label="Order status" value={selectedOrder.orderStatus}
                      disabled={updating || selectedOrder.archived}
                      onChange={event => void updateOrder(selectedOrder._id, { orderStatus: event.target.value })}
                      className="w-full rounded-xl border border-white/20 bg-slate-800 px-4 py-3 font-bold text-white disabled:opacity-50">
                      {statuses.map(status => <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>)}
                    </select>

                    {updateMessage && <p role="status" className="mt-4 text-sm text-emerald-300">{updateMessage}</p>}
                    <form className="mt-8 space-y-4" onSubmit={event => { event.preventDefault(); void updateOrder(selectedOrder._id, tracking); }}>
                      <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Courier Manifest</p>
                      {(['courierName', 'trackingNumber', 'trackingUrl'] as const).map(field => <label key={field} className="block text-xs font-bold text-white/80">
                        {field === 'courierName' ? 'Carrier' : field === 'trackingNumber' ? 'Tracking number' : 'Tracking URL'}
                        <input type={field === 'trackingUrl' ? 'url' : 'text'} maxLength={field === 'trackingUrl' ? 2000 : field === 'courierName' ? 120 : 200}
                          value={tracking[field]} disabled={updating || selectedOrder.archived}
                          onChange={event => setTracking(previous => ({ ...previous, [field]: event.target.value }))}
                          className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-orange-500" />
                      </label>)}
                      <button type="submit" disabled={updating || selectedOrder.archived} className="rounded-xl bg-orange-600 px-5 py-3 text-sm font-bold disabled:opacity-50">{updating ? 'Saving…' : 'Save tracking'}</button>
                    </form>
                  </div>
                </section>

                <section className="flex-1">
                   <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <div className="w-1 h-4 bg-slate-400 rounded-full"></div>
                    Logistics History
                  </h3>
                  <div className="bg-slate-50 rounded-3xl p-6 space-y-6 max-h-[300px] overflow-y-auto">
                    {selectedOrder.trackingTimeline.slice().reverse().map((step, idx) => (
                      <div key={idx} className="flex gap-4 relative">
                        {idx !== selectedOrder.trackingTimeline.length - 1 && (
                          <div className="absolute left-2.5 top-8 bottom-0 w-0.5 bg-slate-200"></div>
                        )}
                        <div className={`w-5 h-5 rounded-full mt-1 shrink-0 ${idx === 0 ? 'bg-orange-600 animate-pulse' : 'bg-slate-300'}`}></div>
                        <div>
                          <p className={`font-black text-[10px] uppercase tracking-widest ${idx === 0 ? 'text-slate-900' : 'text-slate-400'}`}>
                            {step.status.replace(/_/g, ' ')}
                          </p>
                          <p className="text-sm font-bold text-slate-600 leading-tight mt-1">{step.message}</p>
                          <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">{new Date(step.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function StatBox({ title, value, sub }: any) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm group hover:shadow-xl transition-all">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{title}</p>
      <div className="text-3xl font-black text-slate-900 tracking-tighter mb-1">{value}</div>
      <p className="text-xs font-bold text-slate-400 italic">{sub}</p>
    </div>
  );
}
