import {
    signup as signupApi,
    getUsers as getUsersApi,
    getMyInfo as getMyInfoApi,
    getSocialLinkUrl as getSocialLinkUrlApi,
} from '@/api/userApi'

/**
 * 회원가입
 * 
 * @param {{
 *  username: string,
 *  password: string,
 *  email: string,
 *  role: 'ROLE_USER' | 'ROLE_ADMIN'
 * }}
 */
export const signup = async (payload) => {
    // 유효성 검사
    if (!payload.username || !payload.password || !payload.email) {
        throw new Error('Required fields are missing')
    }

    // HTTP 요청
    await signupApi(payload)
}

/**
 * 회원 목록 조회
 * 
 * @param {{
 *  username: string,
 *  role: 'ROLE_USER' | 'ROLE_ADMIN'
 *  email: string,
 *  page: number,
 *  size: number
 * }}
 */
export const getUsers = async (payload) => {
    return await getUsersApi(payload)
}

/**
 * 로그인 유저 정보 조회
 */
export const getMyInfo = async () => {
    const response = await getMyInfoApi()
    return response.data?.data
}

/**
 * 소셜 계정 연동 OAuth URL 반환
 *
 * @param {'GOOGLE'} provider
 */
export const getSocialLinkUrl = async (provider) => {
    if (!provider) {
        throw new Error('Provider is required')
    }

    const response = await getSocialLinkUrlApi(provider)
     return response.data?.data
}
