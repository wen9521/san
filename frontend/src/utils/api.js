// src/utils/api.js

// This can be adjusted if your backend runs on a different port during development
const API_BASE_URL = '/api'; 

/**
 * A centralized handler for fetch responses.
 * It checks for network errors and parses the JSON response.
 * @param {Response} response The raw response from a fetch call.
 * @returns {Promise<any>} The parsed JSON data.
 * @throws {Error} If the network response was not 'ok'.
 */
const handleResponse = async (response) => {
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`网络响应错误: ${response.statusText} (${response.status}) - ${errorText}`);
    }
    try {
        return await response.json();
    } catch (e) {
        // Handle cases where the response is not valid JSON
        throw new Error("收到了无效的数据格式。");
    }
};

/**
 * Logs a user in by calling the login.php script.
 * @param {string} username
 * @param {string} password
 * @returns {Promise<Object>} The user data from the backend.
 */
export const login = (username, password) => {
    return fetch(`${API_BASE_URL}/login.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    }).then(handleResponse);
};

/**
 * Registers a new user by calling the register.php script.
 * @param {string} username
 * @param {string} password
 * @returns {Promise<any>} The success response from the backend.
 */
export const register = (username, password) => {
    return fetch(`${API_BASE_URL}/register.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    }).then(handleResponse);
};

// Example of how other API calls can be added
export const updateUserPoints = (userId, points) => {
    return fetch(`${API_BASE_URL}/points.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, points: points }),
    }).then(handleResponse);
};
