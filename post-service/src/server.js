import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import { PrismaClient } from "@prisma/client";
import path from "path";
import { fileURLToPath } from "url";

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROTO_PATH = path.join(__dirname, "..", "proto", "post.proto");

const packageDef = protoLoader.loadSync(PROTO_PATH);
const postProto = grpc.loadPackageDefinition(packageDef).post;

// ---------------- POSTS ----------------

async function GetPost(call, callback) {
  const post = await prisma.post.findUnique({ where: { id: call.request.id } });
  if (!post) return callback({ code: grpc.status.NOT_FOUND });
  callback(null, post);
}

async function CreatePost(call, callback) {
  const post = await prisma.post.create({ data: call.request });
  callback(null, post);
}

async function UpdatePost(call, callback) {
  const { id, title, body } = call.request;
  const post = await prisma.post.update({ where: { id }, data: { title, body } });
  callback(null, post);
}

async function DeletePost(call, callback) {
  const post = await prisma.post.delete({ where: { id: call.request.id } });
  callback(null, post);
}

async function ListPosts(_, callback) {
  const posts = await prisma.post.findMany();
  callback(null, { posts });
}

// ---------------- REACTIONS ----------------

async function CreateReaction(call, callback) {
  const { postId, userId, type } = call.request;

  const reactionType = type === 0 ? "LIKE" : "DISLIKE";

  const reaction = await prisma.reaction.upsert({
    where: { postId_userId: { postId, userId } },
    update: { type: reactionType },
    create: { postId, userId, type: reactionType },
  });

  callback(null, reaction);
}

async function DeleteReaction(call, callback) {
  const { postId, userId } = call.request;
  const deleted = await prisma.reaction.delete({
    where: { postId_userId: { postId, userId } },
  });
  callback(null, deleted);
}

async function ListReactionsForPost(call, callback) {
  const reactions = await prisma.reaction.findMany({
    where: { postId: call.request.postId },
  });
  callback(null, { reactions });
}

async function ListReactionsForUser(call, callback) {
  const reactions = await prisma.reaction.findMany({
    where: { userId: call.request.userId },
  });
  callback(null, { reactions });
}

async function GetReactionForUser(call, callback) {
  const { postId, userId } = call.request;
  const reaction = await prisma.reaction.findUnique({
    where: { postId_userId: { postId, userId } },
  });
  callback(null, reaction || {});
}

// ---------------- SERVER ----------------

function main() {
  const server = new grpc.Server();

  server.addService(postProto.PostService.service, {
    GetPost,
    CreatePost,
    UpdatePost,
    DeletePost,
    ListPosts,
    CreateReaction,
    DeleteReaction,
    ListReactionsForPost,
    ListReactionsForUser,
    GetReactionForUser,
  });

  server.bindAsync("0.0.0.0:50052", grpc.ServerCredentials.createInsecure(), () => {
    server.start();
    console.log("✅ Post + Reaction gRPC server running on 50052");
  });
}

main();
