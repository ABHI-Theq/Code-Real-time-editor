// Default code templates for different languages
export const getDefaultCode = (language) => {
    const templates = {
        javascript: `// JavaScript Example
console.log("Hello, World!");

// Function example
function greet(name) {
    return \`Hello, \${name}!\`;
}

console.log(greet("CodeSync"));`,

        python: `# Python Example
print("Hello, World!")

# Function example
def greet(name):
    return f"Hello, {name}!"

print(greet("CodeSync"))`,

        java: `// Java Example
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        
        // Method example
        String greeting = greet("CodeSync");
        System.out.println(greeting);
    }
    
    public static String greet(String name) {
        return "Hello, " + name + "!";
    }
}`,

        cpp: `// C++ Example
#include <iostream>
#include <string>

using namespace std;

string greet(string name) {
    return "Hello, " + name + "!";
}

int main() {
    cout << "Hello, World!" << endl;
    cout << greet("CodeSync") << endl;
    return 0;
}`,

        c: `// C Example
#include <stdio.h>
#include <string.h>

void greet(char* name) {
    printf("Hello, %s!\\n", name);
}

int main() {
    printf("Hello, World!\\n");
    greet("CodeSync");
    return 0;
}`,

        csharp: `// C# Example
using System;

class Program {
    static void Main() {
        Console.WriteLine("Hello, World!");
        Console.WriteLine(Greet("CodeSync"));
    }
    
    static string Greet(string name) {
        return $"Hello, {name}!";
    }
}`,

        php: `<?php
// PHP Example
echo "Hello, World!\\n";

// Function example
function greet($name) {
    return "Hello, " . $name . "!";
}

echo greet("CodeSync");
?>`,

        ruby: `# Ruby Example
puts "Hello, World!"

# Method example
def greet(name)
  "Hello, #{name}!"
end

puts greet("CodeSync")`,

        go: `// Go Example
package main

import "fmt"

func greet(name string) string {
    return fmt.Sprintf("Hello, %s!", name)
}

func main() {
    fmt.Println("Hello, World!")
    fmt.Println(greet("CodeSync"))
}`,

        rust: `// Rust Example
fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

fn main() {
    println!("Hello, World!");
    println!("{}", greet("CodeSync"));
}`,

        typescript: `// TypeScript Example
function greet(name: string): string {
    return \`Hello, \${name}!\`;
}

console.log("Hello, World!");
console.log(greet("CodeSync"));`,

        html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeSync</title>
</head>
<body>
    <h1>Hello, World!</h1>
    <p>Welcome to CodeSync!</p>
    
    <script>
        console.log("Hello from JavaScript!");
    </script>
</body>
</html>`,

        css: `/* CSS Example */
body {
    font-family: 'Arial', sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    margin: 0;
    padding: 20px;
    color: white;
}

.container {
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
}

h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.button {
    background: #4CAF50;
    color: white;
    padding: 12px 24px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.3s ease;
}

.button:hover {
    background: #45a049;
}`,

        sql: `-- SQL Example
-- Create a sample table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO users (name, email) VALUES 
('John Doe', 'john@example.com'),
('Jane Smith', 'jane@example.com');

-- Query data
SELECT * FROM users WHERE name LIKE '%John%';`,

        bash: `#!/bin/bash
# Bash Script Example

echo "Hello, World!"

# Function example
greet() {
    echo "Hello, $1!"
}

greet "CodeSync"

# Loop example
for i in {1..5}; do
    echo "Count: $i"
done`
    };

    return templates[language] || templates.javascript;
};