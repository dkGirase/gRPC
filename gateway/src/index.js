import express from "express";
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Load protos
const userProtoPath = path.join(
  __dirname,
  "../../user-service/proto/user.proto"
);
const postProtoPath = path.join(
  __dirname,
  "../../post-service/proto/post.proto"
);

const userPackageDef = protoLoader.loadSync(userProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const postPackageDef = protoLoader.loadSync(postProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const userProto = grpc.loadPackageDefinition(userPackageDef).user;
const postProto = grpc.loadPackageDefinition(postPackageDef).post;

// gRPC clients
const userClient = new userProto.UserService(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

const postClient = new postProto.PostService(
  "localhost:50052",
  grpc.credentials.createInsecure()
);

// User routes
app.get("/api/users", (req, res) => {
  userClient.ListUsers({}, (err, response) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(response.users);
  });
});

app.get("/api/users/:id", (req, res) => {
  userClient.GetUser({ id: req.params.id }, (err, user) => {
    if (err) return res.status(404).json({ error: err.message });
    res.json(user);
  });
});

app.post("/api/users", (req, res) => {
  const { name, email } = req.body;
  userClient.CreateUser({ name, email }, (err, user) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json(user);
  });
});

app.put("/api/users/:id", (req, res) => {
  const { name, email } = req.body;
  userClient.UpdateUser({ id: req.params.id, name, email }, (err, user) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json(user);
  });
});

app.delete("/api/users/:id", (req, res) => {
  userClient.DeleteUser({ id: req.params.id }, (err, user) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json(user);
  });
});

// Post routes
app.get("/api/posts", (req, res) => {
  postClient.ListPosts({}, (err, response) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(response.posts);
  });
});

app.get("/api/posts/:id", (req, res) => {
  postClient.GetPost({ id: req.params.id }, (err, post) => {
    if (err) return res.status(404).json({ error: err.message });
    res.json(post);
  });
});

app.post("/api/posts", (req, res) => {
  const { title, body } = req.body;
  postClient.CreatePost({ title, body }, (err, post) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json(post);
  });
});

app.put("/api/posts/:id", (req, res) => {
  const { title, body } = req.body;
  postClient.UpdatePost({ id: req.params.id, title, body }, (err, post) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json(post);
  });
});

app.delete("/api/posts/:id", (req, res) => {
  postClient.DeletePost({ id: req.params.id }, (err, post) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json(post);
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Gateway listening on :${PORT}`));
