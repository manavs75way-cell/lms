import { api } from './api';
import { Copy, Edition, Work } from './booksApi';
import { Library } from './libraryApi';
import { User } from './authApi';

export interface Shipment {
    _id: string;
    copy: Copy & { edition: Edition & { work: Work } };
    fromLibrary: Library;
    toLibrary: Library;
    reason: 'INTER_LIBRARY_RETURN' | 'REBALANCING' | 'TRANSFER';
    status: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED';
    triggeredBy?: User;
    createdAt: string;
    deliveredAt?: string;
}

export const shipmentApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getShipments: builder.query<Shipment[], { status?: string; libraryId?: string } | void>({
            query: (params) => ({
                url: 'shipments',
                params: params || undefined,
            }),
            transformResponse: (response: { data: Shipment[] }) => response.data,
            providesTags: ['Shipments'],
        }),
        updateShipmentStatus: builder.mutation<Shipment, { id: string; status: string }>({
            query: ({ id, status }) => ({
                url: `shipments/${id}/status`,
                method: 'PATCH',
                body: { status },
            }),
            invalidatesTags: ['Shipments', 'Books'],
        }),
        rebalanceCollections: builder.mutation<{ data: { shipmentsCreated: number; editionId: string }[] }, void>({
            query: () => ({
                url: 'shipments/rebalance',
                method: 'POST',
            }),
            invalidatesTags: ['Shipments', 'Books'],
        }),
    }),
});

export const {
    useGetShipmentsQuery,
    useUpdateShipmentStatusMutation,
    useRebalanceCollectionsMutation,
} = shipmentApi;
