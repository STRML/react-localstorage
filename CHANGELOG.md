1.0.0 (Jan 31, 2018)
------

- Perf: Only synchronize storage on unmount.
  - This saves a lot of stringify / localStorage churn by only saving when we must.
  - This has a semantic change; state is not synced as often and we can
    no longer throw errors if you have a key collision, so this is a major update.
- Rework testing with Jest.

0.3.1 (Feb 13, 2017)
------

- Small performance fix in `stateFilterKeys` iteration.
- Updated development dependencies.


0.3.0 (May 10, 2016)
------

- Allow setting `props.localStorageKey` as a function. It will be called with the component as `this`.
- Allow setting `false` (or a function that returns `false`) to shut off the mixin.


(History before 0.2.9 was not written here, see the Git log)
