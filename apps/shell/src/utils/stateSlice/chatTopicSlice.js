import {createSlice} from '@reduxjs/toolkit'

const chatTopicSlice = createSlice({
    name: 'chatTopics',
    initialState: {
        chatTopiceValue:'chat',
    },
    reducers: {
        setChatTopicValue(state, action) {
            state.chatTopiceValue = action.payload
        },
    },
})

export const {setChatTopicValue} = chatTopicSlice.actions

export default chatTopicSlice.reducer