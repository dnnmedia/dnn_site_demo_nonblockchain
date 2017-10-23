var DNN = typeof DNN === "object" ? DNN : {};

/*
|--------------------------------------------------------------------------
| Article
|--------------------------------------------------------------------------
|
| Handles article
|
*/
DNN.Editor = {};

DNN.Editor.handleArticleLoad = function(id) {
    var that = this;
    return new Promise(function(resolve, reject) {
        resolve(that.getArticleDraft(id));
    });
};

DNN.Editor.getArticleDraft = function(draftid) {
  var payload = DNN.Session.current || {}
  payload.userid = payload._id || ""
  payload.draftid = draftid
  return DNN.Request.get("/api/v1/draft/article", payload)
};


DNN.Editor.removeArticleDraft = function(id) {
    var payload = DNN.Session.current || {}
    payload.userid = payload._id || ""
    payload.article = article
    payload.draftid = draftid
    return DNN.Request.post("/api/v1/draft/article/remove", payload)
};

DNN.Editor.storeArticleAsDraft = function(article, draftid) {
     var payload = DNN.Session.current || {}
     payload.userid = payload._id || ""
     payload.article = article
     payload.draftid = draftid
     return DNN.Request.post("/api/v1/draft/article", payload)
};

DNN.Editor.storeArticleAsSubmitted = function(article, ipfsID) {
    var payload = DNN.Session.current || {}
    payload.userid = payload._id || ""
    payload.article = article
    return DNN.Request.post("/api/v1/submit/article", payload)
};

DNN.Editor.storeArticleAsReviewed = function(article, ipfsID, feedbackIpfsID) {
   var articles = JSON.parse((localStorage.getItem("articles_reviewed") || "[]"))
   articles.push({id: ipfsID, article: article, feedback: feedbackIpfsID});
   localStorage.setItem("articles_reviewed", JSON.stringify(articles));
};
