## Non-Blockchain DNN Version
To help with testing various versions of the review process we would like to open source a simulated/non-blockchain version of the DNN platform. Using a centralized datastore to mimic the functionality of the blockchain. Users can use the DNN platform using simulated tokens and a traditional web browser, without the need of getting Testnet Ether or installing any plugins like MetaMask.

## What is DNN?
Decentralized News Network is a political news platform that combines news creation with
decentralized networks as a means to delivering factual content, curated by the community of
readers, writers, and reviewers.

DNN will harness the power of the Ethereum blockchain to create infrastructure that is virtually impossible to infiltrate or take down. Since DNN is not centralized, it does not have a potential single point of failure. The platform’s core purpose is to present political news as accurately as possible, free of any corrupt incentives or hidden agendas, which plagues most news
corporations.

The DNN platform will focus on facilitating the dissemination of balanced and factual observation of current political affairs. DNN's mission is to create political news content that is both empowering for its readers, as well as representative of the integrity of its writers. DNN aspires to become the most-trusted and  democratic political news alternative to the mainstream media.

To find out more our DNN, feel free to [join the conversation on our slack](https://slack.dnn.media/) or read more on our [site](https://dnn.media/).

![DNN Logo](./public/assets/img/header-text.png)

## Dependencies

The DNN non-blockchain version relies on MongoDB ("to simulate transactions") and Nodemailer ("to send out notifications").

To install MongoDB follow [this guide](https://docs.mongodb.com/manual/installation/).

Once Mongo is installed, update Config.js within the demo folder with the respective parameters before proceeding.

## Installation

To begin working on DNN's alpha, you must first install all of the dependent node modules within package.json. To do this, navigate to the root directory of the repo and run the following command.

```bash
npm install
```

Afterwards, in the same directory, run server.js within the demo folder to start the demo.

```bash
node server.js
```

To view DNN, open up your browser and navigate to `http://localhost:8002/alpha`

### Using the DNN Alpha

For any help with using the DNN alpha, please visit the DNN slack](https://slack.dnn.media).

### Contributing
To submit changes to the main DNN demo repo, please submit a pull request. If you have any question or if your pull request has not yet been responded to, [please visit the DNN slack](https://slack.dnn.media).

### Reporting Bugs

Please report all bugs to the git issues section or notify the DNN community via the [DNN slack](https://slack.dnn.media/) under the #issues channel.

### Alpha Stack

DNN uses a number of open source projects to work properly:

* [AngularJS] - A complete framework for rapid developing web apps.
* [Quill] - web-based text editor.
* [Sass] - CSS extension language.
* [Compass] - CSS Authoring Framework.
* [NodeJs] - JavaScript runtime built on Chrome's V8 JavaScript engine.
* [HapiJS] - A rich framework for building applications and services.
* [jQuery] - don't think it needs an introduction.

### Social Channels

Feel to reach the DNN team on any of our social channels.

[Slack](http://slack.dnn.media/)

[Twitter](https://twitter.com/DNN_Blockchain)

[Facebook](https://www.facebook.com/DNNBlockchain/)

[Reddit](https://www.reddit.com/r/DNNMedia/)

[Bitcoin Talk](https://bitcointalk.org/index.php?topic=1920096.0)

[Telegram](https://t.me/DNNMedia)

### License
Apache 2.0

   [AngularJS]: <http://angularjs.org>
   [Quill]: <https://quilljs.com/>
   [Sass]: <http://sass-lang.com/>
   [Compass]: <http://compass-style.org/>
   [NodeJs]: <http://nodejs.org>
   [HapiJS]: <https://hapijs.com/>
   [jQuery]: <http://jquery.com>
