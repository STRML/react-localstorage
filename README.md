React-LocalStorage
==================

Simply synchronize a component's state with `localStorage`, when available.

Usage
-----

A simple component:

```javascript
const React = require('react');
const withLocalStorage = require('react-localstorage');

// This is all you need to do
class TestComponent extends React.Component {
  static displayName = 'TestComponent';

  state = {counter: 0};

  onClick() {
    this.setState({counter: this.state.counter + 1});
  }

  render() {
    return <span onClick={this.onClick}>{this.state.counter}</span>;
  }
}

export default withLocalStorage(TestComponent)
```

If you need to save the state manually, call the component's `saveStateToLocalStorage()` method.
See https://github.com/STRML/react-localstorage/pull/17 for context.

Options
-------

The key that state is serialized to under `localStorage` is chosen with the following code:

```javascript
function getLocalStorageKey(component) {
  if (component.getLocalStorageKey) return component.getLocalStorageKey();
  if (component.props.localStorageKey === false) return false;
  if (typeof component.props.localStorageKey === 'function') return component.props.localStorageKey.call(component);
  return component.props.localStorageKey || getDisplayName(component) || 'react-localstorage';
}
```

If you are synchronizing multiple components with the same `displayName` to localStorage,
you must set a unique `localStorageKey` prop on the component. You may set a function as well.

Alternatively, you may define the method `getLocalStorageKey` on the component's prototype.
This gives you the freedom to choose keys depending on the component's props or state.

To disable usage of localStorage entirely, pass `false` or a function that evaluates to `false`.

Filtering
---------
If you only want to save parts of state in localStorage, set `stateFilterKeys` to an array of strings corresponding to the state keys you want to save.

```javascript
getDefaultProps: function() {
  return {
    stateFilterKeys: ['one', 'two']
  };
}
```
You can do this by setting a `stateFilterKeys` prop or define the method `getStateFilterKeys` on the component's prototype.

```javascript
getStateFilterKeys: function() {
  return ['one', 'two'];
}
```


Server Rendering
----------------

`withLocalStorage` will call `setState` on `componentDidMount`, so it will not break server rendering
checksums. This is new as of `0.2.0`.


Tests
------

We use `jest` as the test runner. To run the test, simply `yarn install` all the dependencies and run `yarn test`.
