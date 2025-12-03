import {createSlice} from '@reduxjs/toolkit'

const layoutSlice = createSlice({
    name: 'layout',
    initialState: {
        open:true,
        sidebarOpen: true,
    },
    reducers: {
        setOpen(state, action) {
            state.open = action.payload
        },
        setSidebarOpen(state, action) {
            state.sessiondIds = [...state.sessiondIds, action.payload.sessiondIds]
        },
    },
})

export const {setOpen, setSidebarOpen} = layoutSlice.actions

export default layoutSlice.reducer