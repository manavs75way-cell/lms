import { useForm, Resolver } from 'react-hook-form';
import { useToast } from '../../../context/ToastContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetBookQuery, useUpdateBookMutation, createBookSchema } from '../../../services/booksApi';
import { useGetMeQuery } from '../../../services/authApi';
import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../../../services/api';

const EditBookPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: user } = useGetMeQuery();
    const { data: book, isLoading: isLoadingBook, error: loadError } = useGetBookQuery(id || '', { skip: !id });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (user && user.role !== 'LIBRARIAN' && user.role !== 'ADMIN') {
            navigate('/');
        }
    }, [user, navigate]);

    const [updateBook, { isLoading: isUpdating }] = useUpdateBookMutation();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<EditBookFormData>({
        resolver: zodResolver(createBookSchema.omit({ coverImageUrl: true }).partial()) as Resolver<EditBookFormData>,
        defaultValues: {
            title: '',
            author: '',
            isbn: '',
            totalCopies: 1,
            genre: '',
            publisher: '',
            condition: 'GOOD',
        }
    });

    useEffect(() => {
        if (book) {
            reset({
                title: book.title,
                author: book.author,
                isbn: book.isbn,
                totalCopies: book.totalCopies,
                genre: book.genre,
                publisher: book.publisher,
                condition: book.condition,
            });
            if (book.coverImageUrl) {
                setPreviewUrl(book.coverImageUrl);
            }
        }
    }, [book, reset]);

    const { success, error: showError } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    interface EditBookFormData {
        title?: string;
        author?: string;
        isbn?: string;
        totalCopies?: number;
        genre?: string;
        publisher?: string;
        condition?: 'NEW' | 'GOOD' | 'FAIR' | 'DAMAGED';
    }

    const onSubmit = useCallback(
        async (data: EditBookFormData) => {
            if (!id) return;
            try {
                const formData = new FormData();
                (Object.keys(data) as Array<keyof EditBookFormData>).forEach(key => {
                    formData.append(key, String(data[key]));
                });
                if (selectedFile) {
                    formData.append('coverImage', selectedFile);
                }

                await updateBook({ id, data: formData }).unwrap();
                success('Book updated successfully!');
                navigate('/books');
            } catch (err) {
                showError((err as ApiError).data?.message || 'Failed to update book');
            }
        },
        [updateBook, navigate, success, showError, selectedFile, id]
    );

    const inputClasses = "mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition sm:text-sm";

    if (isLoadingBook) return <div className="text-center py-10">Loading book details...</div>;
    if (loadError) return <div className="text-center py-10 text-red-500">Error loading book</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Edit Book</h1>
                    <p className="text-gray-600">Update the details of the book.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

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
                            <p className="mt-3 text-xs text-gray-500 italic">Click to upload JPG or PNG (Max 5MB)</p>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Book Title</label>
                                    <input {...register('title')} type="text" className={inputClasses} placeholder="e.g. The Great Gatsby" />
                                    {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message as string}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Author</label>
                                    <input {...register('author')} type="text" className={inputClasses} placeholder="F. Scott Fitzgerald" />
                                    {errors.author && <p className="mt-1 text-xs text-red-600">{errors.author.message as string}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">ISBN</label>
                                    <input {...register('isbn')} type="text" className={inputClasses} placeholder="978-3-16-148410-0" />
                                    {errors.isbn && <p className="mt-1 text-xs text-red-600">{errors.isbn.message as string}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Genre</label>
                                    <input {...register('genre')} type="text" className={inputClasses} placeholder="Classic Literature" />
                                    {errors.genre && <p className="mt-1 text-xs text-red-600">{errors.genre.message as string}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Publisher</label>
                                    <input {...register('publisher')} type="text" className={inputClasses} placeholder="Scribner's" />
                                    {errors.publisher && <p className="mt-1 text-xs text-red-600">{errors.publisher.message as string}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Total Copies</label>
                                    <input {...register('totalCopies', { valueAsNumber: true })} type="number" className={inputClasses} />
                                    {errors.totalCopies && <p className="mt-1 text-xs text-red-600">{errors.totalCopies.message as string}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Condition</label>
                                    <select {...register('condition')} className={inputClasses}>
                                        <option value="NEW">New</option>
                                        <option value="GOOD">Good</option>
                                        <option value="FAIR">Fair</option>
                                        <option value="DAMAGED">Damaged</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-8 flex items-center justify-end space-x-4 border-t pt-6">
                                <button
                                    type="button"
                                    onClick={() => navigate('/books')}
                                    className="px-6 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-md transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {isUpdating ? 'Updating...' : 'Update Book'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditBookPage;
