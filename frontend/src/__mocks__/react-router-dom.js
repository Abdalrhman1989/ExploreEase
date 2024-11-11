// src/__mocks__/react-router-dom.js

const reactRouterDom = jest.requireActual('react-router-dom');

reactRouterDom.useNavigate = jest.fn();

module.exports = reactRouterDom;
