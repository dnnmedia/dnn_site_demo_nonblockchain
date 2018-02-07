// Initialize DNN Module
var DNN = typeof DNN === "object" ? DNN : {};

// Holds article
DNN.Article = {};

DNN.Article.feed = function() {
    return new Promise(function(resolve, reject) {
        DNN.Request.get("/api/" + DNN.Constants.APIVERSION + "/article/feed")
            .then(function(data) {
                resolve(data);
            })
            .fail(function() {
                reject();
            })
    });
};

DNN.Article.fetch = function(articleids) {
    return new Promise(function(resolve, reject) {
        DNN.Request.post("/api/" + DNN.Constants.APIVERSION + "/articles/fetch", {articleids: articleids})
            .then(function(data) {
                resolve(data);
            })
            .fail(function() {
                reject();
            })
    });
};


DNN.Article.getDraft = function(id) {
      return new Promise(function(resolve, reject) {
          DNN.Request.get("/api/" + DNN.Constants.APIVERSION + "/draft/article/" + id)
              .then(function(data) {
                  resolve(data);
              })
              .fail(function() {
                  reject();
              })
      });
};

DNN.Article.getDraftsByUser = function(userid) {
    return new Promise(function(resolve, reject) {
        DNN.Request.get("/api/" + DNN.Constants.APIVERSION + "/drafted/articles/" + userid)
            .then(function(data) {
                resolve(data);
            })
            .fail(function() {
                reject();
            })
    });
};

DNN.Article.updateDraft = function(article) {
    return new Promise(function(resolve, reject) {
        DNN.Request.post("/api/" + DNN.Constants.APIVERSION + "/draft/article", {article:article})
            .then(function(data) {
                resolve(data);
            })
            .fail(function() {
                reject();
            })
    });
};

DNN.Article.createDraft = function(article) {
  return new Promise(function(resolve, reject) {
      DNN.Request.post("/api/" + DNN.Constants.APIVERSION + "/draft/article" , {article:article})
          .then(function(data) {
              resolve(data);
          })
          .fail(function() {
              reject();
          })
  });
};

DNN.Article.removeDraft = function(id) {
  return new Promise(function(resolve, reject) {
      DNN.Request.post("/api/" + DNN.Constants.APIVERSION + "/draft/article/remove/" + id)
          .then(function(data) {
              resolve(data);
          })
          .fail(function() {
              reject();
          })
  });
};

DNN.Article.submit = function(article) {
    return new Promise(function(resolve, reject) {
        DNN.Request.post("/api/" + DNN.Constants.APIVERSION + "/submit/article" , {article:article})
            .then(function(data) {
                resolve(data);
            })
            .fail(function() {
                reject();
            })
    });
};


DNN.Article.getSubmittedByUser = function(userid) {
    return new Promise(function(resolve, reject) {
        DNN.Request.get("/api/" + DNN.Constants.APIVERSION + "/submitted/user/" + userid)
            .then(function(data) {
                resolve(data);
            })
            .fail(function() {
                reject();
            })
    });
};

DNN.Article.review = function(id, userid, feedback, peerVote, personalVote) {
    return new Promise(function(resolve, reject) {
        DNN.Request.post("/api/" + DNN.Constants.APIVERSION + "/review/article/" + id , {userid:userid, feedback:feedback, peerVote:peerVote, personalVote:personalVote})
            .then(function(data) {
                resolve(data);
            })
            .fail(function() {
                reject();
            })
    });
};

DNN.Article.getReviews = function(id) {
    return new Promise(function(resolve, reject) {
        DNN.Request.get("/api/" + DNN.Constants.APIVERSION + "/reviews/article/" + id)
            .then(function(data) {
                resolve(data);
            })
            .fail(function() {
                reject();
            })
    });
};

DNN.Article.getReviewsCount = function(id) {
    return new Promise(function(resolve, reject) {
        DNN.Request.get("/api/" + DNN.Constants.APIVERSION + "/count/reviews/article/" + id)
            .then(function(data) {
                resolve(data);
            })
            .fail(function() {
                reject();
            })
    });
};

DNN.Article.getReviewsByUser = function(userid) {
    return new Promise(function(resolve, reject) {
        DNN.Request.get("/api/" + DNN.Constants.APIVERSION + "/reviews/user/" + userid)
            .then(function(data) {
                resolve(data);
            })
            .fail(function() {
                reject();
            })
    });
};

DNN.Article.hasReviewed = function(id, userid) {
    return new Promise(function(resolve, reject) {
        DNN.Request.post("/api/" + DNN.Constants.APIVERSION + "/reviews/user/"+userid+"/article", {articleid: id})
            .then(function(data) {
                resolve(data);
            })
            .fail(function() {
                reject();
            })
    });
};

DNN.Article.getAssigned = function(userid) {
    return new Promise(function(resolve, reject) {
        DNN.Request.get("/api/" + DNN.Constants.APIVERSION + "/articles/assigned/user/"+userid)
            .then(function(data) {
                resolve(data);
            })
            .fail(function() {
                reject();
            })
    });
};
