// src/__mocks__/firebase/auth.js

const getAuth = jest.fn(() => ({}));
const createUserWithEmailAndPassword = jest.fn();

module.exports = {
  getAuth,
  createUserWithEmailAndPassword,
};
