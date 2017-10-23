var DNN = typeof DNN === "object" ? DNN : {};

/*
|--------------------------------------------------------------------------
| Article
|--------------------------------------------------------------------------
|
| Handles article
|
*/
DNN.Article = {};

DNN.Article.submit = function(article, account) {
  return new Promise(function(resolve, reject) {
      LI.show();
      IPFS.store(article)
      	.then(function(result) {
               LI.hide();
               var articleHash = result.files[0].hash
               var popup = new DNN.popup("message", "", "Your approval is needed to submit this article. To finalize the submission, accept the following two transactions to send your article into review.", ["Cancel", "Continue"])
               popup.on("button", function(event) {
                  if (event.detail.button === 1) {
                       LI.show();
                       backend.contracts.DNNTokenContract.approve(backend.contracts.ReviewProcessContractAddress, 100 * DNN.constants.token.denomination, {from: account})
                          .then(function(approveTx) {
                              backend.contracts.ReviewProcessContract.submitArticleForReview(articleHash, {from: account})
                                  .then(function(reviewTx) {
                                      LI.hide();
                                      resolve({approveTx:approveTx, reviewTx:reviewTx, article: articleHash})
                                  })
                                  .catch(function(err) {
                                      LI.hide();
                                      reject({error:err});
                                  })

                          })
                          .catch(function(err) {
                              LI.hide();
                              reject({error:err});
                          });
                    }
              });
              popup.show();
        })
      	.catch(function(err) {
            LI.hide();
            reject({error:err});
        });

    });
};

DNN.Article.get = function(articleHash) {
    return new Promise(function(resolve, reject) {
        DNN.Request.ajax({url:IPFS.config.gateway + articleHash, timeout: 3000})
          .then(function(data) {
              resolve(JSON.parse(data));
          })
          .fail(reject)
    });
};

DNN.Article.read = function(article, id) {
  var hasRead = false
  var articles = JSON.parse((localStorage.getItem("articles_read") || "[]"))
  for (var index in articles) {
      if (articles[index].id === id) {
          hasRead = true
      }
  }
  if (!hasRead) articles.push({id:id, article: article});
  localStorage.setItem("articles_read", JSON.stringify(articles));
};

DNN.Article.submitReview = function(articleHash, personalVote, peerVote, feedback, account) {
  return new Promise(function(resolve, reject) {
      LI.show();
      IPFS.store({article:articleHash, feedback:feedback, user:DNN.User.session.user, created: (new Date()).toString()})
        .then(function(result) {
            var feedbackHash = result.files[0].hash;
            var _personalVote = personalVote ? "1" : "2";
            var _peerVote = peerVote ? "1" : "2";
            LI.hide();
            resolve({feedbackHash: feedbackHash});

              // backend.contracts.ReviewProcessContract.vote(articleHash, _personalVote, _peerVote, feedbackHash, {from: account})
              //   .then(function(reviewTx) {
              //       LI.hide();
              //       console.log(reviewTx);
              //   })
              //   .catch(function() {
              //       console.log(arguments);
              //       LI.hide();
              //       reject();
              //   });

        })
        .catch(function() {
          LI.hide();
          reject();
        });
  });
};
