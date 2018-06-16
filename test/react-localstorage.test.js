const React = require('react');
const TestUtil = require('react-dom/test-utils');
const withLocalStorage = require('../react-localstorage');
const assert = require('assert');

const ls = global.localStorage;
describe("suite", function() {
  beforeEach(function(){
    ls.clear();
    // Cheap way to make the warn function throw so we can catch it easily
    console.warn = function() { throw new Error([].slice.call(arguments).join(' ')); };
  });

  class _ComponentUseDisplayName extends React.Component {
    static displayName = 'component1';
    render() {
      return <div>hello</div>;
    }
  }
  const ComponentUseDisplayName = withLocalStorage(_ComponentUseDisplayName)

  // Change in v1; we now do this on componentWillUnmount
  it("should not save after each setState", function(done) {
    const component = TestUtil.renderIntoDocument(<ComponentUseDisplayName />);
    component.setState({
      a: 'world'
    }, function() {
      assert.equal(
        null,
        ls.getItem('component1')
      );
      done();
    });
    component.componentWillUnmount();
  });

  it("should use displayName to store into localstorage", function() {
    const component = TestUtil.renderIntoDocument(<ComponentUseDisplayName />);
    component.setState({
      a: 'world'
    });
    component.componentWillUnmount();
    assert.equal(
      JSON.stringify({a: 'world'}),
      ls.getItem('component1')
    );
  });

  class _ComponentUseStorageKey extends React.Component {
    static displayName = 'component2';
    static defaultProps = {
      'localStorageKey': 'component-key'
    };
    render() {
      return <div>hello</div>;
    }
  }
  const ComponentUseStorageKey = withLocalStorage(_ComponentUseStorageKey)

  it("should use this.props.localStorageKey to store into localstorage", function() {
    const component = TestUtil.renderIntoDocument(<ComponentUseStorageKey />);
    component.setState({
      hello: 'moon'
    });
    component.componentWillUnmount();
    assert.equal(
      JSON.stringify({hello: 'moon'}),
      ls.getItem('component-key')
    );
  });

  class _ComponentUseMethod extends React.Component {
    static displayName = 'ComponentUseMethod';
    getLocalStorageKey() {
      return this.constructor.displayName + 'DynamicSuffix';
    }
    render() {
      return <div>hello</div>;
    }
  }
  const ComponentUseMethod = withLocalStorage(_ComponentUseMethod)

  it("should use this.getLocalStorageKey() to store into localstorage", function() {
    const component = TestUtil.renderIntoDocument(<ComponentUseMethod />);
    component.setState({
      rubber: 'ducky'
    });
    component.componentWillUnmount();
    assert.equal(
      JSON.stringify({rubber: 'ducky'}),
      ls.getItem('ComponentUseMethodDynamicSuffix')
    );
  });

  class _ComponentWithNoSetting extends React.Component {
    static displayName = 'ComponentWithNoSetting';
    render() {
      return <div>hello</div>;
    }
  }
  const ComponentWithNoSetting = withLocalStorage(_ComponentWithNoSetting)

  it("should use ComponentWithNoSetting to store into localstorage", function() {
    const component = TestUtil.renderIntoDocument(<ComponentWithNoSetting />);
    component.setState({
      hello: 'star'
    });
    component.componentWillUnmount();
    assert.equal(
      JSON.stringify({hello: 'star'}),
      ls.getItem('ComponentWithNoSetting') // NOTICE: not `react-localstorage` because of displayName
    );
  });

  class _ComponentUseStateFilter extends React.Component {
    static displayName = 'componentStateFilter';
    static defaultProps = {
      stateFilterKeys: ['a', 'b']
    };
    render() {
      return <div>hello</div>;
    }
  }
  const ComponentUseStateFilter = withLocalStorage(_ComponentUseStateFilter)

  it("should only use state keys that match filter", function() {
    const component = TestUtil.renderIntoDocument(<ComponentUseStateFilter />);
    component.setState({
      a: 'world',
      b: 'bar',
      c: 'shouldNotSync'
    });
    component.componentWillUnmount();
    assert.equal(
      JSON.stringify({a: 'world', 'b': 'bar'}),
      ls.getItem('componentStateFilter')
    );
  });

  class _ComponentUseStateFilterFunc extends React.Component {
    static displayName = 'componentStateFilterFunc';
    getStateFilterKeys() {
      return ['a', 'b'];
    }
    render() {
      return <div>hello</div>;
    }
  }
  const ComponentUseStateFilterFunc = withLocalStorage(_ComponentUseStateFilterFunc)

  it("should only use state keys that match filter function", function() {
    const component = TestUtil.renderIntoDocument(<ComponentUseStateFilterFunc />);
    component.setState({
      a: 'world',
      b: 'bar',
      c: 'shouldNotSync'
    });
    component.componentWillUnmount();
    assert.equal(
      JSON.stringify({a: 'world', 'b': 'bar'}),
      ls.getItem('componentStateFilterFunc')
    );
  });

  class _ComponentWithLifecycle extends React.Component {
    static displayName = 'ComponentWithLifecycle';
    componentDidMount() {
      this.setState({
        a: 'world',
      });
    }
    render() {
      return <div>hello</div>;
    }
    componentWillUnmount() {
      this.setState({
        b: 'bar',
      });
    }
  }
  const ComponentWithLifecycle = withLocalStorage(_ComponentWithLifecycle)

  it("should run lifecycle methods of wrapped component", async function() {
    const component = TestUtil.renderIntoDocument(<ComponentWithLifecycle />);
    assert.deepEqual(component.state, {a: 'world'})
    component.componentWillUnmount();
    assert.equal(
      JSON.stringify({a: 'world', 'b': 'bar'}),
      ls.getItem('ComponentWithLifecycle')
    );
  });

  it("should load state before calling componentDidMount() of wrapped component", async function() {
    ls.setItem(ComponentUseDisplayName.displayName, JSON.stringify({c: 'baz'}));
    const component = TestUtil.renderIntoDocument(<ComponentUseDisplayName />);
    assert.deepEqual(component.state, {c: 'baz'})
  });

  it("should shut off LS syncing with localStorageKey=false", function() {
    const component = TestUtil.renderIntoDocument(<ComponentUseDisplayName />);
    component.setState({
      a: 'world',
    });
    component.componentWillUnmount();
    assert.equal(
      JSON.stringify({a: 'world'}),
      ls.getItem('component1')
    );

    const component2 = TestUtil.renderIntoDocument(<ComponentUseDisplayName localStorageKey={false} />);
    component2.setState({
      a: 'hello',
    });
    component.componentWillUnmount();
    assert.equal(
      JSON.stringify({a: 'world'}),
      ls.getItem('component1')
    );
  });

  it("should support function as LS key", function() {
    const component = TestUtil.renderIntoDocument(
      <ComponentUseDisplayName localStorageKey={function() { return this.props.otherKey; }} otherKey="jenkees" />
    );
    component.setState({
      a: 'world',
    });
    component.componentWillUnmount();
    assert.equal(
      JSON.stringify({a: 'world'}),
      ls.getItem('jenkees')
    );

    // Check returning false
    const component2 = TestUtil.renderIntoDocument(<ComponentUseDisplayName localStorageKey={() => false} />);
    component2.setState({
      a: 'hello',
    });
    component.componentWillUnmount();
    assert.equal(
      JSON.stringify({a: 'world'}),
      ls.getItem('jenkees')
    );
  });

  it('should sync on beforeunload, then remove itself', function() {
    const eventMap = {};
    global.addEventListener = jest.fn((event, cb) => {
      eventMap[event] = cb;
    });
    global.removeEventListener = jest.fn((event, cb) => {
      if (event === 'beforeunload' && eventMap[event] !== cb) throw new Error();
      delete eventMap[event];
    });

    const component = TestUtil.renderIntoDocument(
      <ComponentUseDisplayName localStorageKey="beforeunload" />
    );
    component.setState({
      a: 'world',
    });
    assert(typeof eventMap['beforeunload'] === 'function');

    assert.equal(
      null,
      ls.getItem('beforeunload')
    );

    eventMap['beforeunload']();

    assert.equal(
      JSON.stringify({a: 'world'}),
      ls.getItem('beforeunload')
    );

    // Should have been removed now
    assert.equal(eventMap['beforeunload'], undefined);
  })
});
