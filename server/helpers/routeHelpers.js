function isActiveRoute(currentRoute, route) {
  return currentRoute === route ? 'active' : '';
}
module.exports = {
  isActiveRoute
};