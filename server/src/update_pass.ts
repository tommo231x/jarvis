
import { db } from './db';
import { hashPassword } from './auth';
import { User } from './models';

async function main() {
    const email = 'tommo231@gmail.com';
    const newPassword = 'admin231';

    console.log(`Updating password for ${email}...`);

    const users = await db.collection<User>('users').find();
    const user = users.find(u => u.username === email);

    if (user) {
        const passwordHash = await hashPassword(newPassword);
        await db.collection<User>('users').update(user.id, { passwordHash });
        console.log('Password updated successfully.');
    } else {
        console.log('User not found, creating...');
        const passwordHash = await hashPassword(newPassword);
        await db.collection<User>('users').add({ username: email, passwordHash });
        console.log('User created successfully.');
    }
}

main().catch(console.error);
