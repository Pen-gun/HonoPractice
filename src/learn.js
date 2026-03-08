import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { stream, streamText } from 'hono/streaming';
import {v4 as uuidv4} from 'uuid';

const app = new Hono();
let users = [];

app.get('/', (c) => {
    return c.html('<h1>Hello Hono!</h1>');
});

app.post('/users', async (c) => {
    const { name, email } = await c.req.json();
    const newUser = { id: uuidv4(), name, email };
    users.push(newUser);
    return c.json(newUser, 201);
});

app.get('/users', (c) => {
    return streamText(c, async (stream) => {
        for (const user of users) {
            await stream.writeln(JSON.stringify(user));
            await stream.sleep(1000);
        }
    });
});

app.get('/users/:id', (c) => {
    const { id } = c.req.param();
    const user = users.find(u => u.id === id);
    if(!user) {
        return c.json({ error: 'User not found' }, 404);
    }
    return c.json(user);
});
//update user
app.put('/users/:id', async (c) => {
    const { id } = c.req.param();
    const { name, email } = await c.req.json();
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
        return c.json({ error: 'User not found' }, 404);
    }
    users[userIndex] = { ...users[userIndex], name, email };
    return c.json(users[userIndex]);
});

//delete user
app.delete('/users/:id', (c) => {
    const { id } = c.req.param();
    users = users.filter(u => u.id !== id);
    return c.json({ message: 'User deleted' });
});

//delete all users
app.delete('/users', (c) => {
    users = [];
    return c.json({ message: 'All users deleted' });
});

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
