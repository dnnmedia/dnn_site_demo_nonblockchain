// Initialize DNN Module
var DNN = typeof DNN === "object" ? DNN : {};

// Holds current session
DNN.Session = {};

// Holds current user session
DNN.Session.current = null;

// Creates a new user
DNN.Session.create = function(data) {

  return new Promise(function(resolve, reject) {

      // Persist user data to database
      DNN.Request.post("/api/"+DNN.Constants.APIVERSION+"/user/add", data)
          .then(function(data) {

              // Save user locally if data was successfully
              // persisted to the database.
              if (!data.error) {
                  DNN.Session.setCurrent(data.user);
                  resolve();
              }
          })
          .fail(function() {
              reject();
          })
      });
};

// Checks local user with user in database
DNN.Session.verifyAndSetIfPossible = function() {

    return new Promise(function(resolve, reject) {

        // Retrieve current user locally if possible
        var user = JSON.parse((localStorage.getItem("user") || "{}"))

        // Determine if we successfully retrieved the local user
        if (Object.keys(user).length > 0) {

            // Verify the local user with the user in the data.
            // Pull any information that is out os sync.
            DNN.Request.post("/api/"+DNN.Constants.APIVERSION+"/user/verify", user)
                .then(function(data) {

                    // If the local user is valid, update it with
                    // the user from the database.
                    if (data.valid) {
                        DNN.Session.setCurrent(user);
                        resolve(user)
                    }

                    // Otherwise, the local user not okay to use.
                    else reject();
                })
                .fail(function()  {
                    reject();
                })
        }

        // Couldn't retrieve a local user
        else {
          reject();
        }
    });
};

// Searchs for transactions
DNN.Session.getTransactions = function() {

    // Save changes to database
    return DNN.Request.post("/api/"+DNN.Constants.APIVERSION+"/transactions", DNN.Session.current);
};

// Updates database user with changes made to local user
DNN.Session.save = function() {
    // Record changes to cache
    DNN.Session.setCurrent(DNN.Session.current);

    // Save changes to database
    return DNN.Request.post("/api/"+DNN.Constants.APIVERSION+"/user/update", DNN.Session.current);
};

// Saves user data retreived from the database to the user's local cache
DNN.Session.setCurrent = function(user) {
    // Set user locally
    DNN.Session.current = user

    // Store user in local cache
    localStorage.setItem("user", JSON.stringify(user));
};

// Deletes user data locally
DNN.Session.destroy = function() {
    // Unset user locally
    DNN.Session.current = null;

    // Remove user from local cache
    localStorage.removeItem("user");
};

// Seeds account with tokens
DNN.Session.seedTokens = function(amount, message) {
    return new Promise(function(resolve, reject) {
        var params = DNN.Session.current || {};
        params.amount = amount;
        params.message = message || "";
        DNN.Request.post("/api/" + DNN.Constants.APIVERSION + "/user/token/seed", params)
            .then(function(data) {
                resolve(data);
            })
            .fail(function() {
                reject();
            })
    });
};

// Retrieves user's balance
DNN.Session.balance = function() {
    return new Promise(function(resolve, reject) {
        var params = DNN.Session.current || {};
        DNN.Request.post("/api/" + DNN.Constants.APIVERSION + "/user/token/balance", params)
            .then(function(data) {
                resolve(data);
            })
            .fail(function() {
                reject();
            })
    });
};

// Seeds account with tokens
DNN.Session.spend = function(amount, message) {
    return new Promise(function(resolve, reject) {
        var params = DNN.Session.current || {};
        params.amount = amount;
        params.message = message || ""
        DNN.Request.post("/api/" + DNN.Constants.APIVERSION + "/user/token/spend", params)
            .then(function(data) {
                resolve(data);
            })
            .fail(function() {
                reject();
            })
    });
};

// Stake tokens for review
DNN.Session.stake = function(amount, message) {
    return new Promise(function(resolve, reject) {
        var params = DNN.Session.current || {};
        params.amount = amount;
        params.message = message;
        DNN.Request.post("/api/" + DNN.Constants.APIVERSION + "/user/stake", params)
            .then(function(data) {
                resolve(data);
            })
            .fail(function() {
                reject();
            })
    });
};

// Determine if this user has staked
DNN.Session.didStake = function() {
    return new Promise(function(resolve, reject) {
        var params = DNN.Session.current || {};
        DNN.Request.post("/api/" + DNN.Constants.APIVERSION + "/user/staked", params)
            .then(function(data) {
                resolve(data);
            })
            .fail(function() {
                reject();
            })
    });
};
