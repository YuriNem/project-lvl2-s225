import _ from 'lodash';

const createNode = (name, key, valueB, valueA, children) =>
  ({
    name, key, valueB, valueA, children,
  });

const createUnchangedChildren = object => Object.keys(object).map((key) => {
  const name = 'unchanged';
  const valueB = object[key];
  const valueA = '';
  const children = valueB instanceof Object ? createUnchangedChildren(valueB) : [];
  return createNode(name, key, valueB, valueA, children);
});

const getDiff = (objectBefore, objectAfter) => {
  const typesKeys = [
    {
      name: 'added',
      valueB: () => '',
      valueA: key => objectAfter[key],
      children: key => (objectAfter[key] instanceof Object ?
        createUnchangedChildren(objectAfter[key]) : []),

      check: key => !objectBefore[key],
    },
    {
      name: 'removed',
      valueB: key => objectBefore[key],
      valueA: () => '',
      children: key => (objectBefore[key] instanceof Object ?
        createUnchangedChildren(objectBefore[key]) : []),

      check: key => !objectAfter[key],
    },
    {
      name: 'unchanged',
      valueB: key => objectBefore[key],
      valueA: () => '',
      children: key => (objectBefore[key] instanceof Object ?
        createUnchangedChildren(objectBefore[key]) : []),

      check: key => objectBefore[key] === objectAfter[key],
    },
    {
      name: 'updated',
      valueB: key => objectBefore[key],
      valueA: key => objectAfter[key],
      children: key =>
        (((objectBefore[key] instanceof Object) && (objectAfter[key] instanceof Object))
          ? getDiff(objectBefore[key], objectAfter[key]) : []),

      check: key =>
        (objectBefore[key]) && (objectAfter[key]) && (objectBefore[key] !== objectAfter[key]),
    },
  ];

  const getTypeKey = key => _.find(typesKeys, ({ check }) => check(key));

  const objectsKeys = _.union(Object.keys(objectBefore), Object.keys(objectAfter));
  const collDiff = objectsKeys.map((key) => {
    const {
      name, valueB, valueA, children,
    }
    = getTypeKey(key);
    return createNode(
      name, key,
      valueB(key), valueA(key), children(key),
    );
  });
  return collDiff;
};

export default getDiff;