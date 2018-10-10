() => {
  let count = 1;
  return () => {
    count += 2;
    return { count, '^2': count * count };
  };
};
