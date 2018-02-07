
// Configuration
var Config = {};

// DB Configuration
Config.DB = {};
Config.DB.mongoConnectionString = "";

// Server Configuration
Config.Server = {};
Config.Server.port = 8002;
Config.Server.url = "http://platform.dnn.media:"+Config.Server.port+"/";

// Email Configuration
Config.Mailer = {};
Config.Mailer.service = "";
Config.Mailer.email = "";
Config.Mailer.password = "";

// Review Configuration
Config.Review = {};
Config.Review.assignedLimit = 3;
Config.Review.status = {
  QUEUED: 0,
  INREVIEW: 1,
  REJECTED: 2,
  ACCEPTED: 3,
  VOIDED: 4
}
module.exports = Config;
