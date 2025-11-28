import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import { PrismaClient } from "@prisma/client";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROTO_PATH = path.join(__dirname, "..", "proto", "user.proto");
const packageDef = protoLoader.loadSync(PROTO_PATH);
const userProto = grpc.loadPackageDefinition(packageDef).user;

const prisma = new PrismaClient();

async function GetUser(call, callback) {
  try {
    const { id } = call.request;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return callback({
        code: grpc.status.NOT_FOUND,
        message: "User not found",
      });
    }
    callback(null, user);
  } catch (err) {
    callback({ code: grpc.status.INTERNAL, message: err.message });
  }
}

async function CreateUser(call, callback) {
  try {
    const { name, email } = call.request;
    const created = await prisma.user.create({ data: { name, email } });
    callback(null, created);
  } catch (err) {
    callback({ code: grpc.status.INTERNAL, message: err.message });
  }
}

async function UpdateUser(call, callback) {
  try {
    const { id, name, email } = call.request;
    const updated = await prisma.user.update({
      where: { id },
      data: { name, email },
    });
    callback(null, updated);
  } catch (err) {
    callback({ code: grpc.status.INTERNAL, message: err.message });
  }
}

async function DeleteUser(call, callback) {
  try {
    const { id } = call.request;
    const deleted = await prisma.user.delete({ where: { id } });
    callback(null, deleted);
  } catch (err) {
    callback({ code: grpc.status.INTERNAL, message: err.message });
  }
}

async function ListUsers(call, callback) {
  try {
    const users = await prisma.user.findMany();
    callback(null, { users });
  } catch (err) {
    callback({ code: grpc.status.INTERNAL, message: err.message });
  }
}

function main() {
  const server = new grpc.Server();

  server.addService(userProto.UserService.service, {
    GetUser,
    CreateUser,
    UpdateUser,
    DeleteUser,
    ListUsers,
  });

  const addr = "0.0.0.0:50051";

  server.bindAsync(addr, grpc.ServerCredentials.createInsecure(), (err) => {
    if (err) throw err;
    server.start();
    console.log(`User gRPC server started on ${addr}`);
  });
}

main();
