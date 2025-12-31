import { useDispatch, useSelector } from "react-redux";
import { isPersist, selectAuthToken } from "@ring/redux/authReducer";
import { setPersist as setCurrPersist } from "@ring/redux/authActions";
import { jwtDecode } from "jwt-decode";
import { UserRole } from "@ring/shared/models/userRole";

const useAuth = () => {
  const token = useSelector(selectAuthToken);
  const persist = useSelector(isPersist);
  const dispatch = useDispatch();
  const setPersist = (persist) => dispatch(setCurrPersist(persist));

  if (token) {
    // Extract data
    const decoded = jwtDecode(token);
    const { id, sub, roles, image, exp } = decoded;
    const roleIndexes = roles?.map((r) => Object.keys(UserRole).indexOf(r)) || [0];
    const role = UserRole[Object.keys(UserRole)[Math.max(...roleIndexes)]];

    return {
      token,
      id,
      username: sub,
      image,
      roles,
      role,
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
    role: null,
    exp: null,
    persist,
    setPersist,
  };
};
export default useAuth;
