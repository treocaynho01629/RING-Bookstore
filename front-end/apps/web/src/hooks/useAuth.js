import { useDispatch, useSelector } from "react-redux";
import { isPersist, selectAuthToken } from "@ring/redux/authReducer";
import { setPersist as setCurrPersist } from "@ring/redux/authActions";
import { jwtDecode } from "jwt-decode";

const useAuth = () => {
  const token = useSelector(selectAuthToken);
  const persist = useSelector(isPersist);
  const dispatch = useDispatch();
  const setPersist = (persist) => dispatch(setCurrPersist(persist));

  if (token) {
    //Extract data
    const decoded = jwtDecode(token);
    const { id, sub, roles, image, exp } = decoded;
    return {
      token,
      id,
      username: sub,
      image,
      roles,
      exp,
      persist,
      setPersist,
    };
  }

  return {
    token,
    id: null,
    username: null,
    image: null,
    roles: null,
    exp: null,
    persist,
    setPersist,
  };
};
export default useAuth;
