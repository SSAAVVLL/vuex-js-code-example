const express = require("express");
const app = express();
const { slugify } = require("transliteration");
var cors = require("cors");
const { execSync } = require("child_process");
var bodyParser = require("body-parser");
var axios = require("axios");
const qs = require("qs");
var http = require("http");
var https = require("https");
var crypto = require("crypto");
var convertapi = require("convertapi")("JwHXNykYh9Xbw1GP");
var lockFile = require("lockfile");
var sleep = require("sleep");
var fs = require("fs");
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(express.json());
// hatefull cors
const MongoConnection = require("./mongoConnection.js");
const yandexApiAddress = "https://money.yandex.ru/api/";
const success_url = "https://presentex.tech/success.html";
const success_url_subscribe = "https://presentex.tech/success_subscribe.html";
const error_url = "https://presentex.tech/error.html";
const initPayment = require("./yandexPayments.js");
const yandexWallet = null;
const routesYandex = {
  instanceId: yandexApiAddress + "instance-id",
  requestExternalPayment: yandexApiAddress + "request-external-payment",
  processExternalPayment: yandexApiAddress + "process-external-payment",
};
const pythonServiceUrl = "http://localhost:5000/";
let client_id =
  "";
//const client = new MongoClient(url);
app.use(cors());
// process.env.isProduction = false;
const isProduction = false;

console.log(isProduction == true);
const port = 3000;
var editPresentation = require("./index").editPresentation;

if (isProduction) {
  var options = {
    key: fs.readFileSync("/etc/letsencrypt/live/presentex.tech/privkey.pem"),
    cert: fs.readFileSync("/etc/letsencrypt/live/presentex.tech/fullchain.pem"),
  };
}

const API_SUMM = "http://localhost:5000/process_text";

app.post("/feedback", function (req, resultExp) {
  var survey = req.body.survey;
  var token = req.body.token;
  if (survey) {
    MongoConnection(function (databaseConnection) {
      databaseConnection.collection("survey", function (error, collection) {
        collection.insertMany(
          [
            {
              token: token,
              textProcessing: survey[0],
              appearence: survey[1],
              averallQuality: survey[2],
              date: Date.now(),
            },
          ],
          function (err, result) {
            console.log(result);
            resultExp.json({ data: { result: "ok" } });
          }
        );
      });
    });
  }
});

app.get("/download-pptx", function (req, res) {
  var token = req.query.token;

  res.download(`resultPresentations/${token}.pptx`);
});

app.post("/send-user-email", function (req, resultExp) {
  var userEmail = req.body.userEmail;
  //var survey = req.body.survey;
  var token = req.body.token;
  console.log(userEmail);
  console.log(token);
  if (token) {
    if (userEmail) {
      axios
        .post(routesYandex.instanceId, qs.stringify({ client_id: client_id }))
        .then((res) => {
          let status = res.data.status;
          let instance_id = res.data.instance_id;
          if (status === "success") {
            axios
              .post(
                routesYandex.requestExternalPayment,
                qs.stringify({
                  pattern_id: "p2p",
                  instance_id: instance_id,
                  to: 41001798815371,
                  amount: 50,
                  message: "Оплата презентации",
                })
              )
              .then((res) => {
                let statusRequestPayment = res.data.status;
                let request_id = res.data.request_id;
                console.log("request_id", request_id);
                console.log("instance_id", instance_id);
                if (statusRequestPayment === "success") {
                  axios
                    .post(
                      routesYandex.processExternalPayment,
                      qs.stringify({
                        request_id: request_id,
                        instance_id: instance_id,
                        ext_auth_success_uri: success_url,
                        ext_auth_fail_uri: error_url,
                      })
                    )
                    .then((res) => {
                      console.log(res.data);
                      let redir_url = res.data.acs_uri;
                      let asc_param = res.data.acs_params;
                      let redir_full =
                        redir_url + "?" + qs.stringify(asc_param);
                      console.log(redir_full);

                      // collection.findOne({token: token, secret: secret}, function(err, document) {
                      //     client.close();
                      //     if (document && document.secret === secret) {
                      //         res.download(`resultPresentations/${token}.pptx`);

                      //     } else {
                      //         res.send('Document not found');
                      //     }
                      // })

                      MongoConnection(function (databaseConnection) {
                        databaseConnection.collection("payment", function (
                          error,
                          collection
                        ) {
                          collection.insertMany(
                            [
                              {
                                email: userEmail,
                                token: token,
                                // payId: paymentId,
                                requestId: request_id,
                                instanceId: instance_id,
                                error: false,
                                payed: false,
                                checked: 0,
                                paymentContext: asc_param.cps_context_id,
                                secret: crypto.randomBytes(32).toString("hex"),
                                date: Date.now(),
                              },
                            ],
                            function (err, result) {
                              // client.close();
                              console.log(result);
                              resultExp.json({ redirect: redir_full });
                            }
                          );
                        });
                      });
                    });
                }
              });
          }
        });
    }
  }
});

app.get("/downloadPresentation", function (req, res) {
  var presId = req.query.id;
  // res.download(`resultPresentations/${presId}.pptx`);
  res.download(`pdf/${presId}.pdf`);
});

