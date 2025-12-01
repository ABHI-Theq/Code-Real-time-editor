// Quick test script for code execution
import { executeCode } from './codeExecutor.js';

async function testExecution() {
    console.log('🧪 Testing Code Execution Service...\n');

    // Test JavaScript
    console.log('1️⃣ Testing JavaScript:');
    const jsResult = await executeCode('console.log("Hello from JavaScript!");', 'javascript');
    console.log('Result:', jsResult);
    console.log('');

    // Test Python
    console.log('2️⃣ Testing Python:');
    const pyResult = await executeCode('print("Hello from Python!")', 'python');
    console.log('Result:', pyResult);
    console.log('');

    // Test with error
    console.log('3️⃣ Testing Error Handling:');
    const errorResult = await executeCode('console.log("missing quote);', 'javascript');
    console.log('Result:', errorResult);
    console.log('');

    console.log('✅ Test completed!');
}

testExecution().catch(console.error);
