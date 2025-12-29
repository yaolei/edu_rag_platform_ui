import {createSlice} from '@reduxjs/toolkit'

const chatHistorySlice = createSlice({
    name: 'chatHistory',
    initialState: {
        hasHistroy:false,
    },
    reducers: {
        hasHistroy(state, action) {
            state.hasHistroy = action.payload
        },
    },
})

export const {hasHistroy} = chatHistorySlice.actions

export default chatHistorySlice.reducer