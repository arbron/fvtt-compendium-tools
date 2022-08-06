const NAME_REGEX = new RegExp(/^(?<name>\w+)(?:\[(?<index>\d+)\](?:\.(?<property>\w+))?)?$/);

// TODO: Objects at top level
// TODO: Recursive processing

export function parseFormData(data) {
  let newData = {};
  let collector = {};

  for (let [name, value] of Object.entries(data)) {
    let r = name.match(NAME_REGEX);
    if (r.groups.index) {
      if (!collector.hasOwnProperty(r.groups.name)) {
        collector[r.groups.name] = {};
      }
      if (!collector[r.groups.name].hasOwnProperty(r.groups.index)) {
        collector[r.groups.name][r.groups.index] = {};
      }
      if (r.groups.property) {
        collector[r.groups.name][r.groups.index][r.groups.property] = value;
      } else {
        collector[r.groups.name][r.groups.index] = value;
      }
    } else {
      newData[r.groups.name] = value;
    }
  }

  for (let [name, value] of Object.entries(collector)) {
    newData[name] = [];
    for (let [index, object] of Object.entries(value)) {
      newData[name].push(object);
    }
  }

  return newData;
}
