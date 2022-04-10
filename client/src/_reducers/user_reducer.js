import { LOGIN_USER, REGISTER_USER, AUTH_USER } from "../_actions/types";

//reducer는 이전의 state를 받아서 action 후의 state를 보내준다(return)
// eslint-disable-next-line
export default function (state = {}, action) {
  switch (action.type) {
    case LOGIN_USER:
      return { ...state, loginSuccess: action.payload };
    case REGISTER_USER:
      return { ...state, register: action.payload };
    case AUTH_USER:
      return { ...state, userData: action.payload };
    default:
      return state;
  }
}
