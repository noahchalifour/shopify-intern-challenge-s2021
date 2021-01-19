import { SET_TOKENS } from "../actionTypes";

const initialState = {
  tokens: {
      accessToken: '',
      refreshToken: ''
  }
};

export default function authReducer(state = initialState, action: any) {
  switch (action.type) {
    case SET_TOKENS: {
      localStorage.setItem('accessToken', action.payload.accessToken);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
      return {
        ...state,
        tokens: action.payload
      };
    }
    default:
      return state;
  }
}