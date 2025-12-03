package com.example.userservice.service;

import com.example.userservice.grpc.*;
import com.example.userservice.entity.UserEntity;
import com.example.userservice.repository.UserRepository;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;

import java.util.List;

@GrpcService
public class GrpcUserService extends UserServiceGrpc.UserServiceImplBase {

    private final UserRepository repo;

    public GrpcUserService(UserRepository repo) {
        this.repo = repo;
    }

    @Override
    public void getUser(GetUserRequest req, StreamObserver<User> res) {

        UserEntity entity = repo.findById(req.getId())
                .orElseThrow();

        User user = User.newBuilder()
                .setId(entity.getId())
                .setName(entity.getName())
                .setEmail(entity.getEmail())
                .build();

        res.onNext(user);
        res.onCompleted();
    }

    @Override
    public void createUser(CreateUserRequest req, StreamObserver<User> res) {

        UserEntity e = new UserEntity();
        e.setName(req.getName());
        e.setEmail(req.getEmail());
        repo.save(e);

        User user = User.newBuilder()
                .setId(e.getId())
                .setName(e.getName())
                .setEmail(e.getEmail())
                .build();

        res.onNext(user);
        res.onCompleted();
    }

    @Override
    public void listUsers(ListUsersRequest req, StreamObserver<ListUsersResponse> res) {

        List<User> users = repo.findAll().stream()
                .map(u -> User.newBuilder()
                        .setId(u.getId())
                        .setName(u.getName())
                        .setEmail(u.getEmail())
                        .build())
                .toList();

        res.onNext(ListUsersResponse.newBuilder().addAllUsers(users).build());
        res.onCompleted();
    }

    @Override
    public void updateUser(UpdateUserRequest req, StreamObserver<User> res) {

        UserEntity e = repo.findById(req.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        e.setName(req.getName());
        e.setEmail(req.getEmail());
        repo.save(e);

        User user = User.newBuilder()
                .setId(e.getId())
                .setName(e.getName())
                .setEmail(e.getEmail())
                .build();

        res.onNext(user);
        res.onCompleted();
    }

    @Override
    public void deleteUser(DeleteUserRequest req, StreamObserver<User> res) {

        UserEntity e = repo.findById(req.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        repo.delete(e);

        User user = User.newBuilder()
                .setId(e.getId())
                .setName(e.getName())
                .setEmail(e.getEmail())
                .build();

        res.onNext(user);
        res.onCompleted();
    }

}
