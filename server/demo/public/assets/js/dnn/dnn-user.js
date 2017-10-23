var DNN = typeof DNN === "object" ? DNN : {};

/*
|--------------------------------------------------------------------------
| User
|--------------------------------------------------------------------------
|
| Handles session user
|
*/
DNN.User = {};

DNN.User.session = null;

DNN.User.Types = {
  Any: -1,
  None: 0,
  Reader: 1,
  Reviewer: 2,
  Writer: 3
};

DNN.User.updateData = function(data, account) {
  return new Promise(function(resolve, reject) {
        LI.show()
        IPFS.store(data)
          .then(function(res) {
                backend.contracts.UserContract.updateUserData(res.files[0].hash, {from:account})
                    .then(function(userTx) {
                          LI.hide();
                          DNN.User.session = data;
                          resolve({userTx:userTx});
                    })
                    .catch(function(err) {
                          LI.hide();
                          reject({error: err});
                    })

          })
          .catch(function(err) {
              LI.hide();
              reject({error: err});
          });
    });
};

DNN.User.updateType = function(type, account) {
    return new Promise(function(resolve, reject) {
        LI.show();
        backend.contracts.UserContract.updateUserType(type, {from: account})
              .then(function(userTx) {
                    LI.hide();
                    resolve({error: false, userTx:userTx});
              })
              .catch(function(err) {
                    LI.hide();
                    resolve({error: err});
              })
    });
};

DNN.User.clearCache = function() {
  localStorage.removeItem("account");
  this.session = null;
};

DNN.User.showEthAccounts = function() {
  var popup = new DNN.popup("etheraccounts", "", "", ["Refresh", "Done"]);
  popup.preventHide = true
  popup.on("button", function(event) {
        if (event.detail.button === 0) popup.update();
        else if (event.detail.button === 1 && popup.data().account) {
            localStorage.setItem("account", popup.data().account);
            window.location.reload();
        }
  });
  popup.show();
};

DNN.User.handle = function(expectedUserType, preventAccountPopup, preventOnboardRedirect, preventTypeRedirect) {
  var that = this;
  return new Promise(function(resolve, reject) {
        if (typeof LI === "object") LI.show();
        if (DNN.User.isCached()) {
            backend.eth.accounts()
              .then(function(accounts) {
                  if (accounts.length === 0 || accounts[0] != localStorage.getItem("account")) {
                      if (typeof LI === "object") LI.hide();
                      if (!preventAccountPopup) DNN.User.showEthAccounts();
                      else resolve(null);
                  }
                  else {
                    DNN.User.get().then(function(data) {
                        if (data.exists) {
                           if (expectedUserType != DNN.User.Types.Any && data.userType != expectedUserType) {
                                if (typeof LI === "object") LI.hide();
                                if (!preventTypeRedirect) window.location.href = "/type"
                                else resolve(null);
                           }
                           else {
                             if (typeof LI === "object") LI.hide();
                             that.session = data;
                             resolve(data)
                           }
                        }
                        else {
                            if (typeof LI === "object") LI.hide();
                            if (!preventOnboardRedirect) window.location.href = "/onboard";
                            else resolve(null);
                        }
                    });
                  }
              })
              .catch(function() {
                 if (typeof LI === "object") LI.hide();
                 resolve(null)
              })
        }
        else {
          if (typeof LI === "object") LI.hide();
          if (!preventAccountPopup) DNN.User.showEthAccounts();
          else resolve(null);
        }
  });
};

DNN.User.isCached = function() {
   return !(localStorage.getItem("account") === null)
};

DNN.User.get = function(account) {
  var ethaccount = localStorage.getItem("account") || account;
  return new Promise(function(resolve, reject) {
      if (typeof backend === "object") {
          backend.contracts.UserContract.retrieveUserData(ethaccount)
          	.then(function(userHash) {
                if (userHash[0] != "") {
                    DNN.Request.get(IPFS.config.gateway+userHash[0])
                      .then(function(userData) {
                          if (userData) {
                              backend.contracts.UserContract.retrieveUserType(ethaccount)
                                .then(function(userType) {
                                    backend.contracts.DNNTokenContract.balanceOf(ethaccount)
                                      .then(function(result) {
                                          resolve({balance: (parseInt(result[0].toString())/DNN.constants.token.denomination), account: ethaccount, user: JSON.parse(userData), userType:parseInt(userType[0].toString()), exists: true});
                                      })
                                      .catch(function() {
                                        resolve({balance: 0, account: ethaccount, user: JSON.parse(userData), userType:parseInt(userType[0].toString()), exists: true});
                                    })

                                })
                                .catch(function() {
                                      resolve({balance: 0, account: ethaccount, user: JSON.parse(userData), userType: DNN.User.Types.None, exists: true});
                                });
                          }
                          else resolve({exists: false});
                      });
                  }
                  else resolve({exists:false});

            })
          	.catch(function() {
                resolve({exists:false});
            });
      }
  });
};

DNN.User.getAssignedArticles = function() {
    return MockData.assignedArticles;
    //return JSON.parse((localStorage.getItem("articles_assigned") || "[]"))
};

DNN.User.getSubmittedArticles = function() {
    return JSON.parse((localStorage.getItem("articles_submitted") || "[]"))
};

DNN.User.getDraftArticles = function() {
    return JSON.parse((localStorage.getItem("articles_drafted") || "[]"))
};

DNN.User.getReadArticles = function() {
    return JSON.parse((localStorage.getItem("articles_read") || "[]"))
};

DNN.User.getReviewedArticles = function() {
    return JSON.parse((localStorage.getItem("articles_reviewed") || "[]"))
};

DNN.User.removeArticleRead = function(id) {
  var articles = JSON.parse((localStorage.getItem("articles_read") || "[]"))
  var remove = -1;
  for (var index in articles) {
    if (articles[index].id === id) {
       remove = index;
    }
  }
  if (remove != -1) articles.splice(remove, 1);
  localStorage.setItem("articles_read", JSON.stringify(articles));
};
