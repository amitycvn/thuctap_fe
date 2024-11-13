const initialActions = {};

export const getUserTest =
  (params = initialActions) =>
  async (dispatch) => {
    try {
      dispatch({
        type: "GET_USER_TEST",
        payload: {
          params,
        },
      });
    } catch (error) {
      console.error("Error: ", error);
    }
  };
