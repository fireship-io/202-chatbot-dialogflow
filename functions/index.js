const functions = require('firebase-functions');
const admin = require('firebase-admin');
const acct = require('./service-account.json')
admin.initializeApp({
credential: admin.credential.cert(acct),
databaseURL: "https://fireship-lessons.firebaseio.com"
});

const { SessionsClient } = require('dialogflow');




exports.dialogflowGateway = functions.https.onRequest(async (request, response) => {

    const { queryInput, sessionId } = request.body;

 

    const sessionClient = new SessionsClient({ credentials: acct });
    const session = sessionClient.sessionPath('fireship-lessons', sessionId);



      const responses = await sessionClient.detectIntent({ session, queryInput});
      console.log('Detected intent');
      const result = responses[0].queryResult;
      console.log(`  Query: ${result.queryText}`);
      console.log(`  Response: ${result.fulfillmentText}`);
      if (result.intent) {
        console.log(`  Intent: ${result.intent.displayName}`);
      } else {
        console.log(`  No intent matched.`);
      }

    response.send(result);
});


const { WebhookClient } = require('dialogflow-fulfillment');

exports.dialogflowWebhook = functions.https.onRequest(async (request, response) => {
    const agent = new WebhookClient({ request, response });

    console.log(JSON.stringify(request.body));

    const result = request.body.queryResult;
   
    function welcome(agent) {
      agent.add(`Welcome to my agent!`);
    }
   
    function fallback(agent) {
      agent.add(`I didn't understand`);
      agent.add(`I'm sorry, can you try again?`);
    }

    async function userOnboardingHandler(agent) {

     const db = admin.firestore();
     const profile = db.collection('users').doc('jeffd23');

     const { name, color } = result.parameters;

      await profile.set({ name, color })
      agent.add(`Welcome aboard my friend!`);
    }


    let intentMap = new Map();
    intentMap.set('Default Welcome Intent', welcome);
    intentMap.set('Default Fallback Intent', fallback);
    intentMap.set('UserOnboarding', userOnboardingHandler);
    // intentMap.set('your intent name here', googleAssistantHandler);
    agent.handleRequest(intentMap);
});