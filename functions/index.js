var functions = require('firebase-functions');
var admin = require('firebase-admin');
var cors = require('cors')({ origin: true });
var webpush = require('web-push');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

var serviceAccount = require('./pwa-service-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://pwagram-e9240.firebaseio.com/',
});

exports.storePostData = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    admin
      .database()
      .ref('posts')
      .push({
        id: request.body.id,
        title: request.body.title,
        location: request.body.location,
        image: request.body.image,
      })
      .then(() => {
        webpush.setVapidDetails(
          'mailto:seoheejun@gmail.com',
          'BNEVqtaTznFRPWI_xUQlaDbm44LxISXrli94zUm1DCZT1y9TBz-u7GOFTTwls2c97ahBrobnGYqQB6pG8BweTZ0',
          'DnYllfODDeHJyxh0_bEt3UWuPfxtYRuDbJUPD_g0f-I'
        );
        return admin.database().ref('subscriptions').once('value');
      })
      .then((subscriptions) => {
        subscriptions.forEach(() => {
          var pushConfig = {
            endpoint: sub.val().endpoint,
            keys: {
              auth: sub.val().keys.auth,
              p256dh: sub.val().keys.p256dh,
            },
          };
          webpush.sendNotification(
            pushConfig,
            JSON.stringify({
              title: 'New Post',
              content: 'New Post added!',
              openUrl: '/help',
            })
          );
        });

        return response
          .status(201)
          .json({ message: 'Data stored', id: request.body.id });
      })
      .catch((err) => {
        response.status(500).json({ error: err });
      });
  });
});
