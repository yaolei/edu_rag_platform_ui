import {configureStore} from '@reduxjs/toolkit'
import chatHistoryReducer from '../stateSlice/chatHistorySlice'
import chatTopicsReducer from '../stateSlice/chatTopicSlice'

export default configureStore({
    reducer:{
        chatHistory: chatHistoryReducer,
        chatTopics: chatTopicsReducer
    }
})