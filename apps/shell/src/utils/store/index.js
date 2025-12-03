import {configureStore} from '@reduxjs/toolkit'
import LayoutSlice from '../stateSlice/layoutSlice'

export default configureStore({
    reducer:{
        layoutParamer: LayoutSlice,
    }
})