// 我们约定的后端域名和秘密暗号
const API_BASE_URL = 'https://9525.ip-ddns.com/api';
const APP_SECRET_KEY = 'Xla2M666amiV9QehKwOTDJb8uvkozemr'; // 确保这个和PHP里的一样

/**
 * 一个封装了 fetch 的通用 API 请求函数
 * @param {string} endpoint - API的端点，例如 '/register.php'
 * @param {object} options - fetch 的配置对象，例如 method, body
 * @returns {Promise<any>} 解析后的 JSON 数据
 */
export const apiRequest = async (endpoint, options = {}) => {
    // 构造完整的URL
    const url = `${API_BASE_URL}${endpoint}`;

    // 准备默认的headers
    const headers = {
        'Content-Type': 'application/json',
        // 【核心】: 在这里统一添加我们的秘密暗号
        'X-App-Secret': APP_SECRET_KEY,
        // 如果有其他的header，也在这里合并
        ...options.headers,
    };

    try {
        const response = await fetch(url, {
            ...options, // 传入的配置，如 method, body
            headers,   // 使用我们构造好的headers
        });

        if (!response.ok) {
            // 如果服务器返回了错误状态码 (如 400, 403, 500)
            // 我们尝试解析错误信息，然后抛出一个更具体的错误
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                // 如果响应体不是JSON，就用状态文本
                throw new Error(response.statusText || 'Network request failed');
            }
            // 将后端返回的message作为错误信息抛出
            throw new Error(errorData.message || 'An unknown error occurred');
        }

        // 对于成功的请求，解析并返回JSON数据
        return response.json();

    } catch (error) {
        // 捕获网络层面的错误 (如断网) 或上面我们自己抛出的错误
        console.error(`API request to ${endpoint} failed:`, error);
        // 将错误继续向上抛出，以便UI层可以捕获并显示给用户
        throw error;
    }
};
