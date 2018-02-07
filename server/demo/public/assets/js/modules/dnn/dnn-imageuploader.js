var DNN = typeof DNN === "object" ? DNN : {};

/*
|--------------------------------------------------------------------------
| Popup
|--------------------------------------------------------------------------
|
| General purpose popups
|
*/
DNN.ImageUploader = (function() {

  // Used to initialize popup
  var Popup = function() {

      // Store this context
      var that = this;

      //Body context
      var $body = $("body");

      // ID
      this.id =  Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

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
      var $markup = $('<div class="popup hide" data-hash="'+(this.id || "")+'" data-type= "'+(this.type || "")+'" id="'+(this.id || "")+'">\
            <div class="popup-overlay"></div>\
            <div class="popup-content"></div>\
        </div>');

      // Content Reference
      var $content = $markup.find(".popup-content");

      // Uploader heading
      var $text = $("<p>To add a photo, drag and drop your file below.</p>");
      $content.append($text);

      // Droparea text
      var $droparea = $('<div class="droparea"><p><strong>Drag and Drop</strong><small>(Supported: PNG, JPG, GIF, BMP)</small></p></div>');
      $content.append($droparea);


      // Saves file to database
      var saveFile = function(fileName, fileData) {
          if (typeof LI === "object") {
              DNN.Request.post("/api/v1/media/add", {media:fileData})
                  .then(function(result) {
                      that.$markup.get(0).dispatchEvent(new CustomEvent('uploaded', {detail: result}));
                    })
                    .fail(console.log);
           }
      };

      // Refrence to droparea
      var dropper = $droparea.get(0) || {};

      // Handle drag enter event
      dropper.ondragenter = function (e)
      {
          dropper.className = 'droparea hover';
          e.preventDefault();
      };

      // Handle drag over event
      dropper.ondragover = function (e)
      {
          dropper.className = 'droparea over';
          e.preventDefault();
      };

      // Handle drag leave event
      dropper.ondragleave = function (e)
      {
          dropper.className = 'droparea leave';
          e.preventDefault();
      };

      // Handle drop event
      dropper.ondrop = function (e)
      {
          var files = [].slice.call(e.dataTransfer.files);
          files.forEach(function (file)
          {
                var reader = new FileReader();
                reader.onload = function (event) {
                    that.hide();
                    saveFile(file.name, event.target.result);
                };
                reader.readAsDataURL(file);
          });
          dropper.className = 'droparea';
          e.preventDefault();
      };

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
