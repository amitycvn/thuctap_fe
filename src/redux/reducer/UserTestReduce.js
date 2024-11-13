const initialState = {
  userTest: {},
};

const userTestReduce = (state = initialState, action) => {
  switch (action.type) {
    case "GET_USER_TEST":
      return {
        ...state,
        userTest: action.payload.params,
      };
    default:
      return state;
  }
};

export default userTestReduce;