app.post("/makePresentation", async function (req, response) {
  console.log("request: makePresentation");
  let name = req.body.name;
  let text = req.body.text;
  let completed = req.body.compl;
  // generate token for request
  var addInfo = slugify(name) + slugify(completed);
  console.log(addInfo);
  addInfo = addInfo.replace(/[^a-z\-]+/g, "");
  console.log(addInfo);
  var token = addInfo + "-" + crypto.randomBytes(48).toString("hex");
  console.log(text);
  console.log(`Token is ${token}`);
  let textObjs = [];

  let to_send = text.map(function (some_sequences) {
    return { text: some_sequences, word_count: 30 };
  });
  res = await axios.post(
    API_SUMM,
    { params: to_send },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  // console.log(res.data);
  textObjs = res.data;

  await editPresentation(token, name, textObjs, completed);

  console.log(textObjs);

  let fileFrom = `${token}.pptx`;
  let fileTo = `${token}.pdf`;

  let cmd = `python upload_pres.py ${fileFrom} ${fileTo}`;

  let output = execSync(cmd);
  console.log(output.toString());

  response.json({
    path:
      (isProduction ? "https://presentex.tech:3000" : "http://localhost:3000") +
      "/download-pptx?token=" +
      token,
    token: token,
  });
});

// app.post('/editPresentation/', function(req, res){
//     console.log('requst: editPresentation \n');
//     var pres = req.body;

//     res.send('/downloadPresentation/');
// });

// subscribe and get promocode to download presentations
app.post("/make-subscribe", function (req, res) {
  let email = req.body.email;
  let promocode = axios.get(`${pythonServiceUrl}tokens`).then((promoAnswer) => {
    console.log(promoAnswer);
    let promocode = promoAnswer.data;
    initPayment(
      client_id,
      "Подписка на получение pptx",
      49,
      yandexWallet,
      success_url_subscribe,
      error_url
    ).then((resObj) => {
      MongoConnection(function (databaseConnection) {
        databaseConnection.collection("payment-subscribe", function (
          error,
          collection
        ) {
          collection.insertMany(
            [
              {
                email: email,
                requestId: resObj.request_id,
                instanceId: resObj.instance_id,
                error: false,
                payed: false,
                checked: 0,
                promocode: promocode,
                date: Date.now(),
              },
            ],
            function (err, result) {
              res.json({ redirect: resObj.url });
            }
          );
        });
      });
    });
  });
});

// permit user to download pptx without payment
app.post("/send-user-promo-code", async function (req, res) {
  let userEmail = req.body.userEmail;
  let token = req.body.token;
  let promoCode = req.body.promoCode;
  console.log(`${pythonServiceUrl}tokens/${promoCode}`);
  let resRem = await axios.get(`${pythonServiceUrl}tokens/${promoCode}`);
  let permited = new Boolean(resRem.data);
  let resultJson = {
    promoCodeStatus: "rejected",
  };
  if (permited) {
    let secret = crypto.randomBytes(32).toString("hex");
    let refDownload = isProduction
      ? `https://presentex.tech:3000/download-pptx?token=${token}&secret=${secret}`
      : `http://localhost:3000/download-pptx?token=${token}&secret=${secret}`;
    MongoConnection(function (databaseConnection) {
      databaseConnection.collection("presentations", function (
        error,
        collection
      ) {
        collection.insertMany(
          [
            {
              token: token,
              secret: secret,
              date: Date.now(),
            },
          ],
          function (err, result) {
            console.log(result);
            resultJson.promoCodeStatus = "applied";
            resultJson.path = refDownload;
            res.json(resultJson);
          }
        );
      });
    });
  } else {
    res.json(resultJson);
  }
  console.log(resRem);
});
// app.get('/make-payment/', function(req, res) {
//     axios.post(routesYandex.instanceId, qs.stringify({client_id: client_id})).then(res => {
//         let status = res.data.status;
//         let instance_id = res.data.instance_id;
//         if (status === 'success') {
//             axios.post(routesYandex.requestExternalPayment, qs.stringify({
//                 pattern_id: 'p2p',
//                 instance_id: instance_id,
//                 to: 41001798815371,
//                 amount: 2,
//                 message: 'Client_test'
//             })).then(res => {
//                 let statusRequestPayment = res.data.status;
//                 let request_id = res.data.request_id;
//                 console.log('request_id', request_id);
//                 console.log('instance_id', instance_id);
//                 if (statusRequestPayment === 'success') {
//                     axios.post(routesYandex.processExternalPayment, qs.stringify({
//                         request_id: request_id,
//                         instance_id: instance_id,
//                         ext_auth_success_uri: 'https://presentex.tech',
//                         ext_auth_fail_uri: 'https://presentex.tech'
//                     })).then(res => {
//                         console.log(res.data)
//                     })
//                 }
//             })
//         }
//     })
// })

if (!isProduction) {
  var server = http.createServer(app).listen(port, function () {
    console.log("Development Express server listening on port " + port);
  });
} else {
  var server = https.createServer(options, app).listen(port, function () {
    console.log("Production Express server listening on port " + port);
  });
}
