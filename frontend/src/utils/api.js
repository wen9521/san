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
    // 1. 构造完整的请求URL
    const url = `${API_BASE_URL}${endpoint}`;

    // 2. 准备请求头 (Headers)
    // 这是这个文件的核心功能：为每一个请求自动添加必要的头部信息。
    const headers = {
        'Content-Type': 'application/json', // 告诉后端我们发送的是JSON格式的数据
        'Accept': 'application/json',       // 告诉后端我们期望接收JSON格式的响应
        // 【关键】: 在这里统一、自动地为每个请求加上我们的“秘密暗号”
        'X-App-Secret': APP_SECRET_KEY,
        // ...options.headers 允许我们在调用时传入额外的、临时的header
        ...options.headers,
    };

    try {
        // 3. 发起网络请求
        const response = await fetch(url, {
            ...options, // 合并传入的配置，如 method, body
            headers,   // 使用我们构造好的、带有“暗号”的headers
        });

        // 4. 处理服务器响应
        if (!response.ok) {
            // 如果HTTP状态码不是2xx (例如 400, 403, 404, 500), 说明请求出了问题
            let errorData;
            try {
                // 尝试解析后端返回的JSON错误信息
                errorData = await response.json();
            } catch (e) {
                // 如果后端返回的不是JSON (例如一个HTML错误页面), 就使用HTTP状态文本
                throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
            }
            // 将后端返回的友好错误信息 (如 "用户名已存在") 抛出
            throw new Error(errorData.message || '发生未知错误');
        }

        // 5. 解析并返回成功的JSON数据
        // 如果后端没有返回任何内容 (例如 204 No Content), 则返回null
        const responseText = await response.text();
        if (!responseText) {
            return null;
        }
        return JSON.parse(responseText);

    } catch (error) {
        // 6. 捕获所有可能的错误
        // 这包括网络中断、DNS解析失败，以及上面我们手动抛出的所有错误
        console.error(`API请求失败: ${endpoint}`, error);

        // 将错误继续向上抛出，这样调用这个函数的组件 (如LoginPage) 就可以捕获它，
        // 并在UI上向用户显示一个友好的错误提示。
        throw error;
    }
};