import argon2 from 'argon2';
import crypto from 'crypto';

export async function hashPassword(password:string) {
    // Configure the algorithm
    const options: argon2.HashOptions = {
        type: argon2.argon2id,    // Variant of Argon2
        memoryCost: 65536,        // 64 MiB
        timeCost: 2,              // 2 passes
        parallelism: 1,           // 4 threads
        hashLength: 32,           // 32 bytes output
        salt: crypto.randomBytes(16),  // 16 bytes salt
    };
    
    try {
        // Hash the password (salt is generated automatically by default)
        const hash = await argon2.hash(password, options);
        return hash;
    } catch (err) {
        console.error('Error hashing password:', err);
        throw err;
    }
}

// Example usage
//hashPassword('super_secret_password')
  //  .then(hash => console.log('Hashed password:', hash))
    //.catch(err => console.error(err));

// This will produce something like:
// $argon2id$v=19$m=65536,t=3,p=4$G8NYSxrA+UMGHJbZVIXXXQ$UrHyBcYfCEms+92QVzGmfYqrWtH54WJY9FuROBQi/X8