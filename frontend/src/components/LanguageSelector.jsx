import React from 'react';

const LanguageSelector = ({ selectedLanguage, onLanguageChange }) => {
    const languages = [
        { id: 'javascript', name: 'JavaScript', icon: '🟨', extension: 'js' },
        { id: 'python', name: 'Python', icon: '🐍', extension: 'py' },
        { id: 'java', name: 'Java', icon: '☕', extension: 'java' },
        { id: 'cpp', name: 'C++', icon: '⚡', extension: 'cpp' },
        { id: 'c', name: 'C', icon: '🔧', extension: 'c' },
        { id: 'csharp', name: 'C#', icon: '🔷', extension: 'cs' },
        { id: 'php', name: 'PHP', icon: '🐘', extension: 'php' },
        { id: 'ruby', name: 'Ruby', icon: '💎', extension: 'rb' },
        { id: 'go', name: 'Go', icon: '🐹', extension: 'go' },
        { id: 'rust', name: 'Rust', icon: '🦀', extension: 'rs' },
        { id: 'typescript', name: 'TypeScript', icon: '🔷', extension: 'ts' },
        { id: 'html', name: 'HTML', icon: '🌐', extension: 'html' },
        { id: 'css', name: 'CSS', icon: '🎨', extension: 'css' },
        { id: 'sql', name: 'SQL', icon: '🗃️', extension: 'sql' },
        { id: 'bash', name: 'Bash', icon: '💻', extension: 'sh' },
    ];

    return (
        <div className="relative">
            <select
                value={selectedLanguage}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="bg-gray-800/50 border border-gray-600 text-white rounded-lg px-3 py-2 pr-8 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 appearance-none cursor-pointer hover:bg-gray-700/50"
            >
                {languages.map((lang) => (
                    <option key={lang.id} value={lang.id} className="bg-gray-800 text-white">
                        {lang.icon} {lang.name}
                    </option>
                ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </div>
    );
};

export default LanguageSelector;