import {configureStore} from '@reduxjs/toolkit'
import chatHistoryReducer from '../stateSlice/chatHistorySlice'

export default configureStore({
    reducer:{
        chatHistory: chatHistoryReducer,
    }
})