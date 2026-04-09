import '@testing-library/jest-dom';

// Polyfill TextEncoder/TextDecoder for LiveKit client
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;
