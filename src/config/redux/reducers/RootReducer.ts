import { combineReducers } from 'redux';
import authSlice from '../Slices/authSlice';

const rootReducer = combineReducers({
  auth: authSlice,
});

export default rootReducer;
