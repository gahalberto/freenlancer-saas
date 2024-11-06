import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit'
import { useSelector, TypedUseSelectorHook } from 'react-redux'

type state = {
  sidebarShow: boolean
  sidebarUnfoldable: boolean
  asideShow: boolean
  theme: string
}

const initialState: state = {
  sidebarShow: true,
  sidebarUnfoldable: false,
  asideShow: false,
  theme: 'default',
}

type args = { type?: string; [key: string]: any }

const changeState = (state = initialState, { type, ...rest }: args) => {
  switch (type) {
    case 'set':
      return { ...state, ...rest }
    default:
      return state
  }
}

export function makeStore() {
  return configureStore({
    reducer: changeState,
  })
}

const store = makeStore()

export type AppState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  Action<string>
>

export default store

// https://react-redux.js.org/using-react-redux/static-typing#typing-the-useselector-hook
export const useTypedSelector: TypedUseSelectorHook<state> = useSelector
