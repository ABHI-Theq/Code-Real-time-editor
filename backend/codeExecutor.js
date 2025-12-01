import axios from 'axios';

// Language ID mapping for Judge0 API
const LANGUAGE_IDS = {
    javascript: 63,      // Node.js
    python: 71,          // Python 3
    java: 62,            // Java
    cpp: 54,             // C++ (GCC 9.2.0)
    c: 50,               // C (GCC 9.2.0)
    csharp: 51,          // C# (Mono 6.6.0.161)
    php: 68,             // PHP
    ruby: 72,            // Ruby
    go: 60,              // Go
    rust: 73,            // Rust
    typescript: 74,      // TypeScript
    kotlin: 78,          // Kotlin
    swift: 83,           // Swift
    r: 80,               // R
    perl: 85,            // Perl
    bash: 46,            // Bash
    sql: 82,             // SQL (SQLite)
};

// Piston API language mapping (alternative)
const PISTON_LANGUAGES = {
    javascript: 'javascript',
    python: 'python',
    java: 'java',
    cpp: 'c++',
    c: 'c',
    csharp: 'csharp',
    php: 'php',
    ruby: 'ruby',
    go: 'go',
    rust: 'rust',
    typescript: 'typescript',
    kotlin: 'kotlin',
    swift: 'swift',
    r: 'r',
    perl: 'perl',
    bash: 'bash',
};

/**
 * Execute code using Judge0 API
 */
export async function executeWithJudge0(code, language, input = '') {
    const languageId = LANGUAGE_IDS[language];
    
    if (!languageId) {
        return {
            success: false,
            output: '',
            error: `Language '${language}' is not supported`,
            executionTime: 0,
        };
    }

    try {
        const apiUrl = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
        const apiKey = process.env.JUDGE0_API_KEY;

        // Validate code length
        const maxLength = parseInt(process.env.MAX_CODE_LENGTH) || 10000;
        if (code.length > maxLength) {
            return {
                success: false,
                output: '',
                error: `Code exceeds maximum length of ${maxLength} characters`,
                executionTime: 0,
            };
        }

        // Create submission
        const submissionResponse = await axios.post(
            `${apiUrl}/submissions?base64_encoded=false&wait=true`,
            {
                source_code: code,
                language_id: languageId,
                stdin: input || '',
                cpu_time_limit: 5, // 5 seconds max
                memory_limit: 128000, // 128 MB
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-RapidAPI-Key': apiKey,
                    'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
                },
                timeout: parseInt(process.env.EXECUTION_TIMEOUT) || 10000,
            }
        );

        const result = submissionResponse.data;

        // Status codes: 1-2 = processing, 3 = accepted, 4 = wrong answer, 5 = time limit, 6 = compilation error, etc.
        const isSuccess = result.status.id === 3;
        
        return {
            success: isSuccess,
            output: result.stdout || '',
            error: result.stderr || result.compile_output || (result.status.id !== 3 ? result.status.description : null),
            executionTime: parseFloat(result.time) || 0,
            memory: result.memory || 0,
            status: result.status.description,
        };

    } catch (error) {
        console.error('Judge0 execution error:', error.message);
        return {
            success: false,
            output: '',
            error: `Execution service error: ${error.message}`,
            executionTime: 0,
        };
    }
}

/**
 * Execute code using Piston API (free alternative)
 */
export async function executeWithPiston(code, language, input = '') {
    const pistonLang = PISTON_LANGUAGES[language];
    
    if (!pistonLang) {
        return {
            success: false,
            output: '',
            error: `Language '${language}' is not supported`,
            executionTime: 0,
        };
    }

    try {
        const apiUrl = process.env.PISTON_API_URL || 'https://emkc.org/api/v2/piston';

        // Validate code length
        const maxLength = parseInt(process.env.MAX_CODE_LENGTH) || 10000;
        if (code.length > maxLength) {
            return {
                success: false,
                output: '',
                error: `Code exceeds maximum length of ${maxLength} characters`,
                executionTime: 0,
            };
        }

        const response = await axios.post(
            `${apiUrl}/execute`,
            {
                language: pistonLang,
                version: '*', // Use latest version
                files: [
                    {
                        name: `main.${getFileExtension(language)}`,
                        content: code,
                    },
                ],
                stdin: input || '',
                args: [],
                compile_timeout: 10000,
                run_timeout: 3000,
                compile_memory_limit: -1,
                run_memory_limit: -1,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 30000, // Increased to 30 seconds
            }
        );

        const result = response.data;
        const output = result.run.stdout || '';
        const error = result.run.stderr || result.compile?.stderr || '';

        return {
            success: !error && result.run.code === 0,
            output: output,
            error: error || null,
            executionTime: 0, // Piston doesn't provide execution time
            status: result.run.signal || 'completed',
        };

    } catch (error) {
        console.error('Piston execution error:', error.message);
        return {
            success: false,
            output: '',
            error: `Execution service error: ${error.message}`,
            executionTime: 0,
        };
    }
}

/**
 * Main execution function - tries Piston first (free), falls back to Judge0
 */
export async function executeCode(code, language, input = '') {
    // Input validation
    if (!code || typeof code !== 'string') {
        return {
            success: false,
            output: '',
            error: 'Invalid code input',
            executionTime: 0,
        };
    }

    if (!language || typeof language !== 'string') {
        return {
            success: false,
            output: '',
            error: 'Invalid language specified',
            executionTime: 0,
        };
    }

    // Sanitize inputs
    const sanitizedCode = code.trim();
    const sanitizedLanguage = language.toLowerCase().trim();
    const sanitizedInput = typeof input === 'string' ? input : '';

    // Try Piston API first (it's free and doesn't require API key)
    try {
        const result = await executeWithPiston(sanitizedCode, sanitizedLanguage, sanitizedInput);
        if (result.success || !process.env.JUDGE0_API_KEY) {
            return result;
        }
    } catch (error) {
        console.log('Piston failed, trying Judge0...');
    }

    // Fallback to Judge0 if Piston fails and API key is available
    if (process.env.JUDGE0_API_KEY && process.env.JUDGE0_API_KEY !== 'your_rapidapi_key_here') {
        return await executeWithJudge0(sanitizedCode, sanitizedLanguage, sanitizedInput);
    }

    return {
        success: false,
        output: '',
        error: 'No execution service available. Please configure Judge0 API key or check Piston API availability.',
        executionTime: 0,
    };
}

/**
 * Get file extension for language
 */
function getFileExtension(language) {
    const extensions = {
        javascript: 'js',
        python: 'py',
        java: 'java',
        cpp: 'cpp',
        c: 'c',
        csharp: 'cs',
        php: 'php',
        ruby: 'rb',
        go: 'go',
        rust: 'rs',
        typescript: 'ts',
        kotlin: 'kt',
        swift: 'swift',
        r: 'r',
        perl: 'pl',
        bash: 'sh',
        sql: 'sql',
    };
    return extensions[language] || 'txt';
}

/**
 * Get supported languages
 */
export function getSupportedLanguages() {
    return Object.keys(LANGUAGE_IDS);
}
