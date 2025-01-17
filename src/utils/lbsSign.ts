import { config } from '@src/main';
const crypto = require('crypto');
const url = require('url');
export const generateApiRequestUrl = (fullUrl, params): string => {
    const TxKey: string = config.TxKey!;
    const TXSecretKey: string = config.TXSecretKey!;

    const parsedUrl = url.parse(fullUrl);
    const path = parsedUrl.pathname;

    // 1. 对参数进行排序
    const sortedKeys = Object.keys(params).sort();
    const sortedParams = sortedKeys.map(key => `${key}=${params[key]}`).join('&');

    // 2. 拼接请求路径、请求参数和SK
    const stringToSign = `${path}?${sortedParams}${TXSecretKey}`;

    // 3. 计算MD5签名
    const sig = crypto.createHash('md5').update(stringToSign).digest('hex');

    // 4. 生成最终请求URL
    const finalUrl = `${parsedUrl.protocol}//${parsedUrl.host}${path}?${sortedParams}&sig=${sig}`;
    return finalUrl;
  };
