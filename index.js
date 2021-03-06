// Example express application adding the parse-server module to expose Parse
// compatible API routes.

const express = require('express');
const ParseServer = require('parse-server').ParseServer;
const ParseDashboard = require('parse-dashboard');
const { execSync } = require('child_process');
const path = require('path');

const databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

const envClasses = process.env.LIVE_CLASSES;
const liveClasses = envClasses.split(",");

const stdout = execSync('cp -u ' + __dirname + '/cloud/main.js /cloud');
console.log(stdout);

const api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
  cloud: '/cloud/main.js', //process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'myAppId',
  masterKey: process.env.MASTER_KEY || '', //Add your master key here. Keep it secret!
  // restAPIKey: process.env.REST_API_KEY || '',
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse',  // Don't forget to change to https if needed
  allowClientClassCreation: process.env.ALLOW_CLIENT_CLASS_CREATION === "true",
  liveQuery: {
    classNames: liveClasses // List of classes to support for query subscriptions
  }
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

const options = { allowInsecureHTTP: true };
const dashboard = new ParseDashboard({
  apps: [
    {
      serverURL: process.env.PARSE_URL,
      //"https://parse-server-example-" + process.env.PROJECT_NAME + ".1d35.starter-us-east-1.openshiftapps.com/parse",
      //"https://parse-server-example-" + process.env.PROJECT_NAME + ".7e14.starter-us-west-2.openshiftapps.com/parse",
      appId: process.env.APP_ID || "myAppId",
      masterKey: process.env.MASTER_KEY || "myMasterKey",
      appName: process.env.APP_NAME || "MyApp"
    }
  ],
  users: [
    {
      user: process.env.DASHBOARD_USER,
      pass: process.env.DASHBOARD_PASS
    }
  ]
}, options);

const app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
const mountPath = process.env.PARSE_MOUNT || '/parse';
// Serve the Parse Dashboard on the /dashboard URL prefix
const dashboardPath = '/dashboard';

app.use(mountPath, api);
app.use(dashboardPath,dashboard)

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

const port = process.env.PORT || 1337;

const httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
