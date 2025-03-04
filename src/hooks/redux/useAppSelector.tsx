import { useSelector } from "react-redux";
import { RootState } from "../../config/redux/store";

export default function useAppSelector() {
  return useSelector((state: RootState) => state);
}
