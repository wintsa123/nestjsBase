import { Injectable, Logger, Body } from '@nestjs/common';
import { RedisService } from '@src/plugin/redis/redis.service';
import axios from 'axios';
import { promisify } from 'node:util';
import { pipeline } from 'node:stream';
import { getRandomNum, getUrlQuery } from '@src/utils';
import { trim, compact, concat, uniqBy, groupBy, differenceBy, chunk, forEach, flatMap, uniq, map } from 'lodash';
import moment from 'moment';
import { Tendering } from '@src/corn/entities/Tendering.entity';
import { In, MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import path from 'path';
import { spiderdata } from './entities/spiderData.entity';
import 'moment/locale/zh-cn'; // 如果需要中文支持，请导入中文语言环境
import iconv from 'iconv-lite';
import https from 'https';
import { XMLParser, XMLBuilder, XMLValidator } from "fast-xml-parser"
import QRCode from 'qrcode'



@Injectable()
export class TmpRedisService {
    private readonly logger = new Logger(TmpRedisService.name);
    constructor(
        private readonly redisService: RedisService,
    ) {

    }

    /**
     * @Author: wintsa
     * @Date: 2023-11-24 10:15:57
     * @LastEditors: wintsa
     * @Description: 清除所有缓存
     * @return {*}
     */
    async cleanAll() {

        this.redisService.flushall()
    }
   
    /**
     * @Author: wintsa
     * @Date: 2024-11-28 
     * @LastEditors: wintsa
     * @Description: 生成二维码的img data
     * @returns {*} 
     */
    async qrcode(data) {
        try {
            const url = await new Promise((resolve, reject) => {
                QRCode.toDataURL(data.url, (err, url) => {
                    if (err) reject(err);
                    resolve(url);
                });
            });
            console.log('二维码的 Data URL:', url);
            return url;
        } catch (err) {
            console.error('生成二维码失败:', err);
            throw err
        }
    }
    /**
     * @Author: wintsa
     * @Date: 2024-11-28 
     * @LastEditors: wintsa
     * @Description: redis like
     * @returns {*} 
     */
    async redisLike(key) {
        return await this.redisService.like(key)
    }
}