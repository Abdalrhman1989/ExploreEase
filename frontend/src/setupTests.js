// src/setupTests.js
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import dotenv from 'dotenv';

// Load environment variables from the .env file located at the project root
dotenv.config({ path: '../.env' });

// Mock TextEncoder and TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock window.alert
global.alert = jest.fn();

// Suppress Deprecation Warnings (Optional)
const originalEmit = process.emit;
process.emit = function (name, data, ...args) {
  if (
    name === 'warning' &&
    typeof data === 'object' &&
    data.name === 'DeprecationWarning'&&
    data.message.includes('punycode')

  ) {
    return false;
  }
  return originalEmit.call(process, name, data, ...args);
};

// Mock react-icons
jest.mock('react-icons/fa', () => ({
  FaHotel: () => <div data-testid="FaHotel" />,
  FaPlane: () => <div data-testid="FaPlane" />,
  FaCar: () => <div data-testid="FaCar" />,
  FaTrain: () => <div data-testid="FaTrain" />,
  FaBus: () => <div data-testid="FaBus" />,
  FaUtensils: () => <div data-testid="FaUtensils" />,
}));

// Mock react-router-dom Link
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
}));
