// --- 定义常量 ---

// 您的后端API的基础URL
const API_BASE_URL = 'https://9525.ip-ddns.com/api'; 

// 这是我们与后端约定的“秘密暗号”，用于识别来自我们自己App的请求。
// 【重要】: 这个值必须与您所有PHP后端文件中设置的 $app_secret_value 完全一致！
const APP_SECRET_KEY = 'Xla2M666amiV9QehKwOTDJb8uvkozemr';


/**
 * 一个封装了 fetch 的通用 API 请求函数。
 * 以后项目中所有的后端请求都应该通过这个函数来发起。
 *
 * @param {string} endpoint - API的端点，例如 '/register.php' 或 '/login.php'
 * @param {object} options - 标准的 fetch API 配置对象，例如 method, body
 * @returns {Promise<any>} 返回一个Promise，成功时会解析为后端返回的JSON数据。
 */
export const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-App-Secret': APP_SECRET_KEY,
        ...options.headers,
    };

    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });

        // 获取响应的原始文本
        const responseText = await response.text();

        // 检查响应是否成功
        if (!response.ok) {
            let errorData;
            try {
                // 尝试解析文本为JSON
                errorData = JSON.parse(responseText);
                // 如果解析成功，抛出后端提供的错误信息
                throw new Error(errorData.message || '发生未知错误');
            } catch (e) {
                // 如果解析失败，说明后端返回的不是JSON，很可能是HTML错误页面
                // 这时，我们就抛出服务器返回的原始文本，这对于调试至关重要
                console.error("服务器返回了非JSON错误:", responseText);
                throw new Error(`服务器错误 (HTTP ${response.status}): ${response.statusText}`);
            }
        }
        
        // 成功时，如果响应文本为空，则返回null
        if (!responseText) {
            return null;
        }

        // 成功时，解析并返回JSON数据
        return JSON.parse(responseText);

    } catch (error) {
        // 捕获所有错误（网络、解析、服务器错误等）
        console.error(`API请求 '${endpoint}' 失败:`, error);
        // 继续向上抛出，以便UI层可以处理
        throw error;
    }
};