import { Work, IWork } from './work.model';
import { Edition, IEdition } from './edition.model';
import { Copy, ICopy } from './copy.model';
import { AppError } from '../../errors/AppError';
import { generateBothCodes } from '../../utils/barcode';


export const createWork = async (data: Partial<IWork>) => {
    return await Work.create(data);
};

export const getAllWorks = async (search?: string) => {
    const query: Record<string, unknown> = {};
    if (search) {
        const searchRegex = new RegExp(search, 'i');
        query.$or = [
            { title: searchRegex },
            { originalAuthor: searchRegex },
        ];
    }
    return await Work.find(query).sort({ createdAt: -1 });
};

export const getWorkById = async (id: string) => {
    const work = await Work.findById(id);
    if (!work) throw new AppError('Work not found', 404);
    return work;
};

export const updateWork = async (id: string, data: Partial<IWork>) => {
    const work = await Work.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!work) throw new AppError('Work not found', 404);
    return work;
};

export const deleteWork = async (id: string) => {
    const work = await Work.findById(id);
    if (!work) throw new AppError('Work not found', 404);
    const editionCount = await Edition.countDocuments({ work: id });
    if (editionCount > 0) {
        throw new AppError('Cannot delete work with existing editions. Delete editions first.', 400);
    }
    await Work.findByIdAndDelete(id);
};


export const createEdition = async (workId: string, data: Partial<IEdition>) => {
    const work = await Work.findById(workId);
    if (!work) throw new AppError('Work not found', 404);

    const existingEdition = await Edition.findOne({ isbn: data.isbn });
    if (existingEdition) {
        throw new AppError('Edition with this ISBN already exists', 400);
    }

    return await Edition.create({ ...data, work: workId });
};

export const getEditionsByWork = async (workId: string) => {
    return await Edition.find({ work: workId }).populate('work').sort({ publicationYear: -1 });
};

export const getEditionById = async (id: string) => {
    const edition = await Edition.findById(id).populate('work');
    if (!edition) throw new AppError('Edition not found', 404);
    return edition;
};

export const updateEdition = async (id: string, data: Partial<IEdition>) => {
    const edition = await Edition.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!edition) throw new AppError('Edition not found', 404);
    return edition;
};

export const deleteEdition = async (id: string) => {
    const edition = await Edition.findById(id);
    if (!edition) throw new AppError('Edition not found', 404);
    const copyCount = await Copy.countDocuments({ edition: id });
    if (copyCount > 0) {
        throw new AppError('Cannot delete edition with existing copies. Delete copies first.', 400);
    }
    await Edition.findByIdAndDelete(id);
};


export const createCopy = async (editionId: string, data: Partial<ICopy>) => {
    const edition = await Edition.findById(editionId);
    if (!edition) throw new AppError('Edition not found', 404);

    const copyCode = data.copyCode || `COPY-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const currentLibrary = data.currentLibrary || data.owningLibrary;

    const existingCopy = await Copy.findOne({ copyCode });
    if (existingCopy) {
        throw new AppError('Copy with this code already exists', 400);
    }

    const copy = await Copy.create({ ...data, copyCode, currentLibrary, edition: editionId });

    try {
        const { barcodeUrl, qrCodeUrl } = await generateBothCodes(
            copy.copyCode,
            copy._id.toString()
        );
        copy.barcodeUrl = barcodeUrl;
        copy.qrCodeUrl = qrCodeUrl;
        await copy.save();
    } catch (error) {
        console.error('Failed to generate codes for copy:', error);
    }

    return copy;
};

export const getCopiesByEdition = async (editionId: string) => {
    return await Copy.find({ edition: editionId })
        .populate('owningLibrary', 'name code')
        .populate('currentLibrary', 'name code')
        .sort({ copyCode: 1 });
};

export const getCopyById = async (id: string) => {
    const copy = await Copy.findById(id)
        .populate({ path: 'edition', populate: { path: 'work' } })
        .populate('owningLibrary', 'name code')
        .populate('currentLibrary', 'name code');
    if (!copy) throw new AppError('Copy not found', 404);
    return copy;
};

export const updateCopy = async (id: string, data: Partial<ICopy>) => {
    const copy = await Copy.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!copy) throw new AppError('Copy not found', 404);
    return copy;
};

export const deleteCopy = async (id: string) => {
    const copy = await Copy.findById(id);
    if (!copy) throw new AppError('Copy not found', 404);
    if (copy.status === 'BORROWED') {
        throw new AppError('Cannot delete a currently borrowed copy', 400);
    }
    await Copy.findByIdAndDelete(id);
};

export const searchCatalog = async (query: string) => {
    const searchRegex = new RegExp(query, 'i');

    const worksByTitleAuthor = await Work.find({
        $or: [
            { title: searchRegex },
            { originalAuthor: searchRegex },
        ],
    });

    const editionsByISBN = await Edition.find({ isbn: searchRegex });
    const workIdsFromEditions = editionsByISBN.map((e) => e.work);

    const allWorkIds = new Set([
        ...worksByTitleAuthor.map((w) => w._id.toString()),
        ...workIdsFromEditions.map((id) => id.toString()),
    ]);
    const results = [];
    for (const workId of allWorkIds) {
        const work = await Work.findById(workId);
        if (!work) continue;

        const editions = await Edition.find({ work: workId });
        const editionsWithAvailability = [];

        for (const edition of editions) {
            const totalCopies = await Copy.countDocuments({ edition: edition._id });
            const availableCopies = await Copy.countDocuments({
                edition: edition._id,
                status: 'AVAILABLE',
            });
            editionsWithAvailability.push({
                ...edition.toObject(),
                totalCopies,
                availableCopies,
            });
        }

        results.push({
            work: work.toObject(),
            editions: editionsWithAvailability,
        });
    }

    return results;
};

export const getEditionAvailability = async (editionId: string) => {
    const copies = await Copy.find({ edition: editionId })
        .populate('currentLibrary', 'name code');

    const libraryMap = new Map<
        string,
        { libraryName: string; libraryCode: string; total: number; available: number }
    >();

    for (const copy of copies) {
        const lib = copy.currentLibrary as unknown as { _id: string; name: string; code: string };
        const libId = lib._id.toString();

        if (!libraryMap.has(libId)) {
            libraryMap.set(libId, {
                libraryName: lib.name,
                libraryCode: lib.code,
                total: 0,
                available: 0,
            });
        }

        const entry = libraryMap.get(libId)!;
        entry.total++;
        if (copy.status === 'AVAILABLE') {
            entry.available++;
        }
    }

    return Array.from(libraryMap.values());
};
