import axios from "axios";
import { LOGIN_USER, REGISTER_USER, AUTH_USER } from "./types";
//axios를 이용해 로그인 정보를 서버에 보내주기+서버에서 받은 data를 request에 저장
export function loginUser(dataToSubmit) {
  const request = axios
    .post("/api/users/login", dataToSubmit)
    .then((response) => response.data);
  return {
    //action
    type: LOGIN_USER,
    payload: request,
  };
}

export function registerUser(dataToSubmit) {
  const request = axios
    .post("/api/users/register", dataToSubmit)
    .then((response) => response.data);
  return {
    //action
    type: REGISTER_USER,
    payload: request,
  };
}

export function auth() {
  const request = axios
    .get("/api/users/auth")
    .then((response) => response.data);
  return {
    //action
    type: AUTH_USER,
    payload: request,
  };
}
