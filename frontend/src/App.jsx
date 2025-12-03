import { useEffect, useState } from "react";
import { User, FileText, Edit2, Trash2, Save, X } from "lucide-react";
import "./App.css";

function App() {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [uform, setUform] = useState({ name: "", email: "" });
  const [pform, setPform] = useState({ title: "", body: "" });
  const [editUserId, setEditUserId] = useState(null);
  const [editPostId, setEditPostId] = useState(null);

  // Load data
  const loadData = () => {
    fetch("/api/users")
      .then((r) => r.json())
      .then(setUsers);
    fetch("/api/posts")
      .then((r) => r.json())
      .then(setPosts);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    console.log("Users loaded:", users);
  }, [users]);

  // Create or Update User
  const saveUser = async (e) => {
    e.preventDefault();
    const url = editUserId ? `/api/users/${editUserId}` : "/api/users";
    const method = editUserId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(uform),
    });
    if (res.ok) {
      setUform({ name: "", email: "" });
      setEditUserId(null);
      loadData();
    }
  };

  // Create or Update Post
  const savePost = async (e) => {
    e.preventDefault();
    const url = editPostId ? `/api/posts/${editPostId}` : "/api/posts";
    const method = editPostId ? "PUT" : "POST";

    // authorId must exist
    if (!pform.authorId) {
      alert("Please select an author!");
      return;
    }

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pform),
    });

    if (res.ok) {
      setPform({ title: "", body: "", authorId: "" });
      setEditPostId(null);
      loadData();
    } else {
      const err = await res.json();
      alert(err.error || "Failed to create post");
    }
  };

  // Delete User
  const deleteUser = async (id) => {
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    loadData();
  };

  // Delete Post
  const deletePost = async (id) => {
    await fetch(`/api/posts/${id}`, { method: "DELETE" });
    loadData();
  };

  const cancelUserEdit = () => {
    setUform({ name: "", email: "" });
    setEditUserId(null);
  };

  const cancelPostEdit = () => {
    setPform({ title: "", body: "" });
    setEditPostId(null);
  };

  return (
    <div className="app-container">
      <div className="app-wrapper">
        {/* Header */}
        <div className="header animate-fade-in">
          <h1 className="main-title">gRPC Microservices</h1>
          <p className="subtitle">Manage Users & Posts with Style</p>
        </div>

        {/* Main Grid */}
        <div className="main-grid">
          {/* USERS SECTION */}
          <div className="section animate-slide-in-left">
            {/* User Form Card */}
            <div className="card">
              <div className="card-header">
                <div className="icon-wrapper icon-user">
                  <User className="icon" />
                </div>
                <h2 className="card-title">
                  {editUserId ? "Edit User" : "Create User"}
                </h2>
              </div>

              <div className="form-container">
                <input
                  placeholder="Full Name"
                  value={uform.name}
                  onChange={(e) => setUform({ ...uform, name: e.target.value })}
                  className="input-field"
                  required
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={uform.email}
                  onChange={(e) =>
                    setUform({ ...uform, email: e.target.value })
                  }
                  className="input-field"
                  required
                />
                <div className="button-group">
                  <button
                    onClick={saveUser}
                    className="btn btn-primary btn-user"
                  >
                    <Save className="btn-icon" />
                    {editUserId ? "Update" : "Create"}
                  </button>
                  {editUserId && (
                    <button onClick={cancelUserEdit} className="btn btn-cancel">
                      <X className="btn-icon" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Users List */}
            <div className="card">
              <h3 className="list-title">Users List</h3>
              <div className="list-container">
                {users.length === 0 ? (
                  <p className="empty-message">No users yet. Create one!</p>
                ) : (
                  users.map((u) => (
                    <div key={u.id} className="list-item">
                      <div className="list-item-content">
                        <div className="list-item-info">
                          <h4 className="list-item-name">{u.name}</h4>
                          <p className="list-item-email">{u.email}</p>
                          <div className="user-reactions">
                            <strong>Reactions:</strong>

                            {u.reactions?.length === 0 && (
                              <p>No reactions yet</p>
                            )}

                            {u.reactions?.map((r, index) => (
                              <p style={{ color: "black" }} key={index}>
                                <b>{r.postTitle}</b>: {r.type}
                              </p>
                            ))}
                          </div>
                        </div>
                        <div className="list-item-actions">
                          <button
                            onClick={() => {
                              setUform({ name: u.name, email: u.email });
                              setEditUserId(u.id);
                            }}
                            className="action-btn action-edit"
                          >
                            <Edit2 className="action-icon" />
                          </button>
                          <button
                            onClick={() => deleteUser(u.id)}
                            className="action-btn action-delete"
                          >
                            <Trash2 className="action-icon" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* POSTS SECTION */}
          <div className="section animate-slide-in-right">
            {/* Post Form Card */}
            <div className="card">
              <div className="card-header">
                <div className="icon-wrapper icon-post">
                  <FileText className="icon" />
                </div>
                <h2 className="card-title">
                  {editPostId ? "Edit Post" : "Create Post"}
                </h2>
              </div>

              <div className="form-container">
                <input
                  placeholder="Post Title"
                  value={pform.title}
                  onChange={(e) =>
                    setPform({ ...pform, title: e.target.value })
                  }
                  className="input-field"
                  required
                />
                <textarea
                  placeholder="Post Content"
                  value={pform.body}
                  onChange={(e) => setPform({ ...pform, body: e.target.value })}
                  className="input-field textarea-field"
                  required
                />
                <select
                  value={pform.authorId || ""}
                  onChange={(e) =>
                    setPform({ ...pform, authorId: e.target.value })
                  }
                  className="input-field"
                  required
                >
                  <option value="">Select Author</option>
                  {users.map((u) => (
                    <option style={{ color: "black" }} key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>

                <div className="button-group">
                  <button
                    onClick={savePost}
                    className="btn btn-primary btn-post"
                  >
                    <Save className="btn-icon" />
                    {editPostId ? "Update" : "Create"}
                  </button>
                  {editPostId && (
                    <button onClick={cancelPostEdit} className="btn btn-cancel">
                      <X className="btn-icon" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Posts List */}
            <div className="card">
              <h3 className="list-title">Posts List</h3>
              <div className="list-container">
                {posts.length === 0 ? (
                  <p className="empty-message">No posts yet. Create one!</p>
                ) : (
                  posts.map((p) => (
                    <div key={p.post.id} className="list-item">
                      <div className="list-item-content">
                        <h4 className="list-item-post-title">{p.post.title}</h4>
                        <div className="list-item-actions">
                          <button
                            onClick={() => {
                              setPform({
                                title: p.post.title,
                                body: p.post.body,
                              });
                              setEditPostId(p.post.id);
                            }}
                            className="action-btn action-edit"
                          >
                            <Edit2 className="action-icon" />
                          </button>
                          <button
                            onClick={() => deletePost(p.post.id)}
                            className="action-btn action-delete"
                          >
                            <Trash2 className="action-icon" />
                          </button>
                        </div>
                      </div>
                      <p className="list-item-body">{p.post.body}</p>
                      <p className="author-name">
                        Author: {p.author?.name || "Unknown"}
                      </p>
                      <p className="reactions">
                        Likes: {p.reactionSummary.counts.likes} - Dislikes:{" "}
                        {p.reactionSummary.counts.dislikes}
                      </p>
                      <p className="reactors">
                        Liked by:{" "}
                        {p.reactionSummary.reactors
                          .filter((r) => r.type === "LIKE")
                          .map((r) => r.name)

                          .join(", ")}
                      </p>
                      <p className="reactors">
                        Disliked by:{" "}
                        {p.reactionSummary.reactors
                          .filter((r) => r.type === "DISLIKE")
                          .map((r) => r.name)
                          .join(", ")}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
