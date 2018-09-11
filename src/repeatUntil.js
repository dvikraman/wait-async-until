var DEFAULT_INTERVAL = 50;
var DEFAULT_TIMEOUT = 5000;

/**
 * Repeats until the predicate returns true and resolves a Promise
 *
 * @param  predicate  Function  Predicate that checks the condition
 * @param  timeout  Number  Maximum wait interval, 5000ms by default
 * @param  interval  Number  Repeat interval, 50ms by default
 * @return  Promise  Promise to return a callback result
 */
module.exports = function repeatUntil(
  predicate,
  timeout,
  interval
) {
  var timerInterval = interval || DEFAULT_INTERVAL;
  var timerTimeout = timeout || DEFAULT_TIMEOUT;

  return new Promise(function promiseCallback(resolve, reject) {
    var timer;
    var timeoutTimer;
    var clearTimers;
    var doStep;

    clearTimers = function clearWaitTimers() {
      clearTimeout(timeoutTimer);
      clearInterval(timer);
    };

    doStep = async function doTimerStep() {
      var result;

      try {
        result = await predicate();

        if (result) {
          clearTimers();
          resolve(result);
        } else {
          timer = setTimeout(doStep, timerInterval);
        }
      } catch (e) {
        clearTimers();
        reject(e);
      }
    };

    timer = setTimeout(doStep, timerInterval);
    timeoutTimer = setTimeout(function onTimeout() {
      clearTimers();
      reject(new Error('Timed out after waiting for ' + timerTimeout + 'ms'));
    }, timerTimeout);
  });
};