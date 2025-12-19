
import bcrypt from 'bcryptjs';

async function hashPassword() {
    const hash = await bcrypt.hash('password123', 10);
    console.log("HASH:" + hash);
}

hashPassword();
