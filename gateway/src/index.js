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
app.get("/api/users", async (req, res) => {
  userClient.ListUsers({}, (err, response) => {
    if (err) return res.status(500).json({ error: err.message });

    const users = response.users || [];

    const promises = users.map(
      (u) =>
        new Promise((resolve) => {
          // Fetch reactions made by this user
          postClient.ListReactionsForUser(
            { userId: u.id },
            async (rErr, rResp) => {
              const reactions = rErr ? [] : rResp.reactions || [];

              // Fetch each post title
              const postPromises = reactions.map(
                (r) =>
                  new Promise((resolvePost) => {
                    postClient.GetPost({ id: r.postId }, (pErr, post) => {
                      resolvePost({
                        postTitle: post?.title || "Unknown Post",
                        type: r.type,
                      });
                    });
                  })
              );

              const reactedPosts = await Promise.all(postPromises);

              resolve({
                ...u,
                reactions: reactedPosts,
              });
            }
          );
        })
    );

    Promise.all(promises).then((result) => res.json(result));
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
app.get("/api/posts", async (req, res) => {
  const currentUserId = req.query.currentUserId || null; // optional

  postClient.ListPosts({}, (err, response) => {
    if (err) return res.status(500).json({ error: err.message });

    const posts = response.posts || [];

    // Process all posts in parallel
    const promises = posts.map(
      (post) =>
        new Promise((resolve) => {
          // Get author info
          userClient.GetUser({ id: post.authorId }, (uErr, author) => {
            if (uErr) author = null;

            // Get reactions
            postClient.ListReactionsForPost(
              { postId: post.id },
              async (rErr, rResp) => {
                const reactions = rErr ? [] : rResp.reactions || [];

                const counts = reactions.reduce(
                  (acc, r) => {
                    if (r.type === "LIKE" || r.type === 0) acc.likes++;
                    else acc.dislikes++;
                    return acc;
                  },
                  { likes: 0, dislikes: 0 }
                );

                const reactorPromises = reactions.map(
                  (r) =>
                    new Promise((resolve) => {
                      userClient.GetUser({ id: r.userId }, (err, user) => {
                        resolve({
                          userId: r.userId,
                          name: user?.name || "Unknown User",
                          type: r.type,
                        });
                      });
                    })
                );

                const reactors = await Promise.all(reactorPromises);

                if (!currentUserId) {
                  resolve({
                    post,
                    author,
                    reactionSummary: { counts, reactors },
                    myReaction: null,
                  });
                } else {
                  postClient.GetReactionForUser(
                    { postId: post.id, userId: currentUserId },
                    (mrErr, myR) => {
                      resolve({
                        post,
                        author,
                        reactionSummary: { counts, reactors },
                        myReaction: mrErr ? null : myR || null,
                      });
                    }
                  );
                }
              }
            );
          });
        })
    );

    Promise.all(promises).then((results) => res.json(results));
  });
});

app.get("/api/posts/:id", (req, res) => {
  postClient.GetPost({ id: req.params.id }, (err, post) => {
    if (err) return res.status(404).json({ error: err.message });
    res.json(post);
  });
});

app.post("/api/posts", (req, res) => {
  const { title, body, authorId } = req.body;

  postClient.CreatePost({ title, body, authorId }, (err, post) => {
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

// POST /api/posts/:id/reactions
app.post("/api/posts/:id/reactions", (req, res) => {
  postClient.CreateReaction(
    { postId: req.params.id, userId: req.body.userId, type: req.body.type },
    (err, reaction) => {
      if (err) return res.status(400).json({ error: err.message });
      res.json(reaction);
    }
  );
});

// DELETE /api/posts/:id/reactions (remove reaction)
app.delete("/api/posts/:id/reactions", (req, res) => {
  postClient.DeleteReaction(
    { postId: req.params.id, userId: req.query.userId },
    (err, reaction) => {
      if (err) return res.status(400).json({ error: err.message });
      res.json(reaction);
    }
  );
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Gateway listening on :${PORT}`));
