import {
    getMyInfo as getMyInfoApi,
} from '@/api/userApi'

/**
 * 로그인 유저 정보 조회
 */
export const getMyInfo = async () => {
    const response = await getMyInfoApi()
    return response.data?.data
}
