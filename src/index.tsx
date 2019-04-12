import React from 'react'
import ReactDOM from 'react-dom';
import Switch from './switch';

enum Type {
  TOGGLE,
  ON,
  OFF,
}

type State = { on: boolean }

type Action =
  | { type: Type.TOGGLE }
  | { type: Type.ON }
  | { type: Type.OFF}

type ActionWithChanges = Action & { changes: State }

const localReducer: ReducerFunction<Action> = (state, action): State => {
  switch (action.type) {
    case Type.TOGGLE:
      return { ...state, on: !state.on }
    case Type.ON:
      return { ...state, on: true }
    case Type.OFF:
      return { ...state, on: false }
  }
}

type ReducerFunction<T extends Action = Action> = React.Reducer<State, T>
type UseToggle = (
  reducer?: ReducerFunction<ActionWithChanges>
) => {
  on: boolean
  toggle: () => void
  setOn: () => void
  setOff: () => void
}

const useToggle: UseToggle = reducer => {
  const [{ on }, dispatch] = React.useReducer<ReducerFunction>(
    (state, action) => {
      const changes = localReducer(state, action)

      return reducer ? reducer(state, { ...action, changes }) : changes
    },
    { on: false }
  )

  const toggle = () => dispatch({ type: Type.TOGGLE })
  const setOn = () => dispatch({ type: Type.ON })
  const setOff = () => dispatch({ type: Type.OFF})

  return { on, toggle, setOn, setOff }
}

function Toggle() {
  const [clicksSinceReset, setClicksSinceReset] = React.useState(0)
  const tooManyClicks = clicksSinceReset >= 4

  const {on, toggle, setOn, setOff} = useToggle(
    (currentState, action) => {
      if (tooManyClicks && action.type === Type.TOGGLE) {
        // other changes are fine, but on needs to be unchanged
        return {...action.changes, on: currentState.on}
      } else {
        // the changes are fine
        return action.changes
      }
    },
  )

  return (
    <div>
      <button onClick={setOff}>Switch Off</button>
      <button onClick={setOn}>Switch On</button>
      <Switch
        onClick={() => {
          toggle()
          setClicksSinceReset(count => count + 1)
        }}
        on={on}
      />
      {tooManyClicks ? (
        <button onClick={() => setClicksSinceReset(0)}>Reset</button>
      ) : null}
    </div>
  )
}

const App: React.StatelessComponent = () => {
return <Toggle />
}

ReactDOM.render(<App />, document.getElementById('root'))
