import React from "react";

function Header() {
    return (
        <header className="w-2/3 bg-white shadow-md py-3 fixed top-2 left-1/2 transform -translate-x-1/2 flex items-center justify-center rounded-lg">
            {/* Left Decorative Element */}
            <div className="absolute left-2 flex items-center">
                <div className="w-6 h-6 bg-orange-500 rounded-full"></div>
                <div className="w-4 h-4 bg-orange-300 rounded-full ml-1"></div>
            </div>

            {/* Main Title */}
            <h1 className="text-3xl font-bold text-orange-500">QuizVibe</h1>

            {/* Right Decorative Element */}
            <div className="absolute right-2 flex items-center">
                <div className="w-4 h-4 bg-orange-300 rounded-full mr-1"></div>
                <div className="w-6 h-6 bg-orange-500 rounded-full"></div>
            </div>
        </header>
    );
}

export default Header;