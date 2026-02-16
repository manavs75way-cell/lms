import { useGetMeQuery } from '../../../services/authApi';

const ProfilePage = () => {
    const { data: user, isLoading, error } = useGetMeQuery();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center text-red-500">
                <div className="text-center">
                    <p className="text-xl font-semibold">Failed to load profile</p>
                    <p className="text-sm">Please try logging in again.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                
                <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Account Overview</h1>
                        <p className="text-gray-600">Manage your library membership and personal details.</p>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                        {user.membershipTier} Member
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">User Information</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-gray-500 text-sm">Full Name</span>
                                        <span className="text-gray-900 font-medium">{user.name}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-t border-gray-50">
                                        <span className="text-gray-500 text-sm">Email Address</span>
                                        <span className="text-gray-900 font-medium">{user.email}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-t border-gray-50">
                                        <span className="text-gray-500 text-sm">Account Role</span>
                                        <span className="text-gray-900 font-medium capitalize">{user.role.toLowerCase()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-indigo-600 rounded-2xl p-6 text-white">
                                <p className="text-indigo-100 text-sm">Books Borrowed</p>
                                <p className="text-3xl font-bold">0</p>
                            </div>
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                <p className="text-gray-500 text-sm">Active Reservations</p>
                                <p className="text-3xl font-bold text-gray-900">0</p>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg border-t-4 border-indigo-600 overflow-hidden sticky top-8">
                            <div className="p-6 text-center">
                                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl font-bold text-indigo-600">
                                        {user.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                                <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Digital Member Card</p>
                                
                                <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                    {user.barcodeUrl ? (
                                        <>
                                            <img
                                                src={`http://localhost:5000${user.barcodeUrl}`}
                                                alt="Membership Barcode"
                                                className="mx-auto mix-blend-multiply h-20 w-auto"
                                            />
                                            <p className="text-[10px] text-gray-400 mt-2">MEMBER_ID: {user._id?.substring(0,8).toUpperCase()}</p>
                                        </>
                                    ) : (
                                        <div className="h-20 flex items-center justify-center text-gray-400 italic text-sm">
                                            Barcode not available
                                        </div>
                                    )}
                                </div>
                                
                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                        Present this barcode at any library kiosk to check out physical books or access archives.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProfilePage;