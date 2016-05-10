React-LocalStorage
==================

Simply synchronize a component's state with `localStorage`, when available.

Usage
-----

A simple component:

```js
var React = require('react');
var LocalStorageMixin = require('react-localstorage');

var TestComponent = module.exports = React.createClass({
  displayName: 'TestComponent',
  // This is all you need to do
  mixins: [LocalStorageMixin],

  getInitialState: function() {
    return {counter: 0};
  },

  onClick: function() {
    this.setState({counter: this.state.counter + 1});
  },

  render: function() {
    return (
      <span onClick={this.onClick}>{this.state.counter}</span>
    );
  }
});
```

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

`LocalStorageMixin` will call `setState` on `componentDidMount`, so it will not break server rendering
checksums. This is new as of `0.2.0`.


Tests
------

We use `karma` as the test runner. To run the test, simply `npm install` all the dependencies and run:

```bash
./node_modules/karma/bin/karma start
```
