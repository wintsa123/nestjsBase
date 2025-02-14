export const hashPassword = async (password:string) => {
    const encoder = new TextEncoder(); // 将字符串编码为 Uint8Array
    const data = encoder.encode(password); // 编码密码
    const hashBuffer = await crypto.subtle.digest('SHA-256', data); // 计算哈希值
  
    // 将 ArrayBuffer 转换为十六进制字符串
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    
    return hashHex; // 返回十六进制哈希值
  };