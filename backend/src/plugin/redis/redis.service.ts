import { Injectable } from '@nestjs/common';
import { ClientContext, Result } from 'ioredis';
import { Redis } from '@upstash/redis'

import { ObjectType } from '@src/types';
import { isObject } from '@src/utils';

@Injectable()
export class RedisService {
  public redisClient!: Redis;

  // 模块加载的时候就缓存创建redis句柄
  onModuleInit() {
    if (!this.redisClient) {
      this.getClient();
    }
  }
  private getClient() {
    this.redisClient = new Redis({
      url: 'https://vocal-hyena-57342.upstash.io',
      token: 'Ad_-AAIjcDE1YjZiM2QyNTY2ODQ0NmI0YTFmMTFiZDE1M2Y3M2MwOHAxMA',
    })
  }
  // private getClient() {
  //   this.redisClient = new Redis({
  //     port: 6379, // Redis port
  //     host: 'vocal-hyena-57342.upstash.io', // redisDb Redis host
  //     username: '', // needs Redis >= 6
  //     password: 'Ad_-AAIjcDE1YjZiM2QyNTY2ODQ0NmI0YTFmMTFiZDE1M2Y3M2MwOHAxMA', // 密码
  //     db: 0, // redis是几个数据库的，使用第一个

  //   });
  // }
  // private getClient() {
  //   this.redisClient = new Redis({
  //     port: 6388, // Redis port
  //     host: '192.168.2.221', // redisDb Redis host
  //     username: '', // needs Redis >= 6
  //     password: '12300114', // 密码
  //     db: 0, // redis是几个数据库的，使用第一个
  //   });
  // }
  /**
   * @Author: 水痕
   * @Date: 2022-08-11 11:25:54
   * @LastEditors: 水痕
   * @Description: 设置值到redis中
   * @param {string} key
   * @param {any} value
   * @param {number} second 过期时间秒
   * @return {*}
   */
  public async set(key: string, value: unknown): Promise<Result<'OK', ClientContext>>;
  public async set(
    key: string,
    value: unknown,
    second: number
  ): Promise<Result<'OK', ClientContext>>;
  public async set(key: string, value: any, second?: number): Promise<Result<'OK', ClientContext>> {
    value = isObject(value) ? JSON.stringify(value) : value;
    if (!second) {
      return await this.redisClient.set(key, value);
    } else {
      // return await this.redisClient.set(key, value, 'EX', second);
      return await this.redisClient.set(key, value, { ex: second });

    }
  }

  /**
   * @Author: 水痕
   * @Date: 2022-08-11 11:38:29
   * @LastEditors: 水痕
   * @Description: 设置自动 +1
   * @param {string} key
   * @return {*}
   */
  public async incr(key: string): Promise<Result<number, ClientContext>> {
    return await this.redisClient.incr(key);
  }

  /**
   * @Author: 水痕
   * @Date: 2020-01-17 14:55:14
   * @LastEditors: wintsa
   * @Description: 获取获取redis缓存中的值
   * @param key {String}
   */
  public async get(key: string): Promise<Result<string | null, ClientContext>> {
    try {
      const data:any = await this.redisClient.get(key);
      if (data) {
        return isObject(data) ? data : JSON.parse(data);
      } else {
        return null;
      }
    } catch (e) {
      return await this.redisClient.get(key);
    }
  }

  /**
   * @Author: 水痕
   * @Date: 2022-08-11 11:41:57
   * @LastEditors: 水痕
   * @Description: 根据key删除redis缓存数据
   * @param {string} key
   * @return {*}
   */
  public async del(key: string): Promise<Result<number, ClientContext>> {
    return await this.redisClient.del(key);
  }

  /**
   * @Author: wintsa
   * @Date: 2024-01-31 11:32:53
   * @LastEditors: wintsa
   * @Description: 设置值
   * @return {*}
   */
  async hset(key: string, field: ObjectType): Promise<Result<number, ClientContext>> {
    return await this.redisClient.hset(key, field);
  }

  /**
   * @Author: 水痕
   * @Date: 2022-08-13 14:01:40
   * @LastEditors: 水痕
   * @Description: 获取单一个值
   * @param {string} key
   * @param {string} field
   * @return {*}
   */
  async hget(key: string, field: string): Promise<Result<string | null, ClientContext>> {
    return await this.redisClient.hget(key, field);
  }

  /**
   * @Author: 水痕
   * @Date: 2022-08-13 13:59:55
   * @LastEditors: 水痕
   * @Description: 获取全部的hget的
   * @param {string} key
   * @return {*}
   */
  async hgetall(key: string){
    return await this.redisClient.hgetall(key);
  }

  /**
   * @Author: 水痕
   * @Date: 2022-08-11 11:42:07
   * @LastEditors: 水痕
   * @Description: 清空redis的缓存
   * @return {*}
   */
  public async flushall(): Promise<Result<'OK', ClientContext>> {
    return await this.redisClient.flushall();
  }
  /**
   * @Author: wintsa
   * @Date: 2024-11-28 
   * @LastEditors: wintsa
   * @Description: redis like
   * @returns {*} 
   */
  // public async like(keyPattern: string): Promise<string[]> {
  //   try {
  //     const stream = this.redisClient.scanStream({
  //       match: keyPattern, // 使用通配符匹配
  //     });

  //     const keys: string[] = [];
  //     for await (const keyBatch of stream) {
  //       keys.push(...keyBatch);
  //     }

  //     const values = await Promise.all(keys.map((key) => this.redisClient.get(key)));
  //     return values.filter((value) => value !== null);
  //   } catch (error) {
  //     console.error('Error during LIKE query:', error);
  //     throw error;
  //   }
  // }
}
