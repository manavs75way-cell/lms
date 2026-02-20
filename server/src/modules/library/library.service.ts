import { Library, ILibrary } from './library.model';
import { AppError } from '../../errors/AppError';

export const createLibrary = async (data: Partial<ILibrary>) => {
    const existing = await Library.findOne({ code: data.code });
    if (existing) {
        throw new AppError('Library with this code already exists', 400);
    }
    return await Library.create(data);
};

export const getAllLibraries = async () => {
    return await Library.find({ isActive: true }).sort({ name: 1 });
};

export const getLibraryById = async (id: string) => {
    const library = await Library.findById(id);
    if (!library) {
        throw new AppError('Library not found', 404);
    }
    return library;
};

export const updateLibrary = async (id: string, data: Partial<ILibrary>) => {
    const library = await Library.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!library) {
        throw new AppError('Library not found', 404);
    }
    return library;
};

export const deleteLibrary = async (id: string) => {
    const library = await Library.findById(id);
    if (!library) {
        throw new AppError('Library not found', 404);
    }
    library.isActive = false;
    await library.save();
};
