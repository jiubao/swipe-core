var defaultOptions = {
  interval: 500,
  cycle: true,
  expose: false
};
function swipeIt (options) {
  var opts = Object.assign({}, defaultOptions,
    options);

  return {
    init: init
  }

  function init () {
    console.log('init...');
  }
}

var index = swipeIt()

export default index;
