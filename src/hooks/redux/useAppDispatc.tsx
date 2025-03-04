import { useDispatch } from "react-redux";
import { AppDispatch } from "../../config/redux/store";

export default function UseAppDispatch() {
  return useDispatch<AppDispatch>();
}
