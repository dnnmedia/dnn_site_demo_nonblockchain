/*
|--------------------------------------------------------------------------
|  HapiJS Boom Module
|--------------------------------------------------------------------------
|
|  Boom provides a set of utilities for returning HTTP errors. Each utility returns a Boom error
|  response object (instance of Error) which includes the following properties:
|
*/
var Boom    = require('boom');


/*
|--------------------------------------------------------------------------
|  HapiJS Joi Module
|--------------------------------------------------------------------------
|
|  Object schema description language and validator for JavaScript objects.
|
*/
var Joi     = require('joi');


/*
|--------------------------------------------------------------------------
|  Path Module
|--------------------------------------------------------------------------
|
|  Used to contruct directory/file paths
|
*/
var Path     = require('path');


/*
|--------------------------------------------------------------------------
| Configuration
|--------------------------------------------------------------------------
|
|  General app configurations
|
*/
var Config     = require('./config.js');


/*
|--------------------------------------------------------------------------
|  Initialize Server
|--------------------------------------------------------------------------
|
|  Configure Hapi Server
|
*/
var Hapi = require('hapi');
var server = new Hapi.Server();
server.connection({
		port: Config.Server.port,
		routes: { cors: { credentials: true } }
});


/*
|--------------------------------------------------------------------------
|  Template Engine
|--------------------------------------------------------------------------
|
|  Template Engine
|
*/
var Handlerbars = require('handlebars');
var HandlebarsLayouts = require('handlebars-layouts');
HandlebarsLayouts.register(Handlerbars);


/*
|--------------------------------------------------------------------------
|  MD5
|--------------------------------------------------------------------------
|
|  Used to generate hashes
|
*/
var md5 = require('md5');


/*
|--------------------------------------------------------------------------
|  HAT
|--------------------------------------------------------------------------
|
|  Used to generate hashes
|
*/
var hat = require('hat');



/*
|--------------------------------------------------------------------------
|  DB
|--------------------------------------------------------------------------
|
|  MongoDB connection
|
*/
var mongojs = require('mongojs')
var db = mongojs(Config.DB.mongoConnectionString)


/*
|--------------------------------------------------------------------------
|  EMAIL
|--------------------------------------------------------------------------
|
|  Notifier for email
|
*/
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
	    service: Config.Mailer.service,
	    auth: {
	        user: Config.Mailer.email,
	        pass: Config.Mailer.password
	    }
});

/*
|--------------------------------------------------------------------------
| Email Notifier
|--------------------------------------------------------------------------
|
|  Helper function to send email to user
|
*/
var sendEmail = function(to, subject, body) {
	 var mailOptions = {
				from: Config.Mailer.email,
				to: to,
				subject: "[DNN Media] " + subject,
				text: '',
				replyTo: Config.Mailer.email,
				html: body
		};
		transporter.sendMail(mailOptions, function(error) {
		});
};

var sendEmailAnonymously = function(tos, subject, body) {
		 if (tos.length > 0) {
			 var mailOptions = {
						from: Config.Mailer.email,
						to: Config.Mailer.email,
						bcc: tos,
						subject: "[DNN Media] " + subject,
						text: '',
						replyTo: Config.Mailer.email,
						html: body
				};
				transporter.sendMail(mailOptions, function(error) {
				});
		}
};

/*
|--------------------------------------------------------------------------
| Development Check
|--------------------------------------------------------------------------
|
|  Using the server object, checks to see if we are in production
|  or development.
|
*/
var isDevelopmentEnvironment = function(server)
{
		return server ? server.info.hostname.indexof("dnnmedia") === -1 : true;
};


/*
|--------------------------------------------------------------------------
|  Cleans ObjectId
|--------------------------------------------------------------------------
|
|  Perpares ObjectID
|
*/
var cleanObjectId = function(objectid)
{
		var objectid = typeof objectid === "string" ? objectid : ""
		return objectid.length >=12 && objectid.length <=24 ? objectid : "000000000000";
};

