import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import { PrismaClient } from "@prisma/client";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROTO_PATH = path.join(__dirname, "..", "proto", "post.proto");
const packageDef = protoLoader.loadSync(PROTO_PATH);
const postProto = grpc.loadPackageDefinition(packageDef).post;

const prisma = new PrismaClient();

async function GetPost(call, callback) {
  try {
    const { id } = call.request;
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post)
      return callback({
        code: grpc.status.NOT_FOUND,
        message: "Post not found",
      });
    callback(null, post);
  } catch (err) {
    callback({ code: grpc.status.INTERNAL, message: err.message });
  }
}

async function CreatePost(call, callback) {
  try {
    const { title, body } = call.request;
    const created = await prisma.post.create({ data: { title, body } });
    callback(null, created);
  } catch (err) {
    callback({ code: grpc.status.INTERNAL, message: err.message });
  }
}

async function UpdatePost(call, callback) {
  try {
    const { id, title, body } = call.request;
    const updated = await prisma.post.update({
      where: { id },
      data: { title, body },
    });
    callback(null, updated);
  } catch (err) {
    callback({ code: grpc.status.INTERNAL, message: err.message });
  }
}

async function DeletePost(call, callback) {
  try {
    const { id } = call.request;
    const deleted = await prisma.post.delete({ where: { id } });
    callback(null, deleted);
  } catch (err) {
    callback({ code: grpc.status.INTERNAL, message: err.message });
  }
}

async function ListPosts(call, callback) {
  try {
    const posts = await prisma.post.findMany();
    callback(null, { posts });
  } catch (err) {
    callback({ code: grpc.status.INTERNAL, message: err.message });
  }
}

function main() {
  const server = new grpc.Server();
  server.addService(postProto.PostService.service, {
    GetPost,
    CreatePost,
    UpdatePost,
    DeletePost,
    ListPosts,
  });

  const addr = "0.0.0.0:50052";
  server.bindAsync(addr, grpc.ServerCredentials.createInsecure(), (err) => {
    if (err) throw err;
    server.start();
    console.log(`Post gRPC server started on ${addr}`);
  });
}

main();
