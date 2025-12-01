import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3301';

/**
 * Execute code on the backend
 */
export async function executeCode(code, language) {
    try {
        const response = await axios.post(
            `${API_URL}/api/execute`,
            {
                code,
                language,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 35000, // Increased to 35 seconds to account for backend timeout
            }
        );

        return response.data;
    } catch (error) {
        if (error.response) {
            // Server responded with error
            return {
                success: false,
                output: '',
                error: error.response.data.error || 'Execution failed',
                executionTime: 0,
            };
        } else if (error.request) {
            // Request made but no response
            return {
                success: false,
                output: '',
                error: 'No response from server. Please check your connection.',
                executionTime: 0,
            };
        } else {
            // Error setting up request
            return {
                success: false,
                output: '',
                error: `Request error: ${error.message}`,
                executionTime: 0,
            };
        }
    }
}

/**
 * Get supported languages
 */
export async function getSupportedLanguages() {
    try {
        const response = await axios.get(`${API_URL}/api/languages`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch languages:', error);
        return {
            success: false,
            languages: [],
        };
    }
}

/**
 * Get default code template for a language
 */
export function getDefaultCode(language) {
    const templates = {
        javascript: `console.log("Hello, World!");

// Example: Calculate factorial
function factorial(n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

console.log("Factorial of 5:", factorial(5));`,

        python: `print("Hello, World!")

# Example: Calculate factorial
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print("Factorial of 5:", factorial(5))`,

        java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        
        // Example: Calculate factorial
        System.out.println("Factorial of 5: " + factorial(5));
    }
    
    public static int factorial(int n) {
        if (n <= 1) return 1;
        return n * factorial(n - 1);
    }
}`,

        cpp: `#include <iostream>
using namespace std;

int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

int main() {
    cout << "Hello, World!" << endl;
    cout << "Factorial of 5: " << factorial(5) << endl;
    return 0;
}`,

        c: `#include <stdio.h>

int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

int main() {
    printf("Hello, World!\\n");
    printf("Factorial of 5: %d\\n", factorial(5));
    return 0;
}`,

        csharp: `using System;

class Program {
    static void Main() {
        Console.WriteLine("Hello, World!");
        Console.WriteLine("Factorial of 5: " + Factorial(5));
    }
    
    static int Factorial(int n) {
        if (n <= 1) return 1;
        return n * Factorial(n - 1);
    }
}`,

        php: `<?php
echo "Hello, World!\\n";

function factorial($n) {
    if ($n <= 1) return 1;
    return $n * factorial($n - 1);
}

echo "Factorial of 5: " . factorial(5) . "\\n";
?>`,

        ruby: `puts "Hello, World!"

def factorial(n)
    return 1 if n <= 1
    n * factorial(n - 1)
end

puts "Factorial of 5: #{factorial(5)}"`,

        go: `package main

import "fmt"

func factorial(n int) int {
    if n <= 1 {
        return 1
    }
    return n * factorial(n-1)
}

func main() {
    fmt.Println("Hello, World!")
    fmt.Printf("Factorial of 5: %d\\n", factorial(5))
}`,

        rust: `fn factorial(n: u32) -> u32 {
    if n <= 1 {
        1
    } else {
        n * factorial(n - 1)
    }
}

fn main() {
    println!("Hello, World!");
    println!("Factorial of 5: {}", factorial(5));
}`,

        typescript: `console.log("Hello, World!");

function factorial(n: number): number {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

console.log("Factorial of 5:", factorial(5));`,

        bash: `#!/bin/bash
echo "Hello, World!"

factorial() {
    if [ $1 -le 1 ]; then
        echo 1
    else
        local temp=$(factorial $(($1 - 1)))
        echo $(($1 * temp))
    fi
}

echo "Factorial of 5: $(factorial 5)"`,
    };

    return templates[language] || `// Start coding in ${language}...\n`;
}