/*
|--------------------------------------------------------------------------
|  Verify Token
|--------------------------------------------------------------------------
|
|  Checks if token corresponds to user
|
*/
var verifyToken = function(request, callback)
{
		db.collection("AlphaUser").findOne({token: request.payload.token, _id: mongojs.ObjectId( cleanObjectId(request.payload._id) )}, function(error, dbUser) {
				typeof callback === "function" ? callback(!error && dbUser) : null;
		})
};

/*
|--------------------------------------------------------------------------
|  Token Balance
|--------------------------------------------------------------------------
|
| Get user's token balance
|
*/
var getBalance = function(userid, callback)
{
		db.collection("AlphaUserTransaction").find({userid: userid}, function(error, dbTransactions) {
				var balance = 0;
				if (!error) {
					for (var transaction in dbTransactions) {
							balance += parseFloat(dbTransactions[transaction].amount);
					}
				}
				typeof callback === "function" ? callback(balance) : false;
		})
};

/*
|--------------------------------------------------------------------------
|  Has Token Balance
|--------------------------------------------------------------------------
|
| Checks if user has sufficient tokens
|
*/
var hasSufficientBalance = function(amount, userid, callback)
{
		getBalance(userid, function(balance) {
				typeof callback === "function" ? callback(amount > 0 && balance >= amount) : false;
		})
};

/*
|--------------------------------------------------------------------------
|  Spends tokens
|--------------------------------------------------------------------------
|
| Creates a transaction that spends a user's tokens
|
*/
var spendTokens = function(amount, userid, message, callback)
{
		hasSufficientBalance(amount, userid, function(hasEnough) {
				if (!hasEnough) typeof callback === "function" ? callback({spent: false, insufficient: true}) : false;
				else {
						db.collection("AlphaUserTransaction").insert({message:message, userid: userid, amount: -1 * Math.abs(amount), posted: (new Date())}, function() {
								typeof callback === "function" ? callback({spent: true, insufficient: false}) : false;
						});
				}
		});
};


/*
|--------------------------------------------------------------------------
|  Assign Article
|--------------------------------------------------------------------------
|
| Assign article from the queue of articles if possible
|
*/
var assignArticleIfPossible = function() {

		 // Get articles that are queued
		 db.collection("AlphaArticle").find({status:  Config.Review.status.QUEUED}, function(error, dbArticles) {
				 if (!error && dbArticles.length > 0) {

						 // Find stakes that have not yet been assigned
						 db.collection("AlphaArticleReviewStake").find({articleid: {$exists: false}}, {}, {limit : Config.Review.assignedLimit}, function(error, dbStakes) {
								 if (!error) {

									 // Assign reviewers if we have enough bids
									 if (dbStakes.length == Config.Review.assignedLimit) {
											 var article = dbArticles[0];
											 var stakes  = dbStakes.map(function(stake) { return stake._id });
											 db.collection("AlphaArticleReviewStake").update({_id: {$in: stakes}}, {$set: {articleid: article._id.toString()}}, {multi: true});
											 db.collection("AlphaArticle").update({_id: mongojs.ObjectId(article._id)}, {$set: {status: Config.Review.status.INREVIEW}});
											 getUserEmails(dbStakes, function(emails) {
				 									sendEmail(emails, "You have been selected to review '"+article.headline+"'", "<p>Dear Reviewer,</p><p>You have been selected to review the following article:<strong>"+article.headline+"</strong>.</p><p>To review this article, please go to your <a href='http://localhost:8002/'>dashboard</a> and choose <strong>review article</strong>.</p><p>Remember to always refer to the DNN Content Guidelines when reviewing articles, to reduce your chance of losing your token stake and increase the likelihood of receiving a token reward.</p><p>Token rewards will be issued when all assigned reviewers for this article have voted. Please note: The total review time may vary depending on the response time of each reviewer.</p><p>Thanks,<br>Decentralized News Network</p>")
				 							 });
											 getUserEmails([article], function(emails) {
				 									sendEmail(emails, "'"+article.headline+"' is now in review'", "<p>Dear Writer,</p><p>Your article with the title <strong>"+article.headline+"</strong> is now in review<p><p>You will receive an email notification when the review has completed. The amount of time required to complete a review of your article may vary depending on the response time of each reviewer, so please be patient.</p><p>Thanks,<br>Decentralized News Network</p><br>To view your article, please refer to your <a href='http://localhost:8002/'>dashboard</a>.")
				 							});
									 }
								 }
						 });
				 }
		 })
};

