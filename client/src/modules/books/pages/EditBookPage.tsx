import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '../../../context/ToastContext';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetWorkQuery, useUpdateWorkMutation, Work } from '../../../services/booksApi';
import { useGetMeQuery } from '../../../services/authApi';
import { ApiError } from '../../../services/api';

const EditBookPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: user } = useGetMeQuery();

    const isValidId = id && id !== 'undefined' && id !== 'null';

    const { data: work, isLoading: isLoadingWork, error: loadError } = useGetWorkQuery(id || '', { skip: !isValidId });


    useEffect(() => {
        if (user && user.role !== 'LIBRARIAN' && user.role !== 'ADMIN') {
            navigate('/');
        }
    }, [user, navigate]);

    const [updateWork, { isLoading: isUpdating }] = useUpdateWorkMutation();

    const {
        register,
        handleSubmit,
        formState: { },
        reset,
    } = useForm<Partial<Work>>({
        defaultValues: {
            title: '',
            originalAuthor: '',
            genres: [],
            description: '',
        }
    });

    useEffect(() => {
        if (work) {
            reset({
                title: work.title,
                originalAuthor: work.originalAuthor,
                genres: work.genres,
                description: work.description,
            });
        }
    }, [work, reset]);

    const { success, error: showError } = useToast();

    const onSubmit = useCallback(
        async (data: Partial<Work>) => {
            if (!id) return;
            try {
                await updateWork({ id, data }).unwrap();
                success('Work updated successfully!');
                navigate('/books');
            } catch (err) {
                showError((err as ApiError).data?.message || 'Failed to update catalog entry');
            }
        },
        [updateWork, navigate, success, showError, id]
    );

    const inputClasses = "mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition sm:text-sm";

    if (isLoadingWork) return <div className="text-center py-10">Loading catalog entry...</div>;
    if (loadError) return <div className="text-center py-10 text-red-500">Error loading catalog entry.</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Edit Catalog Work</h1>
                    <p className="text-gray-600">Update the parent details for this entry. Editions and Copies are managed separately.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Book Title</label>
                            <input {...register('title')} type="text" className={inputClasses} placeholder="e.g. The Great Gatsby" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Original Author</label>
                            <input {...register('originalAuthor')} type="text" className={inputClasses} placeholder="F. Scott Fitzgerald" />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea {...register('description')} rows={4} className={inputClasses} />
                        </div>
                    </div>

                    <div className="mt-8 flex items-center justify-end space-x-4 border-t pt-6">
                        <button
                            type="button"
                            onClick={() => navigate('/books')}
                            className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isUpdating}
                            className="px-8 py-2 bg-indigo-600 text-white rounded-md text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
                        >
                            {isUpdating ? 'Updating...' : 'Update Work'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditBookPage;
