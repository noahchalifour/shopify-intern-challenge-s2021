import { SET_TOKENS } from './actionTypes';

export const setTokens = (accessToken: string, refreshToken: string) => ({
    type: SET_TOKENS,
    payload: {
        accessToken,
        refreshToken
    }
})