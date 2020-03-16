function kebabCase(name) {
  return name.replace(/\s+/g, '-').toLowerCase();
}

module.exports = {kebabCase};
