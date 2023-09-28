var express = require('express');
const app = express();
var passwordHash = require("password-hash");
const bodyParser = require('body-parser')
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({extended: false}));


app.use(express.static("public"));
const port = 4000

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, Filter} = require('firebase-admin/firestore');

var serviceAccount = require("./key.json");

initializeApp({
  credential: cert(serviceAccount)
});


const db = getFirestore();
app.set("view engine", "ejs");

app.get("/", (req,res) => {
    res.render('home');
})

app.get("/signin", (req,res) => {
    res.render('signin');
})
app.post("/signupsubmit", function(req, res) {
        console.log(req.body);
        db.collection("userDemo")
            .where(
                Filter.or(
                    Filter.where("Email", "==", req.body.Email),
                    Filter.where("Fullname", "==", req.body.Fullname)
                )
            )
            .get()
            .then((docs) => {
                if (docs.size > 0) {
                    res.send("Hey, this account already exists with the email and username.");
                } else {
                    db.collection("userDemo")
                        .add({
                            Fullname: req.body.Fullname,
                            Email: req.body.Email,
                            Password: passwordHash.generate(req.body.Password),
                        })
                        .then(() => {
                            // // Specify the correct file path to your "signin" page
                            // res.sendFile(__dirname + "/views/signin");

                            // const filePath = path.join(__dirname, "views", "signin");
                            // res.sendFile(filePath);
                            res.redirect("/signin");
                        })
                        .catch(() => {
                            res.send("Something Went Wrong");
                        });
                }
            });
    });
    
    


    app.post("/signinsubmit", (req, res) => {
      const Email = req.body.Email;
      const Password = req.body.Password;
      console.log(Email)
      console.log(Password)
    
      db.collection("userDemo")
        .where("Email", "==", Email)
        .get()
        .then((docs) => {
          if (docs.empty) {
            res.send("User not found");
          } else {
            let verified = false;
            docs.forEach((doc) => {
              verified = passwordHash.verify(Password, doc.data().Password);
            });
            if (verified) {
              res.redirect('/homepage');
            } else {
              res.send("Authentication failed");
            }
          }
        })
        .catch((error) => {
          console.error("Error querying Firestore:", error);
          res.send("Something went wrong.");
        });
    });


app.get("/signup", (req, res) => {
    res.render('signup'); 
});

app.get("/homepage", (req, res) => {
    res.render('homepage'); 

});

app.get("/dashboard", (req, res) => {
  res.render('dashboard');
});

app.get("/eeee", (req, res) => {
    res.render('eeee'); 
});

app.get("/gry", (req, res) => {
  res.render('gry'); 
});

app.get("/logout", (req, res) => {
    res.render('logout'); 
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});