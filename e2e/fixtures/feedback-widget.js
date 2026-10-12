// Stand-in for https://feedback.andreizimin.com/widget.js in browser tests.
// Implements the widget's host-page contract (data-launcher="none",
// window.FeedbackWidget, feedback:* events, shadow-DOM form) without any network.
(function () {
  var host = document.createElement('div');
  host.id = 'feedback-widget-host';
  document.body.appendChild(host);
  var root = host.attachShadow({ mode: 'open' });
  root.innerHTML =
    '<div class="overlay" hidden style="position:fixed;inset:0;background:rgba(0,0,0,.4)">' +
    '<div role="dialog" aria-label="Send feedback" style="background:#fff;margin:20vh auto;width:280px;padding:16px">' +
    '<textarea class="fb-message" aria-label="Feedback message"></textarea></div></div>';
  var overlay = root.querySelector('.overlay');
  var emit = function (name) {
    window.dispatchEvent(new CustomEvent(name, { detail: { project: 'test', version: 'fixture' } }));
  };
  window.FeedbackWidget = {
    version: 'fixture',
    project: 'test',
    open: function () {
      if (!overlay.hidden) return;
      overlay.hidden = false;
      root.querySelector('textarea').focus();
      emit('feedback:open');
    },
    close: function () {
      if (overlay.hidden) return;
      overlay.hidden = true;
      emit('feedback:close');
    },
    isOpen: function () {
      return !overlay.hidden;
    },
  };
  emit('feedback:ready');
})();
