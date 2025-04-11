import React from 'react';

function NotFoundPage() {
    return (
        <div className="bg-gray-100 flex flex-col items-center justify-center h-screen">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <h1 className="text-6xl font-bold text-red-500 mb-4">Oops!</h1>
                <p className="text-xl text-gray-700 mb-6">
                    We can't seem to find the page you're looking for.
                </p>
                <p className="text-gray-600 mb-8">
                    Error 404 - Page Not Found
                </p>
                <a
                    href="/"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full"
                >
                    Go back home
                </a>
            </div>
        </div>
    );
}

export default NotFoundPage;