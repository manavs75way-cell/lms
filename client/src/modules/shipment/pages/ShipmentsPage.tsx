import { useState } from 'react';
import { useGetShipmentsQuery, useUpdateShipmentStatusMutation, useRebalanceCollectionsMutation, Shipment } from '../../../services/shipmentApi';
import { useToast } from '../../../context/ToastContext';
import { format } from 'date-fns';
import { TruckIcon, ArrowPathIcon, BoltIcon } from '@heroicons/react/24/outline';

const ShipmentsPage = () => {
    const { data: shipments, isLoading, error } = useGetShipmentsQuery();
    const [updateStatus] = useUpdateShipmentStatusMutation();
    const [triggerRebalance, { isLoading: isRebalancing }] = useRebalanceCollectionsMutation();
    const { success, error: showError } = useToast();
    const [statusFilter, setStatusFilter] = useState<'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'ALL'>('ALL');

    const handleRebalance = async () => {
        try {
            const result = await triggerRebalance().unwrap();
            const count = Array.isArray(result.data)
                ? result.data.reduce((acc: number, r: { shipmentsCreated: number }) => acc + r.shipmentsCreated, 0)
                : 0;
            success(count > 0
                ? `Rebalancing triggered: ${count} shipment(s) created across ${result.data.length} edition(s).`
                : 'Collections are balanced — no shipments needed.');
        } catch {
            showError('Rebalancing failed.');
        }
    };

    if (isLoading) return <div className="p-10 text-center text-indigo-600 animate-pulse">Loading shipments...</div>;
    if (error) return <div className="p-10 text-center text-red-500">Failed to load shipments.</div>;

    const filteredShipments = shipments?.filter(s => statusFilter === 'ALL' || s.status === statusFilter) || [];

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            await updateStatus({ id, status: newStatus as Pick<Shipment, 'status'>['status'] }).unwrap();
            success('Shipment status updated.');
        } catch (err) {
            showError('Failed to update shipment.');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <header className="mb-8 flex justify-between items-end flex-wrap gap-4 border-b pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <TruckIcon className="w-8 h-8 text-indigo-600" />
                        Shipment Tracking
                    </h1>
                    <p className="text-gray-600 mt-2">Manage logistical circulation and rebalancing transit.</p>
                </div>
                <div className="flex gap-3 items-center">
                    <button
                        onClick={handleRebalance}
                        disabled={isRebalancing}
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 shadow-lg shadow-indigo-100"
                    >
                        <BoltIcon className="w-4 h-4" />
                        {isRebalancing ? 'Running...' : 'Trigger Rebalancing'}
                    </button>
                    <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                        {['ALL', 'PENDING', 'IN_TRANSIT', 'DELIVERED'].map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status as 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'ALL')}
                                className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${statusFilter === status ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                {status.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {filteredShipments.length === 0 ? (
                <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-10 text-center">
                    <p className="text-gray-500 font-medium">No shipments match your criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredShipments.map((shipment) => {
                        const copyCode = typeof shipment.copy === 'object' ? shipment.copy.copyCode : 'Unknown';
                        const workTitle = typeof shipment.copy === 'object' && typeof shipment.copy.edition === 'object' && typeof shipment.copy.edition.work === 'object' ? shipment.copy.edition.work.title : 'Unknown Book';
                        const fromLib = typeof shipment.fromLibrary === 'object' ? shipment.fromLibrary.name : 'Unknown Origin';
                        const toLib = typeof shipment.toLibrary === 'object' ? shipment.toLibrary.name : 'Unknown Destination';

                        return (
                            <div key={shipment._id} className={`bg-white rounded-2xl shadow-sm border overflow-hidden ${shipment.status === 'DELIVERED' ? 'border-green-200' : shipment.status === 'IN_TRANSIT' ? 'border-yellow-200' : 'border-gray-200'}`}>
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-1 rounded">
                                            {shipment.reason.replace(/_/g, ' ')}
                                        </span>
                                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${shipment.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : shipment.status === 'IN_TRANSIT' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {shipment.status.replace('_', ' ')}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{workTitle}</h3>
                                    <p className="text-xs font-medium text-gray-500 mt-1">Copy: {copyCode}</p>

                                    <div className="mt-6 space-y-3">
                                        <div className="relative pl-6 pb-4 border-l-2 border-indigo-100">
                                            <div className="absolute w-3 h-3 bg-white border-2 border-indigo-500 rounded-full -left-[7px] top-1"></div>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Origin</p>
                                            <p className="text-sm font-semibold text-gray-900">{fromLib}</p>
                                        </div>
                                        <div className="relative pl-6">
                                            <div className="absolute w-3 h-3 bg-white border-2 border-green-500 rounded-full -left-[7px] top-1"></div>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Destination</p>
                                            <p className="text-sm font-semibold text-gray-900">{toLib}</p>
                                        </div>
                                    </div>

                                </div>

                                <div className="p-4 bg-gray-50 border-t border-gray-100">
                                    <div className="flex flex-col gap-2">
                                        <div className="text-xs text-gray-500 flex justify-between">
                                            <span>Created: {format(new Date(shipment.createdAt), 'MMM d, yyyy')}</span>
                                            {shipment.deliveredAt && (
                                                <span className="text-green-600 font-medium pb-2">Arr: {format(new Date(shipment.deliveredAt), 'MMM d, yyyy')}</span>
                                            )}
                                        </div>

                                        {shipment.status !== 'DELIVERED' && (
                                            <div className="flex gap-2 mt-2">
                                                {shipment.status === 'PENDING' && (
                                                    <button onClick={() => handleStatusChange(shipment._id, 'IN_TRANSIT')} className="flex-1 py-2 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-1">
                                                        <TruckIcon className="w-4 h-4" /> Dispatch
                                                    </button>
                                                )}
                                                {shipment.status === 'IN_TRANSIT' && (
                                                    <button onClick={() => handleStatusChange(shipment._id, 'DELIVERED')} className="flex-1 py-2 text-xs font-bold bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-1">
                                                        <ArrowPathIcon className="w-4 h-4" /> Mark Received
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ShipmentsPage;