/*
|--------------------------------------------------------------------------
|  Conclude Review
|--------------------------------------------------------------------------
|
| Makes a publishing decision if the appropriate amount of reviews
| has been made.
|
*/
var concludeReviewIfPossible = function(articleid) {
		var accepts = 0;
		var rejects = 0;
		var reviewerReward = 500;
		var writerReward = 2000;
		db.collection("AlphaArticleReviewStake").find({articleid: articleid}, function(error, dbStakes) {
				if (!error && dbStakes.length > 0) {
							var reviewers = dbStakes.map(function(stake) { return stake.userid });
							var reviewerStakes = dbStakes.map(function(stake) { return stake.amount });
							db.collection("AlphaArticleReview").find({articleid: articleid, userid: {$in: reviewers}}, function(error, dbReviews) {
									if (!error && dbReviews.length >= Config.Review.assignedLimit) {
										 	for (var review in dbReviews) {
												 	if (dbReviews[review].personalVote === "true") accepts++;
													else rejects++;
											}
											db.collection("AlphaArticleReviewStake").update({userid: {$in: reviewers}, articleid: articleid}, {$set: {used: true}}, {multi: true});
											db.collection("AlphaArticle").update({_id: mongojs.ObjectID(cleanObjectId(articleid)), status: Config.Review.status.INREVIEW}, {$set:{status: rejects > accepts ? Config.Review.status.REJECTED : Config.Review.status.ACCEPTED}})

											db.collection("AlphaArticle").findOne({_id: mongojs.ObjectID(cleanObjectId(articleid))}, function(error, dbArticle) {
													if (!error && dbArticle) {

															dbReviews.forEach(function(review, index) {
																	if (review.personalVote === "true" && accepts > rejects) {
																			addOrRemoveTokensFromUser("Stake returned for correct vote", review.userid, reviewerStakes[index]);
																			addOrRemoveTokensFromUser("Tokens rewarded for correct vote", review.userid, reviewerReward);
																			getUserEmails([review], function(emails) {
																					sendEmail(emails, "'"+dbArticle.headline+"' has been accepted", "<p>Dear Reviewer,</p><p>Your vote for the article <strong>"+dbArticle.headline+"</strong> matched the majority vote of the other assigned reviewers for this article.</p><p>As a result, you will retain your token stake and you will receive a token reward for this article.<p></p><p>Thanks,<br>Decentralized News Network</p><br>To review another article, please refer to your <a href='http://localhost:8002/'>dashboard</a>.")
																			});
																	}
																	else if (review.personalVote === "false" && rejects > accepts) {
																			addOrRemoveTokensFromUser("Stake returned for correct vote", review.userid, reviewerStakes[index]);
																			addOrRemoveTokensFromUser("Tokens rewarded for correct vote", review.userid, reviewerReward);
																			getUserEmails([review], function(emails) {
																					sendEmail(emails, "'"+dbArticle.headline+"' has been rejected", "<p>Dear Reviewer,</p><p>Your vote for the article <strong>"+dbArticle.headline+"</strong> matched the majority vote of the other assigned reviewers for this article.</p><p>As a result, you will retain your token stake and you will receive a token reward for this article.<p></p><p>Thanks,<br>Decentralized News Network</p><br>To review another article, please refer to your <a href='http://localhost:8002/'>dashboard</a>.")
																			});
																	}
																	else {
																			addOrRemoveTokensFromUser("Stake forfeited for incorrect vote", review.userid, 0);
																			getUserEmails([dbArticle], function(emails) {
																					sendEmail(emails, "'"+dbArticle.headline+"' has been accepted", "<p>Dear Reviewer,</p><p>Your vote for the article <strong>"+dbArticle.headline+"</strong> did not match the majority vote of the other assigned reviewers for this article.</p><p>As a result, your token stake has been forfeited and you will not receive a token reward for this article.<p></p><p>Thanks,<br>Decentralized News Network</p><br>To review another article, please refer to your <a href='http://localhost:8002/'>dashboard</a>.")
																			});
																	}
															});

														 	if (accepts > rejects) addOrRemoveTokensFromUser("Article acceptance token reward", dbArticle.userid, writerReward);
															else if (rejects > accepts) addOrRemoveTokensFromUser("Article rejection token reward", dbArticle.userid, 0);

															if (accepts > rejects) {
																	getUserEmails([dbArticle], function(emails) {
						 				 									sendEmail(emails, "'"+dbArticle.headline+"' has been accepted", "<p>Dear Writer,</p><p>Your article with the title <strong>"+dbArticle.headline+"</strong> has been accepted by the community.</p><p>A token reward has been issued to your account and your article has been published!<p></p><p>Thanks,<br>Decentralized News Network</p><br>To view your published article in the feed, please refer to your <a href='http://localhost:8002/'>dashboard</a>.")
						 				 							});
															}
															else if (rejects > accepts) {
																	getUserEmails([dbArticle], function(emails) {
						 				 									sendEmail(emails, "'"+dbArticle.headline+"' has been rejected", "<p>Dear Writer,</p><p>Your article with the title <strong>"+dbArticle.headline+"</strong> has been rejected by the community.</p><p>To view the feedback left by reviewers, please refer to your dashboard and select the article under <strong>articles submitted</strong></p><p>Thanks,<br>Decentralized News Network</p><br>To view reviewer feedback, please refer to your <a href='http://localhost:8002/'>dashboard</a> and select the article under <strong>articles submitted</strong>.")
						 				 							});
															}
													}
											});
									}
							})
			 	}
		});
};

