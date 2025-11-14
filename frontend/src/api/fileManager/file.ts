import { alovaInstance } from "..";

export const fileUpload: any = (data: FormData) => {
    const method = alovaInstance.Post('/upload/small', data);

    return method;
};

export const directoryInfo: any = (directoryId: string | null) => {
    const method = alovaInstance.Get(`/upload/getDirectoryFiles?directoryId=${directoryId}`,

        {
            transform(data: any) {
                data.sub = [...data.subDirs.map((e: any) => ({
                    ...e,
                    type: 'directory'
                })), ...data.files.map((e: any) => ({
                    ...e,
                    type: 'file'
                }))]
                return data;
            },
        hitSource: ['newDirectory','deleteDirectory']

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

export const newDirectory: any = (data: {directoryId: string | null, directoryName: string}) => {
    const method = alovaInstance.Post('/upload/addDirectory', data,{name:'newDirectory'});

    return method;
};
export const deleteDirectory: any = (directoryId:string) => {
    const method = alovaInstance.Delete(`/upload/deleteDirectory`, {
       directoryId
    },{name:'deleteDirectory'});

    return method;
};
