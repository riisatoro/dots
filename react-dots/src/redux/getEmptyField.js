const getEmptyField = (size = 10) => {
  const tmpField = [];
  let row = [];
  for (let i = 0; i <= size * size; i += 1) {
    if (i % size === 0 && i !== 0) {
      tmpField.push(row);
      row = [];
    }
    row.push('E');
  }
  return tmpField;
};

export default getEmptyField;
