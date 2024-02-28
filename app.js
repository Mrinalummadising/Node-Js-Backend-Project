import express from 'express';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import { request } from 'http';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const databasePath = path.join(__dirname, "bloggingDatabase.db");

const app = express();
app.use(express.json());

let db = null;


const initializeDBAndServer = async () => {
    try {
        db = await open({
            filename: databasePath,
            driver: sqlite3.Database,
        });
        
        app.listen(3000, () =>
            console.log("Server is running at http://localhost:3000/")
        );
    } catch (error) {
        console.log(`DB Error ${error.message}`);
        process.exit(1);
    }
};

initializeDBAndServer();

app.get("/users/:userId", async (request, response) => {
    const {userId} = request.params;
    const getUserQuery = `SELECT * FROM users WHERE id=${userId}`;
    const user = await db.get(getUserQuery);
    response.send(user); 
});

app.get('/users/:userId', async (request, response) => {
    const userId = request.params.id;
    db.get('SELECT * FROM users WHERE id = ?', [userId])
        .then(user => {
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            response.json(user);
        })
        .catch(error => {
            response.status(500).json({ message: error.message });
        });
});

app.put('/users/:id', async (request, response) => {
    const { id } = request.params;
    const { username, email } = request.body;

    db.run('UPDATE users SET username = ?, email = ? WHERE id = ?', [username, email, id])
        .then(() => {
            response.json({ id, username, email });
        })
        .catch(error => {
            response.status(400).json({ message: error.message });
        });
});


app.post('/users', async (request, response) => {
    const { username, email } = request.body;
    
    db.run('INSERT INTO users (username, email) VALUES (?, ?)', [username, email])
        .then(newUser => {
            response.status(201).json({ id: newUser.lastID, username, email });
        })
        .catch(error => {
            response.status(400).json({ message: error.message });
        });
});



app.delete('/users', async (request, response) => {
    try {
        await db.run('DELETE FROM users');
        response.json({ message: 'All users deleted successfully' });
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
});







app.get('/blogs/:blogId', async (request, response) => {
    const {blogId} = request.params;
    const getBlogQuery = `SELECT * FROM blogs WHERE id=${blogId}`;
    const blog = await db.get(getBlogQuery);
    response.send(blog);
});

app.get('/blogs/:id', async (request, response) => {
    const { id } = req.params;
    db.get('SELECT * FROM blogs WHERE id = ?', [id])
        .then(blog => {
            if (!blog) {
                return res.status(404).json({ message: 'Blog not found' });
            }
            response.json(blog);
        })
        .catch(error => {
            response.status(500).json({ message: error.message });
        });
});

app.put('/blogs/:id', async (request, response) => {
    const { id } = request.params;
    const { title, content } = request.body;

    db.run('UPDATE blogs SET title = ?, content = ? WHERE id = ?', [title, content, id])
        .then(() => {
            response.json({ id, title, content });
        })
        .catch(error => {
            response.status(400).json({ message: error.message });
        });
});

app.post('/blogs', async (request, response) => {
    const { title, content, author_id } = request.body;

    db.run('INSERT INTO blogs (title, content, author_id) VALUES (?, ?, ?)', [title, content, author_id])
        .then(result => {
            const newBlogId = result.lastID;
            response.status(201).json({ id: newBlogId, title, content, author_id });
        })
        .catch(error => {
            response.status(400).json({ message: error.message });
        });
});


app.delete('/blogs', async (request, response) => {
    try {
        await db.run('DELETE FROM blogs');
        response.json({ message: 'All blogs deleted successfully' });
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
});






app.get('/comments/:commentId', async (request, response) => {
    const {commentId} = request.params;
    const getCommentQuery = `SELECT * FROM comments WHERE id=${commentId}`;
    const comments = await db.get(getCommentQuery);
    response.send(comments);
});


app.get('/comments/:id', async (request, response) => {
    const { id } = request.params;
    db.get('SELECT * FROM comments WHERE id = ?', [id])
        .then(comment => {
            if (!comment) {
                return response.status(404).json({ message: 'Comment not found' });
            }
            response.json(comment);
        })
        .catch(error => {
            response.status(500).json({ message: error.message });
        });
});

app.put('/comments/:id', async (request, response) => {
    const { id } = request.params;
    const { content } = request.body;

    db.run('UPDATE comments SET content = ? WHERE id = ?', [content, id])
        .then(() => {
            response.json({ id, content });
        })
        .catch(error => {
            response.status(400).json({ message: error.message });
        });
});

app.post('/comments', async (request, response) => {
    const { content, blog_id, author_id } = request.body;

    db.run('INSERT INTO comments (content, blog_id, author_id) VALUES (?, ?, ?)', [content, blog_id, author_id])
        .then(result => {
            const newCommentId = result.lastID;
            response.status(201).json({ id: newCommentId, content, blog_id, author_id });
        })
        .catch(error => {
            response.status(400).json({ message: error.message });
        });
});


app.get('/users/:userId/blogs', async (request, response) => {
    const userId = request.params.userId;

    db.all('SELECT * FROM blogs WHERE author_id = ?', [userId])
        .then(blogs => {
            response.json(blogs);
        })
        .catch(error => {
            response.status(500).json({ message: error.message });
        });
});


app.get('/users/:userId/comments', async (req, res) => {
    const userId = req.params.userId;

    db.all('SELECT * FROM comments WHERE author_id = ?', [userId])
        .then(comments => {
            res.json(comments);
        })
        .catch(error => {
            res.status(500).json({ message: error.message });
        });
});


app.delete('/comments', async (request, response) => {
    try {
        await db.run('DELETE FROM comments');
        response.json({ message: 'All comments deleted successfully' });
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
});


app.use((err, request, response, next) => {
    response.status(500).json({ message: err.message });
});

