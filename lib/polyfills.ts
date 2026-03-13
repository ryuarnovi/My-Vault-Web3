import { Buffer } from 'buffer';

if (typeof window !== 'undefined') {
    // Ensure Buffer is available for Solana/Web3.js
    window.Buffer = window.Buffer || Buffer;
    
    // Polyfill global for libraries that expect it
    if (!(window as any).global) {
        (window as any).global = window;
    }
    
    // Polyfill process for libraries that check process.env
    if (!(window as any).process) {
        (window as any).process = { 
            env: {},
            browser: true,
            version: '',
            nextTick: (cb: Function) => setTimeout(cb, 0)
        };
    } else if (!(window as any).process.env) {
        (window as any).process.env = {};
    }
    
    console.log('✅ Core Polyfills (Buffer, global, process) Loaded');
}
