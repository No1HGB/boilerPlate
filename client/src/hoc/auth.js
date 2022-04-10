//HOC = Higher Order Component
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { auth } from "../_actions/user_action";

export default function (SpecificComponent, option, adminRoute = null) {
  //option => null: 아무나 출입이 가능한 페이지, true: 로그인한 유저만 출입이 가능한 페이지, false:로그인한 유저는 출입이 불가능한 페이지
  function AuthenticationCheck() {
    //backend에 request를 날려서 현재 유저의 상태를 가져온다.
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
      dispatch(auth()).then((response) => {
        console.log(response);

        if (!response.payload.isAuth) {
          //로그인 하지 않은 사람
          if (option) {
            navigate("/login");
          }
        } else {
          //로그인 한 사람
          if (adminRoute && !response.payload.isAdmin) {
            navigate("/");
          } else {
            if (option === false) navigate("/");
          }
        }
      });
    }, []);

    return <SpecificComponent />;
  }
  return AuthenticationCheck;
}
