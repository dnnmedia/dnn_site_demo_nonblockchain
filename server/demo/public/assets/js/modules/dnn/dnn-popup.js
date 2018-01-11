var DNN = typeof DNN === "object" ? DNN : {};

/*
|--------------------------------------------------------------------------
| Popup
|--------------------------------------------------------------------------
|
| General purpose popups
|
*/
DNN.Popup = (function() {

  // Used to initialize popup
  var Popup = function(style,title,text,buttons,icon) {

      // Store this context
      var that = this;

      //Body context
      var $body = $("body");

      // ID
      this.id =  Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

      // Style of popup
      this.style = style || "" // warning, message, notice, success

      // Title text
      this.title = title || ""

      // Message text
      this.text = text || ""

      // Button labels
      this.buttons = buttons || []

      // URL of icon image
      this.icon = icon || ""

      // Get markup of popup using the above properties
      this.$markup = this.construct();

      // Add the markup to the page
      $body.append(this.$markup);

      // Listen for clicks on the overlay to trigger a close
      this.$markup.on("click", ".popup-overlay", function() {
          if (!that.preventHide) that.hide();
      });
  };

  // ID
  Popup.prototype.id = null;

  // Markup
  Popup.prototype.$markup = null;

  // Style of popup
  Popup.prototype.style = null;

  // Title text
  Popup.prototype.title = null;

  // Body text
  Popup.prototype.text = null;

  // Button labels
  Popup.prototype.buttons = null;

  // URL of icon image
  Popup.prototype.icon = null;

  // Disables tapping overlay to close popup
  Popup.prototype.preventHide = false

  // Listens for events on elements within popup markup
  Popup.prototype.on = function(eventName, eventHandler) {
      if (typeof eventName === "string" && typeof eventHandler === "function") {
          this.$markup.get(0).addEventListener(eventName, eventHandler);
      }
  };

  // Generates markup of popup based on set properties
  Popup.prototype.construct = function() {

      // Reference to current context
      var that = this;

      // Initial popup markup
      var $markup = $('<div class="popup hide" data-hash="'+this.id+'" data-style= "'+(this.style || "")+'" id="'+(this.style || "")+'">\
            <div class="popup-overlay"></div>\
            <div class="popup-content"></div>\
        </div>');

      // Content holder
      var $content = $markup.find(".popup-content");

      // Add icon if specified
      if (this.icon != "") {
         var $icon = $('<div class="popup-icon" style="background-image:url('+this.icon+')"></div>');
         $content.append($icon);
      }

      // Add title if specified
      if (this.title != "") {
         var $title = $("<h3>"+this.title+"</h3>");
         $content.append($title);
      }

      // Add message text if specified
       if (this.text != "") {
          var $text = $("<p>"+this.text+"</p>");
          $content.append($text);
       }

       // Add buttons if specified
       if (this.buttons.length > 0) {
         var $buttons = $('<div class="popup-buttons"></div>');
         for (var index in this.buttons) {
            $buttons.append($('<a href="javascript:void(0);" class="dnn-button" data-button="'+index+'">'+this.buttons[index]+'</a>'))
         }
         $content.append($buttons);
         $content.on("click", ".dnn-button", function() {
              that.$markup.get(0).dispatchEvent(new CustomEvent('button', {detail: {button:$(this).data("button")} }));
              if (!that.preventHide) that.hide();
         });
       }

       // Final popup markup
       return $markup;
  };

  // Displays popup
  Popup.prototype.show = function() {
      var that = this;
      setTimeout(function() {
          that.$markup.attr("class", "popup show");
          setTimeout(function() {
              that.$markup.get(0).dispatchEvent(new Event('show'));
          },500);
      },100);
  };

  // Hides popup
  Popup.prototype.hide = function() {
      var that = this;
      this.$markup.attr("class", "popup hide");
      setTimeout(function() {
          that.$markup.get(0).dispatchEvent(new Event('hide'));
      },500);
  };

  // Popup Reference
  return Popup;

})();
