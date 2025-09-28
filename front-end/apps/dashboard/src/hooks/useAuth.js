import { useDispatch, useSelector } from "react-redux";
import {
  selectShop,
  setShop as setCurrShop,
} from "../features/auth/authReducer";
import { isPersist, selectAuthToken } from "@ring/redux/authReducer";
import { setPersist as setCurrPersist } from "@ring/redux/authActions";
import { jwtDecode } from "jwt-decode";

const useAuth = () => {
  const token = useSelector(selectAuthToken);
  const shop = useSelector(selectShop);
  const persist = useSelector(isPersist);
  const dispatch = useDispatch();
  const setShop = (shop) => dispatch(setCurrShop(shop));
  const setPersist = (persist) => dispatch(setCurrPersist(persist));

  if (token) {
    //Extract data
    const decoded = jwtDecode(token);
    const { id, sub, roles, image, exp } = decoded;
    return {
      token,
      shop,
      id,
      username: sub,
      image,
      roles,
      exp,
      persist,
      setShop,
      setPersist,
    };
  }

  return {
    token,
    shop,
    id: null,
    username: null,
    image: null,
    roles: null,
    exp: null,
    persist,
    setShop,
    setPersist,
  };
};
export default useAuth;
