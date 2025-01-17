import { Injectable } from '@nestjs/common';
import { config } from '@src/main';
import { generateApiRequestUrl } from '@src/utils/lbsSign';
import axios from 'axios';

export interface IPAddress {
  /**国家 */
  nation: string;
  /**省份 */
  province: string;
  /**城市 */
  city: string;
  /**地区 */
  district: string;
  /**行政区划代码 */
  adcode: string;
}
@Injectable()
export class LngLat {
  // constructor(private readonly configService: ConfigService) {}

  public async getLngLat(address: string) {
    // TODO 这里使用const configService = new ConfigService()获取不到数据，只能这样获取环境变量
    // 主要是直接在实体类中使用要使用new的方式
    const lbsKey: string = config.TxKey!;
    const url = `https://apis.map.qq.com/ws/geocoder/v1/?address=`;
    const link = generateApiRequestUrl(url, { address: address, key: lbsKey })
    try {
      const { data } = await axios.get(link);
      if (data.status === 0) {
        const {
          result: { location },
        } = data || {};
        return {
         lng: location.lng,
         lat: location.lat,
        };
      } else {
        console.log(data)
       throw data.message
      }
    } catch (error) {
      console.log(error)

      throw error

    }

  }
}
