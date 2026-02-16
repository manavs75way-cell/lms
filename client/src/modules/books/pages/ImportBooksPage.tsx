import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useImportBooksMutation } from '../../../services/booksApi';
import { ApiError } from '../../../services/api';
import { useNavigate } from 'react-router-dom';

interface ImportFormData {
    file: FileList;
}

const ImportBooksPage = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<ImportFormData>();
    const [importBooks, { isLoading }] = useImportBooksMutation();
    const navigate = useNavigate();
    const [serverError, setServerError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const onSubmit = async (data: ImportFormData) => {
        if (!data.file[0]) return;

        const file = data.file[0];
        try {
            setServerError(null);
            setSuccessMessage(null);
            await importBooks(file).unwrap();
            setSuccessMessage('Books imported successfully!');
            setTimeout(() => {
                navigate('/books');
            }, 2000);
        } catch (err: unknown) {
            console.error('Failed to import books:', err); 
            
            setServerError((err as ApiError)?.data?.message || 'Failed to import books'); 
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6 text-center">Import Books via CSV</h1>

            {serverError && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                    {serverError}
                </div>
            )}

            {successMessage && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                    {successMessage}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CSV File</label>
                    <input
                        type="file"
                        accept=".csv"
                        {...register('file', { required: 'Please select a CSV file' })}
                        className="w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-indigo-50 file:text-indigo-700
                            hover:file:bg-indigo-100"
                    />
                    {errors.file && <p className="text-red-500 text-xs mt-1">{errors.file.message as string}</p>}
                </div>

                <div className="bg-gray-50 p-3 rounded text-xs text-gray-500">
                    <p className="font-semibold mb-1">CSV Format:</p>
                    <p>title, author, isbn, genre, publisher, totalCopies, [branch, copyCount]</p>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                    {isLoading ? 'Importing...' : 'Upload & Import'}
                </button>
            </form>
        </div>
    );
};

export default ImportBooksPage;
