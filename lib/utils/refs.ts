export function mergeRefs<Value>(...refs: React.Ref<Value>[]): React.RefCallback<Value> {
  return (value) => {
    for (let ref of refs) {
      if (typeof ref === 'function') {
        ref(value);
      } else if (ref != null) {
        (ref as React.MutableRefObject<Value | null>).current = value;
      }
    }
  };
}
