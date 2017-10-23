var DNN = typeof DNN === "object" ? DNN : {};

/*
|--------------------------------------------------------------------------
| Popup
|--------------------------------------------------------------------------
|
| General purpose popups
|
*/
DNN.popup = (function() {
  var Popup = function(type,title,text,buttons,icon) {
      var that = this;
      this.type = type || ""
      this.id = type || ""
      this.title = title || ""
      this.text = text || ""
      this.buttons = buttons || []
      this.icon = icon || ""
      this.$markup = this.construct();
      $("body").append(this.$markup);
      this.$markup.on("click", ".popup-overlay", function() {
          if (!that.preventHide) that.hide();
      });
  };

  Popup.prototype.$markup = null;
  Popup.prototype.id= null;
  Popup.prototype.type = null;
  Popup.prototype.title = null;
  Popup.prototype.text= null;
  Popup.prototype.buttons= null;
  Popup.prototype.icon = null;
  Popup.prototype.preventHide = false
  Popup.prototype.on = function(eventName, eventHandler) {
      if (typeof eventName === "string" && typeof eventHandler === "function") {
          this.$markup.get(0).addEventListener(eventName, eventHandler);
      }
  };

  Popup.prototype.customConstruct = function() {
      var that = this;
      if (this.type === "feedback") {
            var $markup = $('<div class="popup hide" data-type= "'+this.type+'" id="'+this.id+'">\
                  <div class="popup-overlay"></div>\
                  <div class="popup-content">\
                  </div>\
              </div>');

           var $content = $markup.find(".popup-content");

           $content.append($('<div class="popup-user">\
                <div class="image"></div>\
                <strong>'+DNN.User.session.user.fullname+'</strong>\
                <span>[Reviewer]</span>\
           </div>'));

           $content.append($('<textarea name="feedback" placeholder="Type your feedback for the writer..."></textarea>'))

           DNN.Request.get(IPFS.config.gateway+DNN.User.session.user.photo)
            .then(function(data) {
                  $content.find(".image").css("background-image", "url("+data+")");
            });

           if (this.buttons.length > 0) {
             var $buttons = $('<div class="popup-buttons"></div>');
             for (var index in this.buttons) {
                $buttons.append($('<a href="javascript:void(0);" class="btn" data-button="'+index+'">'+this.buttons[index]+'</a>'))
             }
             $content.append($buttons);
             $content.on("click", ".btn", function() {
               that.$markup.get(0).dispatchEvent(new CustomEvent('button', {detail: {button:$(this).data("button")} }));
               that.$markup.get(0).dispatchEvent(new CustomEvent('data', {detail: {feedback: $content.find("textarea").val() } }));
                if (!that.preventHide) that.hide();
             });
           }

           return $markup;
      }
      else if (this.type === "etheraccounts") {
            var $markup = $('<div class="popup hide" data-type= "'+this.type+'" id="'+this.id+'">\
                  <div class="popup-overlay"></div>\
                  <div class="popup-content">\
                  </div>\
              </div>');

           var $content = $markup.find(".popup-content");

           var $text = $("<p></p>");
           $content.append($text);

           var $accounts = $("<div class='ethereum-accounts'></div>");
           $content.append($accounts);

           if (this.buttons.length > 0) {
             var $buttons = $('<div class="popup-buttons"></div>');
             for (var index in this.buttons) {
                $buttons.append($('<a href="javascript:void(0);" class="btn" data-button="'+index+'">'+this.buttons[index]+'</a>'))
             }
             $content.append($buttons);
             $content.on("click", ".btn", function() {
                that.$markup.get(0).dispatchEvent(new CustomEvent('button', {detail: {button:$(this).data("button")} }));
                if (!that.preventHide) that.hide();
             });
           }

           return $markup;
      }
      else if (this.type === "uploader") {
            var $markup = $('<div class="popup hide" data-type= "'+this.type+'" id="'+this.id+'">\
                  <div class="popup-overlay"></div>\
                  <div class="popup-content">\
                  </div>\
              </div>');

           var $content = $markup.find(".popup-content");

           var $text = $("<p>To add a photo, drag and drop your file below.</p>");
           $content.append($text);

           var $droparea = $('<div class="droparea"><p><strong>Drag and Drop</strong><small>(Supported: PNG, JPG, GIF, BMP)</small></p></div>');
           $content.append($droparea);

           var saveFile = function(fileName, fileData) {
             if (typeof IPFS === "object" && typeof LI === "object") {
                IPFS.store(fileData)
                  .then(function(result) {
                      that.$markup.get(0).dispatchEvent(new CustomEvent('uploaded', {detail: {files: result.files}}));
                  })
                  .catch(console.log);
             }
           };

          var dataUriToBuffer = require('data-uri-to-buffer');
 					var dropper = $droparea.get(0) || {};

 					dropper.ondragenter = function (e)
 					{
 							dropper.className = 'droparea hover';
 							e.preventDefault();
 					};

 					dropper.ondragover = function (e)
 					{
              dropper.className = 'droparea over';
 							e.preventDefault();
 					};

 					dropper.ondragleave = function (e)
 					{
 							dropper.className = 'droparea leave';
 							e.preventDefault();
 					};

 					dropper.ondrop = function (e)
 					{
              var files = [].slice.call(e.dataTransfer.files);
 							files.forEach(function (file) {
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


          if (this.buttons.length > 0) {
             var $buttons = $('<div class="popup-buttons"></div>');
             for (var index in this.buttons) {
                $buttons.append($('<a href="javascript:void(0);" class="btn" data-button="'+index+'">'+this.buttons[index]+'</a>'))
             }
             $content.append($buttons);
             $content.on("click", ".btn", function() {
                that.$markup.get(0).dispatchEvent(new CustomEvent('button', {detail: {button:$(this).data("button")} }));
                if (!that.preventHide) that.hide();
             });
          }

           return $markup;
      }
      else if (this.type === "uploader-local") {
            var $markup = $('<div class="popup hide" data-type= "'+this.type+'" id="'+this.id+'">\
                  <div class="popup-overlay"></div>\
                  <div class="popup-content">\
                  </div>\
              </div>');

           var $content = $markup.find(".popup-content");

           var $text = $("<p>To add a photo, drag and drop your file below.</p>");
           $content.append($text);

           var $droparea = $('<div class="droparea"><p><strong>Drag and Drop</strong><small>(Supported: PNG, JPG, GIF, BMP)</small></p></div>');
           $content.append($droparea);

           var saveFile = function(fileName, fileData) {
             if (typeof LI === "object") {
                DNN.Request.post("/api/v1/media/add", {media:fileData})
                  .then(function(result) {
                      that.$markup.get(0).dispatchEvent(new CustomEvent('uploaded', {detail: {files: [result._id]}}));
                  })
                  .fail(console.log);
             }
           };

          var dataUriToBuffer = require('data-uri-to-buffer');
 					var dropper = $droparea.get(0) || {};

 					dropper.ondragenter = function (e)
 					{
 							dropper.className = 'droparea hover';
 							e.preventDefault();
 					};

 					dropper.ondragover = function (e)
 					{
              dropper.className = 'droparea over';
 							e.preventDefault();
 					};

 					dropper.ondragleave = function (e)
 					{
 							dropper.className = 'droparea leave';
 							e.preventDefault();
 					};

 					dropper.ondrop = function (e)
 					{
              var files = [].slice.call(e.dataTransfer.files);
 							files.forEach(function (file) {
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


          if (this.buttons.length > 0) {
             var $buttons = $('<div class="popup-buttons"></div>');
             for (var index in this.buttons) {
                $buttons.append($('<a href="javascript:void(0);" class="btn" data-button="'+index+'">'+this.buttons[index]+'</a>'))
             }
             $content.append($buttons);
             $content.on("click", ".btn", function() {
                that.$markup.get(0).dispatchEvent(new CustomEvent('button', {detail: {button:$(this).data("button")} }));
                if (!that.preventHide) that.hide();
             });
          }

           return $markup;
      }
  };

  Popup.prototype.construct = function() {
    var that = this;
    if (["feedback","etheraccounts", "uploader", "uploader-local"].indexOf(this.type) != -1) return this.customConstruct();
    else {
        var $markup = $('<div class="popup hide" data-type= "'+this.type+'" id="'+this.id+'">\
              <div class="popup-overlay"></div>\
              <div class="popup-content">\
              </div>\
          </div>');

      var $content = $markup.find(".popup-content");

      if (this.icon != "") {
         var $icon = $('<div class="popup-icon" style="background-image:url('+this.icon+')"></div>');
         $content.append($icon);
      }

      if (this.title != "") {
         var $title = $("<h3>"+this.title+"</h3>");
         $content.append($title);
      }

       if (this.text != "") {
          var $text = $("<p>"+this.text+"</p>");
          $content.append($text);
       }

       if (this.buttons.length > 0) {
         var $buttons = $('<div class="popup-buttons"></div>');
         for (var index in this.buttons) {
            $buttons.append($('<a href="javascript:void(0);" class="btn" data-button="'+index+'">'+this.buttons[index]+'</a>'))
         }
         $content.append($buttons);
         $content.on("click", ".btn", function() {
              that.$markup.get(0).dispatchEvent(new CustomEvent('button', {detail: {button:$(this).data("button")} }));
              if (!that.preventHide) that.hide();
         });
       }

       return $markup;
     }
  };

  Popup.prototype.show = function() {
      var that = this;
      this.update();
      setTimeout(function() {
          that.$markup.attr("class", "popup show");
          setTimeout(function() {
              that.$markup.get(0).dispatchEvent(new Event('show'));
          },500);
      },100);
  };

  Popup.prototype.hide = function() {
      var that = this;
      this.$markup.attr("class", "popup hide");
      setTimeout(function() {
          that.$markup.get(0).dispatchEvent(new Event('hide'));
      },500);
  };

  Popup.prototype.update = function() {
    var that = this;
    if (this.type === "etheraccounts") {
        if (typeof backend === "object") {
           backend.eth.accounts()
             .then(function(accounts) {
                 that.$markup.find(".ethereum-accounts").html("");
                 if (accounts.length > 0) {
                     that.$markup.find("p").html("Which ethereum account would you like DNN to use?");
                     that.$markup.find("a").removeClass("disabled");
                     for (var index in accounts) {
                         backend.contracts.DNNTokenContract.balanceOf(accounts[index])
                             .then(function(result) {
                                   that.$markup.find(".ethereum-accounts").append($("<div class='ethereum-account'><input type='radio' name='etheraccount' value='"+accounts[index]+"'><div><strong>"+accounts[index]+"</strong><br><span>Balance: "+parseInt(result.balance.toString())/DNN.constants.token.denomination+" DNN</span></div></div>"));
                             });
                     }
                 }
                 else {
                     that.$markup.find("p").html("No ethereum accounts were found. Please make sure that your account is unlocked.");
                     that.$markup.find("a").addClass("disabled");
                    }
             })
             .catch(console.log);
        }
    }
  };

  Popup.prototype.data = function() {
      var data = {};
      if (this.type === "feedback") {
          data["feedback"] = this.$markup.find("textarea[name='feedback']").val() || ""
      }
      else if (this.type === "etheraccounts") {
          data["account"] = this.$markup.find("input[name='etheraccount']:checked").val()  || ""
      }
      return data;
  };

  Popup.prototype.clear = function() {
      if (this.type === "feedback") {
          this.$markup.find("textarea[name='feedback']").val("")
      }
  };

  return Popup;
})();
