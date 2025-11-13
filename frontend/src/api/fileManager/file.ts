import { alovaInstance } from "..";

export const fileUpload: any = (data: FormData) => {
    const method = alovaInstance.Post('/upload/small', data);

    return method;
};

export const directoryInfo: any = (directoryId: string | null) => {
    const method = alovaInstance.Get(`/upload/getDirectoryFiles?directoryId=${directoryId}`,

        {
            transform(data: any) {
                console.log(data)
                data.sub = [...data.subDirs.map((e: any) => ({
                    ...e,
                    type: 'directory'
                })), ...data.files.map((e: any) => ({
                    ...e,
                    type: 'file'
                }))]
                return data;
            },

            //     cacheFor: {
            //         // 设置缓存模式为持久化模式,增删改查的时候需要触发钩子清空缓存
            //         mode: 'restore',
            //         // 缓存时间
            //         expire: Infinity
            //     },

        }
    );

    return method;
};
