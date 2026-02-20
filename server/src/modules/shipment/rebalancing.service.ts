import { Copy } from '../book/copy.model';
import { Edition } from '../book/edition.model';
import { Library } from '../library/library.model';
import { Shipment } from './shipment.model';

interface RebalancingResult {
    editionId: string;
    editionIsbn: string;
    shipmentsCreated: number;
    details: Array<{
        from: string;
        to: string;
        copyCount: number;
    }>;
}

export const runRebalancing = async (triggeredBy?: string): Promise<RebalancingResult[]> => {
    const libraries = await Library.find({ isActive: true });
    if (libraries.length < 2) return [];

    const editions = await Edition.find();
    const results: RebalancingResult[] = [];

    for (const edition of editions) {
        const copies = await Copy.find({
            edition: edition._id,
            status: { $in: ['AVAILABLE', 'BORROWED'] },
        });

        if (copies.length < 2) continue;

        const libraryCountMap = new Map<string, number>();
        const libraryCopiesMap = new Map<string, typeof copies>();

        for (const lib of libraries) {
            libraryCountMap.set(lib._id.toString(), 0);
            libraryCopiesMap.set(lib._id.toString(), []);
        }

        for (const copy of copies) {
            const libId = copy.currentLibrary.toString();
            libraryCountMap.set(libId, (libraryCountMap.get(libId) || 0) + 1);
            const existing = libraryCopiesMap.get(libId) || [];
            existing.push(copy);
            libraryCopiesMap.set(libId, existing);
        }

        const totalCopies = copies.length;
        const overloadedThreshold = 0.60;

        const emptyLibraries = libraries.filter(
            (lib) => (libraryCountMap.get(lib._id.toString()) || 0) === 0
        );

        const overloadedLibraries = libraries.filter((lib) => {
            const count = libraryCountMap.get(lib._id.toString()) || 0;
            return count / totalCopies > overloadedThreshold;
        });

        if (emptyLibraries.length === 0 || overloadedLibraries.length === 0) continue;

        const shipmentDetails: RebalancingResult['details'] = [];
        let shipmentsCreated = 0;

        for (const overloaded of overloadedLibraries) {
            const availableCopies = (libraryCopiesMap.get(overloaded._id.toString()) || [])
                .filter((c) => c.status === 'AVAILABLE');

            for (const empty of emptyLibraries) {
                if (availableCopies.length === 0) break;

                const copyToMove = availableCopies.shift();
                if (!copyToMove) break;

                copyToMove.status = 'IN_TRANSIT';
                await copyToMove.save();

                await Shipment.create({
                    copy: copyToMove._id,
                    fromLibrary: overloaded._id,
                    toLibrary: empty._id,
                    reason: 'REBALANCING',
                    triggeredBy: triggeredBy || undefined,
                });

                shipmentDetails.push({
                    from: overloaded.name,
                    to: empty.name,
                    copyCount: 1,
                });
                shipmentsCreated++;
            }
        }

        if (shipmentsCreated > 0) {
            results.push({
                editionId: edition._id.toString(),
                editionIsbn: edition.isbn,
                shipmentsCreated,
                details: shipmentDetails,
            });
        }
    }

    return results;
};

export const getShipments = async (filters?: {
    status?: string;
    libraryId?: string;
}) => {
    const query: Record<string, unknown> = {};
    if (filters?.status) query.status = filters.status;
    if (filters?.libraryId) {
        query.$or = [
            { fromLibrary: filters.libraryId },
            { toLibrary: filters.libraryId },
        ];
    }

    return await Shipment.find(query)
        .populate({
            path: 'copy',
            populate: {
                path: 'edition',
                populate: { path: 'work' }
            }
        })
        .populate('fromLibrary', 'name code')
        .populate('toLibrary', 'name code')
        .sort({ createdAt: -1 });
};

export const updateShipmentStatus = async (
    shipmentId: string,
    status: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED'
) => {
    const shipment = await Shipment.findById(shipmentId);
    if (!shipment) {
        throw new Error('Shipment not found');
    }

    shipment.status = status;
    if (status === 'DELIVERED') {
        shipment.deliveredAt = new Date();

        const copy = await Copy.findById(shipment.copy);
        if (copy) {
            copy.currentLibrary = shipment.toLibrary;
            copy.status = 'AVAILABLE';
            await copy.save();
        }
    }

    await shipment.save();
    return shipment;
};
