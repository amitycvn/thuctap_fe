import { combineReducers } from "redux";
import userTestReduce from "./UserTestReduce";

const rootReducer = combineReducers({
  userTest: userTestReduce,
});

export default rootReducer;
