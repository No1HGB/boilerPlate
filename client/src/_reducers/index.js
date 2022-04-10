//combineReducer로 여러 개의 reducer를 합쳐주는 것
import { combineReducers } from "redux";
import user from "./user_reducer";

const rootReducer = combineReducers({
  user,
});

export default rootReducer;
