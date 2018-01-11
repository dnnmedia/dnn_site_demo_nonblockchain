var proxy = require('redbird')({
    port: 80,
    secure: true,
    ssl: {
        port: 443,
        key: "./dnn_ssl/-.dnn.media_private_key.key",
        cert: "./dnn_ssl/dnn.media_ssl_certificate.cer",
    }
});

proxy.register("dnn.media", "http://localhost:8003", {ssl: true});
proxy.register("slack.dnn.media", "http://localhost:8001", {ssl: true});

proxy.register("dnnmedia.io", "http://localhost:8003", {ssl: false});
proxy.register("slack.dnnmedia.io", "http://localhost:8001", {ssl: false});

proxy.register("demo.dnn.media", "http://localhost:8002", {ssl: false});
proxy.register("demo.dnnmedia.io", "http://localhost:8002", {ssl: false});

proxy.register("crowdsale.dnn.media", "http://localhost:8004", {ssl: false});
proxy.register("crowdsale.dnnmedia.io", "http://localhost:8004", {ssl: false});