var addOrRemoveTokensFromUser = function(message, userid, amount, callback) {
	db.collection("AlphaUserTransaction").insert({message:message, userid: userid, amount: amount, posted: (new Date()) }, function() {
			typeof callback === "function" ? callback() : false;
	});
}

var getUsers = function(userids, callback) {
	db.collection("AlphaUser").find({_id: {$in: userids}}, function(error, dbUsers) {
			typeof callback === "function" ? callback(!error ? dbUsers : []) : false;
	});
};

var getUserEmails = function(models, callback) {
		var userids = models.map(function(model) {
				return mongojs.ObjectID(cleanObjectId(model.userid));
		});
		db.collection("AlphaUser").find({_id: {$in: userids}}, function(error, dbUsers) {
				var emails = [];
				if (!error) {
					 	emails = dbUsers.map(function(user) {
								return user.email || "";
						})
				}
				typeof callback === "function" ? callback(emails) : false;
		});
};

/*
|--------------------------------------------------------------------------
|  View
|--------------------------------------------------------------------------
|
|  View Configuration
|
*/
server.register([require('vision'), require("inert")], function (err) {


	/*
	|--------------------------------------------------------------------------
	|  Views
	|--------------------------------------------------------------------------
	|
	|  Configured views
	|
	*/
	server.views({
			engines: {
					html: {
						module: Handlerbars
					}
			},
			relativeTo: Path.join(__dirname, 'public'),
			path: './views',
			partialsPath: './views/partials'
	});


	/*
	|--------------------------------------------------------------------------
	|  Handle HTTP Status 404
	|--------------------------------------------------------------------------
	|
	|  404 Response Handler
	|
	*/
	server.ext('onPreResponse', function (request, reply)
	{
				if (request.response.isBoom)
				{
						// HANDLE REQUEST ERROR
				}

				return reply.continue();
	});


	/*
	|--------------------------------------------------------------------------
	|  Server Events
	|--------------------------------------------------------------------------
	|
	|  Catch-all server events
	|
	*/
	server.on('internalError', function (request, err)
	{
			// HANDLE SERVER ERRORS
	});


	/*
	|--------------------------------------------------------------------------
	| WEB Route:
	|--------------------------------------------------------------------------
	|
	|  All routes pertaining to web pages
	|
	*/
	server.route({
		method: 'GET',
		path: '/',
		handler: function(request, reply)
		{
				reply.redirect("/alpha");
		}
	});;

	server.route({
		method: 'GET',
		path: '/dashboard',
		handler: function(request, reply)
		{
				reply.redirect("/alpha");
		}
	});

	server.route({
		method: 'GET',
		path: '/alpha',
		handler: function(request, reply)
		{
			reply.view('page', {id: "page"});
		}
	});

	server.route({
		method: 'GET',
		path: '/guidelines',
		handler: function(request, reply)
		{
				reply.view('page-guidelines', {id: "guidelines"});
		}
	});

	server.route({
		method: 'GET',
		path: '/onboard',
		handler: function(request, reply)
		{
				reply.view('page-onboard', {id: "onboard"});
		}
	});

	server.route({
		method: 'GET',
		path: '/type',
		handler: function(request, reply)
		{
				reply.view('page-type', {id: "type"});
		}
	});

	server.route({
		method: 'GET',
		path: '/test',
		handler: function(request, reply)
		{
				reply.view('page-test', {id: "test"});
		}
	});



	/*
	|--------------------------------------------------------------------------
	| API Endpoints
	|--------------------------------------------------------------------------
	|
	| All api endpoint routes
	|
	*/
	server.route({
		method: 'POST',
		path: '/api/v1/user/verify',
		handler: function(request, reply)
		{
				verifyToken(request, function(isTokenValid) {
						if (isTokenValid) reply({valid: true});
						else reply({valid: false});
				})
		}
	});

	server.route({
		method: 'POST',
		path: '/api/v1/user/add',
		handler: function(request, reply)
		{
				var user = request.payload;
				user.token = md5((new Date()).getTime());
				user.added = (new Date());

				db.collection("AlphaUser").insert(user, function(error, dbUser) {
						reply({user:dbUser, error:err});
				});

		}
	});

	server.route({
		method: 'POST',
		path: '/api/v1/user/update',
		handler: function(request, reply)
		{

				var user = request.payload;
				var userID = mongojs.ObjectId(cleanObjectId(user._id));

				var updates = {};
				updates.fullname = user.fullname || "";
				updates.profilePicture = user.profilePicture || "";
				updates.email = user.email || "";
				updates.updated = (new Date());

				db.collection("AlphaUser").update({_id: userID}, {$set: updates}, function(error, dbUser) {
						reply({error:!!err});
				});

		}
	});

	server.route({
		method: 'GET',
		path: '/api/v1/media/{id}',
		handler: function(request, reply)
		{
				db.collection("AlphaMedia").findOne({_id: mongojs.ObjectId(cleanObjectId(request.params.id))}, function(error, dbMedia) {
						if (!error && dbMedia) {
								var media = dbMedia.media || "";
								var meta = media.substring(0, media.indexOf("base64")+7)
								var mime = meta.replace("data:","").replace(";base64,","");
								media = media.replace(meta,"");
								reply(Buffer.from(media, 'base64')).type(mime);
						}
						else reply("").type("text/plain");
				})
		}
	});

	server.route({
		method: 'POST',
		path: '/api/v1/media/add',
		handler: function(request, reply)
		{
			 	db.collection("AlphaMedia").insert({ media: request.payload.media, created: (new Date()) }, function(error, dbMedia) {
						if (!error && dbMedia) reply({added:true, error:error, mediaid:dbMedia._id});
						else reply({added:false, error:error})
				})
		}
	});

	server.route({
		method: 'POST',
		path: '/api/v1/draft/article',
		handler: function(request, reply)
		{
				var article = request.payload.article || {};
				db.collection("AlphaArticleDraft").findOne({_id: mongojs.ObjectId(cleanObjectId(article._id))}, function(error, dbDraft) {
						if (dbDraft) {

								var articleWithoutID = JSON.parse(JSON.stringify(article));
								delete articleWithoutID["_id"];

								db.collection("AlphaArticleDraft").update({_id: mongojs.ObjectId( cleanObjectId(article._id) )}, {$set: articleWithoutID}, function(error, dbDraft) {
										reply({updated: !error});
								})
						}
						else {
								var draft = article;
								draft.created = (new Date());
								draft.updated = (new Date());
								db.collection("AlphaArticleDraft").insert(draft, function(error, dbDraft) {
										reply({error:error, article: dbDraft})
								})
						}
				})
		}
	});

	server.route({
		method: 'GET',
		path: '/api/v1/draft/article/{id}',
		handler: function(request, reply)
		{
				var id = request.params.id || "";
				db.collection("AlphaArticleDraft").findOne({_id: mongojs.ObjectId(cleanObjectId(id))}, function(error, dbDraft) {
						if (dbDraft) reply({article: dbDraft})
						else reply({article: false})
				})
		}
	});

	server.route({
		method: 'POST',
		path: '/api/v1/draft/article/remove/{id}',
		handler: function(request, reply)
		{
				var id = request.params.id || "";
				db.collection("AlphaArticleDraft").update({_id: mongojs.ObjectId(cleanObjectId(id))}, {$set: {deleted:true}}, function(error, dbDraft) {
						reply({removed: !error})
				});
		}
	});

	server.route({
		method: 'GET',
		path: '/api/v1/drafted/articles/{userid}',
		handler: function(request, reply)
		{
				var userid = request.params.userid || "";
				db.collection("AlphaArticleDraft").find({userid: userid, deleted:{$ne: true}}, function(error, dbDrafts) {
						if (!error) reply({articles: dbDrafts});
						else reply({articles: []});
				})
		}
	});

	server.route({
		method: 'POST',
		path: '/api/v1/submit/article',
		handler: function(request, reply)
		{
				var article = request.payload.article || {}
				article.created = (new Date());
				article.updated = (new Date());
				article.status = Config.Review.status.QUEUED;
				delete article["_id"];
			 	db.collection("AlphaArticle").insert(article, function(error, dbArticle) {
						if (!error && dbArticle) {
							assignArticleIfPossible();
							getUserEmails([article], function(emails) {
									sendEmail(emails, "'"+article.headline+"' has been submitted'", "<p>Dear Writer,</p><p>Your article with the title <strong>"+article.headline+"</strong> has successfully been submitted and will be in review shortly.</p><p>You will receive an email notification when it has been placed in review. Articles queued for review will be assigned to reviewers as they become available, so please be patient. The amount of time required to complete a review of your article may vary depending on the amount of articles currently in review.</p><p>Thanks,<br>Decentralized News Network</p><br>To view your article, please refer to your <a href='http://localhost:8002/'>dashboard</a>.")
							});
							reply({article:dbArticle, error:error})
						}
						else reply({article:false, error:error})
				})
		}
	});

	server.route({
		method: 'GET',
		path: '/api/v1/submitted/user/{id}',
		handler: function(request, reply)
		{
				var userid = request.params.id || {}
				db.collection("AlphaArticle").find({userid:userid}, function(error, dbArticles) {
						if (!error && dbArticles) reply({articles:dbArticles, error:error})
						else reply({articles:[], error:error})
				})
		}
	});

	server.route({
		method: 'POST',
		path: '/api/v1/review/article/{articleid}',
		handler: function(request, reply)
		{
				var articleid 	 = request.params.articleid || "";
				var userid 			 = request.payload.userid || "";
				var feedback 		 = request.payload.feedback || "";
				var peerVote 		 = request.payload.peerVote || "";
				var personalVote = request.payload.personalVote || "";

			 	db.collection("AlphaArticleReview").insert({articleid:articleid, userid:userid, feedback:feedback, peerVote:peerVote, personalVote:personalVote, posted: (new Date())}, function(error, dbArticle) {
						concludeReviewIfPossible(articleid);
						if (!error && dbArticle) reply({review:dbArticle, error:error})
						else reply({review:dbArticle, error:error})
				})
		}
	});

	server.route({
		method: 'GET',
		path: '/api/v1/reviews/article/{id}',
		handler: function(request, reply)
		{
				var query = {}
				query.articleid = request.params.id || "";
				db.collection("AlphaArticleReview").find(query, function(error, dbReviews) {
						if (!error && dbReviews) reply({reviews:dbReviews, error:error})
						else reply({reviews:dbReviews, error:error})
				})
		}
	});

	server.route({
		method: 'GET',
		path: '/api/v1/status/article/{id}',
		handler: function(request, reply)
		{
				var articleid = request.params.id || "";
				db.collection("AlphaArticle").findOne({_id: mongojs.ObjectID(cleanObjectId(articleid))}, function(error, dbArticle) {
						if (!error && dbArticle) {
								db.collection("AlphaArticleReview").find({articleid: articleid}, function(error, dbReviews) {
										if (!error) {
											reply({article: dbArticle, reviewCount: dbReviews.length, reviewLimit: Config.Review.assignedLimit})
										}
										else {
											reply({article: false, error: error})
										}
								})
						}
						else {
								reply({article: false, error: error})
						}
				});
		}
	});

	server.route({
		method: 'GET',
		path: '/api/v1/reviews/user/{id}',
		handler: function(request, reply)
		{
				var query = {}
				query.userid = request.params.id || "";
				db.collection("AlphaArticleReview").find(query, function(error, dbReviews) {
						if (!error && dbReviews) reply({reviews:dbReviews, error:error})
						else reply({reviews:dbReviews, error:error})
				})
		}
	});

	server.route({
		method: 'POST',
		path: '/api/v1/reviews/user/{id}/article',
		handler: function(request, reply)
		{
				var query = {}
				query.userid = request.params.id || "";
				query.articleid = request.payload.articleid || "";
				db.collection("AlphaArticleReview").find(query, function(error, dbReviews) {
						if (!error && dbReviews) reply({reviewed:dbReviews.length > 0, error:error})
						else reply({reviewed:dbReviews.length > 0, error:error})
				})
		}
	});

	server.route({
		method: 'POST',
		path: '/api/v1/user/token/balance',
		handler: function(request, reply)
		{
				var userid = request.payload ? (request.payload._id || "") : "";
				getBalance(userid, function(balance) {
						reply({balance: balance});
				});
		}
	});

	server.route({
		method: 'POST',
		path: '/api/v1/user/token/seed',
		handler: function(request, reply)
		{
				var userid = request.payload ? (request.payload._id || "") : "";
				var message = request.payload ? (request.payload.message || "") : "";
				var amount = request.payload ? parseFloat(request.payload.amount || 0):  0;
				addOrRemoveTokensFromUser(message, userid, amount, function() {
						getBalance(userid, function(balance) {
							 	reply({balance: balance});
						})
				})
		}
	});

	server.route({
		method: 'POST',
		path: '/api/v1/user/token/spend',
		handler: function(request, reply)
		{
				var userid = request.payload ? (request.payload._id || "") : "";
				var message = request.payload ? (request.payload.message || "") : "";
				var amount = request.payload ? parseFloat(request.payload.amount || 0):  0;
				spendTokens(amount, userid, message, function(result) {
						reply(result);
				})
		}
	});

	server.route({
		method: 'POST',
		path: '/api/v1/user/stake',
		handler: function(request, reply)
		{
				var userid = request.payload ? (request.payload._id || "") : "";
				var message = request.payload ? (request.payload.message || "") : "";
				var amount = request.payload ? parseFloat(request.payload.amount || 0):  0;
				db.collection("AlphaArticleReviewStake").find({userid:userid, articleid: {$exists: false}}, function(error, dbStakes) {
					 	if (error /*|| dbStakes.length > 0*/) reply({spent: false, insufficient: false, error: error})
						else {
								spendTokens(amount, userid, message, function(result) {
										if (result.insufficient) reply(result);
										else {
												db.collection("AlphaArticleReviewStake").insert({userid: userid, amount: amount});
												assignArticleIfPossible();
												reply(result);
										}
								})
						}
				});
		}
	});

	server.route({
		method: 'POST',
		path: '/api/v1/user/staked',
		handler: function(request, reply)
		{
				var userid = request.payload ? (request.payload._id || "") : "";
				db.collection("AlphaArticleReviewStake").find({userid:userid, articleid: {$exists: false}}, function(error, dbStakes) {
					 	if (error || dbStakes.length > 0) reply({staked: true, error: error})
						else reply({staked: false});
				});
		}
	});

	server.route({
		method: 'GET',
		path: '/api/v1/articles/assigned/user/{id}',
		handler: function(request, reply)
		{
				var userid = request.params.id || ""
				db.collection("AlphaArticleReviewStake").find({userid:userid, articleid: {$exists: true}, used: {$ne: true}}, function(error, dbStakes) {
					 	if (error || dbStakes.length === 0) reply({stakes: [], error: error})
						else reply({stakes: dbStakes});
				});
		}
	});

	server.route({
		method: 'POST',
		path: '/api/v1/articles/fetch',
		handler: function(request, reply)
		{
				var articleids = (request.payload.articleids || []).map(function(article) {
						return mongojs.ObjectID(cleanObjectId(article));
				});
				db.collection("AlphaArticle").find({_id: {$in: articleids}}, function(error, dbArticles) {
					 	if (error || dbArticles.length === 0) reply({articles: [], error: error})
						else reply({articles: dbArticles});
				});
		}
	});

	server.route({
		method: 'GET',
		path: '/api/v1/article/feed',
		handler: function(request, reply)
		{
				db.collection("AlphaArticle").find({status: 3}, function(error, dbArticles) {
					 	if (error || dbArticles.length === 0) reply({articles: [], error: error})
						else reply({articles: dbArticles});
				});
		}
	});

	server.route({
		method: 'POST',
		path: '/api/v1/transactions',
		handler: function(request, reply)
		{
				db.collection("AlphaUserTransaction").find({userid: request.payload._id}, function(error, dbTransactions) {
					 	if (error || dbTransactions.length === 0) reply({transactions: [], error: error})
						else reply({transactions: dbTransactions});
				});
		}
	});


	/*
	|--------------------------------------------------------------------------
	| API Route: Static Files
	|--------------------------------------------------------------------------
	|
	| Static files
	|
	*/
	server.route({
		method: 'GET',
		path: '/{path*}',
		handler:
		{
			directory:
			{
				path: Path.join(__dirname, 'public'),
				listing: false,
				index: true
			}
		}
	});


	/*
	|--------------------------------------------------------------------------
	| API Route: Starts Server
	|--------------------------------------------------------------------------
	|
	|  Starts server
	|
	*/
	server.start(function()
	{
			console.log("### SERVER STARTED ###");
	});
});
