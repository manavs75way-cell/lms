import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '../../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import {
    useCreateWorkMutation,
    useCreateEditionMutation,
    useCreateCopyMutation,
} from '../../../services/booksApi';
import { useGetLibrariesQuery } from '../../../services/libraryApi';
import { useGetMeQuery } from '../../../services/authApi';
import { ApiError } from '../../../services/api';

interface AddBookFormData {
    title: string;
    originalAuthor: string;
    genres: string;
    description: string;
    isbn: string;
    format: 'HARDCOVER' | 'PAPERBACK' | 'AUDIOBOOK' | 'EBOOK';
    publisher: string;
    publicationYear: number;
    language: string;
    replacementCost: number;
    totalCopies: number;
    libraryId: string;
    condition: 'NEW' | 'GOOD' | 'FAIR' | 'DAMAGED';
}

const AddBookPage = () => {
    const navigate = useNavigate();
    const { data: user } = useGetMeQuery();
    const { data: libraries } = useGetLibrariesQuery();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user && user.role !== 'LIBRARIAN' && user.role !== 'ADMIN') {
            navigate('/');
        }
    }, [user, navigate]);

    const [createWork] = useCreateWorkMutation();
    const [createEdition] = useCreateEditionMutation();
    const [createCopy] = useCreateCopyMutation();
    const { success, error: showError } = useToast();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<AddBookFormData>({
        defaultValues: {
            title: '',
            originalAuthor: '',
            genres: '',
            description: '',
            isbn: '',
            format: 'HARDCOVER',
            publisher: '',
            publicationYear: new Date().getFullYear(),
            language: 'English',
            replacementCost: 20,
            totalCopies: 1,
            libraryId: '',
            condition: 'NEW',
        },
        mode: 'onTouched',
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const onSubmit = useCallback(
        async (data: AddBookFormData) => {
            setIsSubmitting(true);
            try {
                const workFormData = new FormData();
                workFormData.append('title', data.title);
                workFormData.append('originalAuthor', data.originalAuthor);
                workFormData.append('description', data.description || '');
                data.genres.split(',').map(g => g.trim()).filter(Boolean).forEach(g => {
                    workFormData.append('genres[]', g);
                });
                if (selectedFile) {
                    workFormData.append('coverImage', selectedFile);
                }

                const workResponse = await createWork(workFormData).unwrap();
                const workId = workResponse.data?._id || workResponse._id;

                if (!workId) throw new Error("Failed to get Work ID from server");

                const editionFormData = new FormData();
                editionFormData.append('isbn', data.isbn);
                editionFormData.append('format', data.format);
                editionFormData.append('publisher', data.publisher);
                editionFormData.append('publicationYear', String(data.publicationYear));
                editionFormData.append('language', data.language);
                editionFormData.append('replacementCost', String(data.replacementCost));

                const editionResponse = await createEdition({ workId, data: editionFormData }).unwrap();
                const editionId = editionResponse.data?._id || editionResponse._id;

                if (!editionId) throw new Error("Failed to get Edition ID from server");

                const copyPromises = [];
                for (let i = 0; i < data.totalCopies; i++) {
                    copyPromises.push(createCopy({
                        editionId,
                        owningLibrary: data.libraryId,
                        condition: data.condition
                    }).unwrap());
                }
                await Promise.all(copyPromises);

                success(`Successfully created Work, Edition, and ${data.totalCopies} copies!`);
                navigate('/books');
            } catch (err) {
                showError((err as ApiError).data?.message || 'An error occurred during creation.');
            } finally {
                setIsSubmitting(false);
            }
        },
        [createWork, createEdition, createCopy, navigate, success, showError, selectedFile]
    );

    const inputClasses = (hasError: boolean) =>
        `mt-1 block w-full px-4 py-2 border ${hasError ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition sm:text-sm`;

    const ErrorMsg = ({ msg }: { msg?: string }) =>
        msg ? <p className="mt-1.5 text-xs text-red-600 font-medium animate-in fade-in slide-in-from-top-1">{msg}</p> : null;

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Add New Book to Collection</h1>
                    <p className="text-gray-600">This form creates the Work, its first Edition, and the initial physical Copies.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 lg:grid lg:grid-cols-3 lg:gap-8 lg:space-y-0">

                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm text-center">
                            <label className="block text-sm font-semibold text-gray-700 mb-4">Book Cover</label>
                            <div className="relative group">
                                <div className={`aspect-[3/4] rounded-xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-colors ${previewUrl ? 'border-indigo-500' : 'border-gray-300 hover:border-indigo-400'}`}>
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="p-4 text-gray-400">
                                            <p className="text-xs">No cover selected</p>
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>
                            <p className="mt-3 text-xs text-gray-500 italic">Click to upload JPG or PNG</p>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">

                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">Step 1: Parent Work Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Book Title *</label>
                                    <input {...register('title', { required: 'Title is required' })} className={inputClasses(!!errors.title)} placeholder="e.g. 1984" />
                                    <ErrorMsg msg={errors.title?.message} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Author *</label>
                                    <input {...register('originalAuthor', { required: 'Author is required' })} className={inputClasses(!!errors.originalAuthor)} placeholder="George Orwell" />
                                    <ErrorMsg msg={errors.originalAuthor?.message} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Genres</label>
                                    <input {...register('genres')} className={inputClasses(!!errors.genres)} placeholder="Dystopian, Sci-Fi (comma separated)" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <textarea {...register('description')} className={inputClasses(!!errors.description)} rows={3} placeholder="Brief summary of the work..." />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">Step 2: Edition Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">ISBN *</label>
                                    <input {...register('isbn', { required: 'ISBN is required' })} className={inputClasses(!!errors.isbn)} placeholder="978-0451524935" />
                                    <ErrorMsg msg={errors.isbn?.message} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Format</label>
                                    <select {...register('format')} className={inputClasses(!!errors.format)}>
                                        <option value="HARDCOVER">Hardcover</option>
                                        <option value="PAPERBACK">Paperback</option>
                                        <option value="AUDIOBOOK">Audiobook</option>
                                        <option value="EBOOK">EBook</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Publisher</label>
                                    <input {...register('publisher')} className={inputClasses(!!errors.publisher)} placeholder="Signet Classic" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Publication Year</label>
                                    <input type="number" {...register('publicationYear', { valueAsNumber: true, min: { value: 1000, message: 'Invalid year' }, max: { value: new Date().getFullYear() + 1, message: 'Invalid year' } })} className={inputClasses(!!errors.publicationYear)} />
                                    <ErrorMsg msg={errors.publicationYear?.message} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Language</label>
                                    <input {...register('language')} className={inputClasses(!!errors.language)} placeholder="English" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Replacement Cost ($)</label>
                                    <input type="number" step="0.01" {...register('replacementCost', { valueAsNumber: true, min: { value: 0, message: 'Cannot be negative' } })} className={inputClasses(!!errors.replacementCost)} />
                                    <ErrorMsg msg={errors.replacementCost?.message} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">Step 3: Physical Copies</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Number of Copies</label>
                                    <input type="number" min="1" {...register('totalCopies', { valueAsNumber: true, min: { value: 1, message: 'Must add at least 1 copy' } })} className={inputClasses(!!errors.totalCopies)} />
                                    <ErrorMsg msg={errors.totalCopies?.message} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Assign to Library *</label>
                                    <select {...register('libraryId', { required: 'Please select a library' })} className={inputClasses(!!errors.libraryId)}>
                                        <option value="">-- Select Library --</option>
                                        {libraries?.map(lib => (
                                            <option key={lib._id} value={lib._id}>{lib.name}</option>
                                        ))}
                                    </select>
                                    <ErrorMsg msg={errors.libraryId?.message} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Initial Condition</label>
                                    <select {...register('condition')} className={inputClasses(!!errors.condition)}>
                                        <option value="NEW">New</option>
                                        <option value="GOOD">Good</option>
                                        <option value="FAIR">Fair</option>
                                        <option value="DAMAGED">Damaged</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => navigate('/books')}
                                className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-8 py-2 bg-indigo-600 text-white rounded-md text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
                            >
                                {isSubmitting ? 'Creating...' : 'Save Catalog Entry'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddBookPage;
