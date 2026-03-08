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

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
