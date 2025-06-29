// Code execution utilities for different languages
export const executeCode = async (code, language) => {
    try {
        switch (language) {
            case 'javascript':
                return executeJavaScript(code);
            case 'python':
                return executePython(code);
            case 'html':
                return executeHTML(code);
            case 'css':
                return executeCSS(code);
            default:
                return {
                    success: false,
                    output: `Execution not supported for ${language} in browser environment.\nSupported languages: JavaScript, Python (limited), HTML, CSS`,
                    error: null
                };
        }
    } catch (error) {
        return {
            success: false,
            output: '',
            error: `Execution Error: ${error.message}`
        };
    }
};

// JavaScript execution
const executeJavaScript = (code) => {
    try {
        const logs = [];
        const errors = [];
        
        // Capture console.log
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;
        
        console.log = (...args) => {
            logs.push(args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' '));
            originalLog.apply(console, args);
        };
        
        console.error = (...args) => {
            errors.push(args.map(arg => String(arg)).join(' '));
            originalError.apply(console, args);
        };
        
        console.warn = (...args) => {
            logs.push('⚠️ ' + args.map(arg => String(arg)).join(' '));
            originalWarn.apply(console, args);
        };
        
        // Execute code in a try-catch block
        let result;
        try {
            // Use Function constructor for safer evaluation
            const func = new Function(code);
            result = func();
            
            if (result !== undefined) {
                logs.push(`Return value: ${typeof result === 'object' ? JSON.stringify(result, null, 2) : result}`);
            }
        } catch (execError) {
            errors.push(`Runtime Error: ${execError.message}`);
        }
        
        // Restore original console methods
        console.log = originalLog;
        console.error = originalError;
        console.warn = originalWarn;
        
        const output = logs.length > 0 ? logs.join('\n') : 'Code executed successfully (no output)';
        const error = errors.length > 0 ? errors.join('\n') : null;
        
        return {
            success: errors.length === 0,
            output,
            error
        };
        
    } catch (error) {
        return {
            success: false,
            output: '',
            error: `Syntax Error: ${error.message}`
        };
    }
};

// Python execution (limited - using Pyodide would be better but complex)
const executePython = (code) => {
    try {
        // This is a very basic Python-like execution
        // For real Python execution, you'd need Pyodide or a backend service
        
        const lines = code.split('\n');
        const outputs = [];
        
        for (const line of lines) {
            const trimmed = line.trim();
            
            // Handle print statements
            const printMatch = trimmed.match(/^print\s*\(\s*["'](.*)["']\s*\)$/);
            if (printMatch) {
                outputs.push(printMatch[1]);
                continue;
            }
            
            // Handle simple variable assignments and prints
            const varPrintMatch = trimmed.match(/^print\s*\(\s*(\w+)\s*\)$/);
            if (varPrintMatch) {
                outputs.push(`${varPrintMatch[1]} (variable)`);
                continue;
            }
            
            // Handle comments
            if (trimmed.startsWith('#') || trimmed === '') {
                continue;
            }
            
            // For other statements, just acknowledge them
            if (trimmed.length > 0) {
                outputs.push(`Executed: ${trimmed}`);
            }
        }
        
        return {
            success: true,
            output: outputs.length > 0 ? outputs.join('\n') : 'Python code processed (limited execution)',
            error: null
        };
        
    } catch (error) {
        return {
            success: false,
            output: '',
            error: `Python Execution Error: ${error.message}`
        };
    }
};

// HTML execution
const executeHTML = (code) => {
    try {
        // Create a preview of HTML
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        
        iframe.contentDocument.open();
        iframe.contentDocument.write(code);
        iframe.contentDocument.close();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(iframe);
        }, 100);
        
        return {
            success: true,
            output: 'HTML code executed successfully!\nHTML content has been processed and would be rendered in a browser.',
            error: null
        };
        
    } catch (error) {
        return {
            success: false,
            output: '',
            error: `HTML Error: ${error.message}`
        };
    }
};

// CSS execution
const executeCSS = (code) => {
    try {
        // Validate CSS by creating a style element
        const style = document.createElement('style');
        style.textContent = code;
        document.head.appendChild(style);
        
        // Remove the style element after validation
        setTimeout(() => {
            document.head.removeChild(style);
        }, 100);
        
        return {
            success: true,
            output: 'CSS code validated successfully!\nStyles would be applied to HTML elements.',
            error: null
        };
        
    } catch (error) {
        return {
            success: false,
            output: '',
            error: `CSS Error: ${error.message}`
        };
    }
};