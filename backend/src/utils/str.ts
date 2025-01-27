
import crypto from 'crypto';
import isStream from "is-stream"
import axios from "axios";

interface Obj {
  [propName: string]: any
}
/**
 * @Author: 水痕
 * @Date: 2023-10-07 18:53:32
 * @LastEditors: 水痕
 * @Description: 随机生成指定范围内的随机数
 * @param {number} min
 * @param {number} max
 * @return {*}
 */
export const getRandomNum = (min: number, max: number): number => {
  return Math.floor(min + Math.random() * (max - min));
};

/**
 * @Author: 水痕
 * @Date: 2023-10-07 18:56:03
 * @LastEditors: 水痕
 * @Description: 生成随机长度的字符串
 * @param {number} length
 * @return {*}
 */
export const randomString = (length: number): string => {
  return crypto.randomBytes(length).toString('hex').slice(0, length);
};

/**
 * @Author: 水痕
 * @Date: 2023-10-07 19:06:42
 * @LastEditors: 水痕
 * @Description: 字符串md5加密
 * @param {string} str
 * @return {*}
 */
export const strToMd5 = (str: string): string => {
  const md5 = crypto.createHash('md5');
  return md5.update(str).digest('hex');
};

/**
 * @Author: 水痕
 * @Date: 2023-10-07 19:06:42
 * @LastEditors: 水痕
 * @Description: hash加密
 * @param {string} str
 * @return {*}
 */
export const generateCacheKey = (data) => {
  // Use SHA-256 hash function to hash the request body
  const hash = crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
  // Truncate or modify the hash if necessary to fit within Redis key length limit
  return hash;
}

/**
   * @Author: 水痕
   * @Date: 2022-08-12 22:23:43
   * @LastEditors: wintsa
   * @Description: 生成redis的key
   * @param {string} method 请求方式
   * @param {string} url url地址
   * @param {string} identity 身份
   * @return {*}
   */

export const redisCacheKey = (method: string, url: string, body?: any): string => {
  console.log(method, 'method')


  if (body !== undefined && body !== null) {
    const hash = generateCacheKey(body)
    if (method == 'GET') {
      return `${method}:${url}:${hash}`;

    } else {
      return `${method}:${hash}`;

    }
  } else {
    return `${method}:${url}`;

  }
}
export const getImageAsBase64 = async (file) => {
  try {
    const imageBase64 = Buffer.from(file, 'binary').toString('base64');
    return imageBase64;
  } catch (error) {
    console.log('Error fetching image:', error);
    throw error;
  }
}
/**
 * @Author: wintsa
 * @Date: 2024-06-05 14:06:14
 * @LastEditors: wintsa
 * @Description: 页面字体解码中文
 * @return {*}
 */
export const decodeHtmlEntities = (str) => {
  return str.replace(/&#x([A-Fa-f0-9]+);/g, (_match, p1) => {
    return String.fromCodePoint(parseInt(p1, 16));
  });
}
/**
 * @Author: wintsa
 * @Date: 2024-07-17 09:44:39
 * @LastEditors: wintsa
 * @Description: 对象key改为小写
 * @return {*}
 */
export const transformedResult = (data) => data.map(row => {
  const newRow = {};
  for (let key in row) {
    if (row.hasOwnProperty(key)) {
      newRow[key.toLowerCase()] = row[key] === null ? '' : row[key];

    }
  }
  return newRow;
});
/**
 * @Author: wintsa
 * @Date: 2025-01-27 
 * @LastEditors: wintsa
 * @Description: bBigInt转换
 * @returns {*} 
 */
export const BigIntreplacer=(obj) => {
  return JSON.parse(JSON.stringify(
    obj,
    (_key, value) => (typeof value === 'bigint' ? value.toString() : value) // return everything else unchanged
  ))
}
