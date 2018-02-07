// Initialize DNN Module 
var DNN = typeof DNN === "object" ? DNN : {};

// Intiailize Helper
DNN.Helper = {};

// Generates unique ID using random number and current date
DNN.Helper.generateID = function() {
    return Math.random().toString(36).substr(2, 9) + Date.now();
};

// Carries out full page redirect
DNN.Helper.Redirect = function(url, newTab) {
    if (newTab) window.open(url, "_blank");
    else window.location.href = url
};
