
// Configuration
var Config = {};

// DB Configuration
Config.DB = {};
Config.DB.mongoConnectionString = "dnnmedia:dnnmedia@dnn.media:37018/dnnmedia";

// Server Configuration
Config.Server = {};
Config.Server.port = 8002;

// Email Configuration
Config.Mailer = {};
Config.Mailer.service = "gmail";
Config.Mailer.email = "application@dnn.media";
Config.Mailer.password = "!dnnmedia!";

// Review Configuration
Config.Review = {};
Config.Review.assignedLimit = 3;
Config.Review.status = {
  QUEUED: 0,
  INREVIEW: 1,
  REJECTED: 2,
  ACCEPTED: 3
}
module.exports = Config;
