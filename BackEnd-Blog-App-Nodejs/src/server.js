import { fileURLToPath } from "url";  // Importing the fileURLToPath function from the "url" module.
const __filename = fileURLToPath(import.meta.url);  // Getting the current file's path using import.meta.url.
const __dirname = path.dirname(__filename);  // Getting the directory name from the current file's path.

const credentials = JSON.parse(fs.readFileSync("./credentials.json"));  // Reading and parsing the JSON content of "credentials.json".
admin.initializeApp({  // Initializing the Firebase admin SDK with credentials.
  credential: admin.credential.cert(credentials),
});

const app = express();  // Creating an instance of the Express application.
app.use(express.json());  // Adding middleware to parse incoming JSON data.
app.use(express.static(path.join(__dirname, "../build")));  // Serving static files from the specified directory.

app.get(/^(?!\/api).+/, (req, res) => {  // Handling GET requests for routes not starting with "/api".
  res.sendFile(path.join(__dirname, "../build/index.html"));  // Sending the "index.html" file for client-side routing.
});

app.use(async (req, res, next) => {  // Middleware for handling user authentication.
  const { authtoken } = req.headers;  // Extracting the "authtoken" header.

  if (authtoken) {
    try {
      req.user = await admin.auth().verifyIdToken(authtoken);  // Verifying the Firebase ID token and setting the user in the request.
    } catch (e) {
      return res.sendStatus(400);  // Sending a 400 status if token verification fails.
    }
  }

  req.user = req.user || {};  // Setting an empty user object if no token is provided.

  next();  // Moving to the next middleware or route handler.
});

app.get("/api/articles/:name", async (req, res) => {  // Handling GET requests for retrieving an article by name.
  // Extracting parameters from the request.
  const { name } = req.params;
  const { uid } = req.user;

  // Querying the database for the article by name.
  const article = await db.collection("articles").findOne({ name });

  if (article) {
    const upvoteIds = article.upvoteIds || [];
    article.canUpvote = uid && !upvoteIds.includes(uid);
    res.json(article);  // Sending the article as JSON response.
  } else {
    res.sendStatus(404);  // Sending a 404 status if the article is not found.
  }
});

// Middleware for checking user authentication before proceeding.
app.use((req, res, next) => {
  if (req.user) {
    next();  // Proceeding to the next middleware or route handler if user is authenticated.
  } else {
    res.sendStatus(401);  // Sending a 401 status if user is not authenticated.
  }
});

app.put("/api/articles/:name/upvote", async (req, res) => {  // Handling PUT requests for upvoting an article.
  // Extracting parameters from the request.
  const { name } = req.params;
  const { uid } = req.user;

  // Querying the database for the article by name.
  const article = await db.collection("articles").findOne({ name });

  if (article) {
    // Checking if the user can upvote the article.
    const upvoteIds = article.upvoteIds || [];
    const canUpvote = uid && !upvoteIds.includes(uid);

    if (canUpvote) {
      // Updating the article's upvotes and upvoteIds in the database.
      await db.collection("articles").updateOne(
        { name },
        {
          $inc: { upvotes: 1 },
          $push: { upvoteIds: uid },
        }
      );
    }

    // Querying the database again to get the updated article.
    const updatedArticle = await db.collection("articles").findOne({ name });
    res.json(updatedArticle);  // Sending the updated article as JSON response.
  } else {
    res.send("That article doesn't exist");  // Sending a response if the article doesn't exist.
  }
});

app.post("/api/articles/:name/comments", async (req, res) => {  // Handling POST requests for adding comments to an article.
  // Extracting parameters from the request.
  const { name } = req.params;
  const { text } = req.body;
  const { email } = req.user;

  // Updating the article's comments in the database.
  await db.collection("articles").updateOne(
    { name },
    {
      $push: { comments: { postedBy: email, text } },
    }
  );

  // Querying the database again to get the updated article.
  const article = await db.collection("articles").findOne({ name });

  if (article) {
    res.json(article);  // Sending the updated article as JSON response.
  } else {
    res.send("That article doesn't exist!");  // Sending a response if the article doesn't exist.
  }
});

const PORT = process.env.PORT || 8000;  // Setting the server port.

connectToDb(() => {  // Connecting to the database using the provided function.
  console.log("Successfully connected to database!");
  app.listen(PORT, () => {
    console.log("Server is listening on port " + PORT);  // Starting the server and logging a message.
  });
});
