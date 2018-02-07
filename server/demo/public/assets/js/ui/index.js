(function( $ ) {
  "use strict"

  if (typeof $ === "function") {
      $(function() {
          var LI = {};
          LI.$holder = $("body");
          LI.selector = "loading-indicator"
          LI.show = function() {
              var $loader = $('<div id="'+this.selector+'"><img src="/assets/img/loading-indicator.gif" /></div>');
              this.$holder.append($loader);
              setTimeout(function() {
                $loader.addClass("show");
              });
          };
          LI.hide = function() {
              var that = this;
              $("#" + this.selector).removeClass("show");
              setTimeout(function() {
                  $("#" + that.selector).remove();
              },500);
          };
          window.LI = LI
      });
  }

})( jQuery )
