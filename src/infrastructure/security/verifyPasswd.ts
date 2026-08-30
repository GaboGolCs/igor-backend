import argon2 from 'argon2';

async function verifyPassword(storedHash: string, providedPassword: string): Promise<boolean> {
    try {
        // The verify function returns true if the password matches
        // It returns false if the password doesn't match
        const isValid = await argon2.verify(storedHash, providedPassword);
        return isValid;
    } catch (err) {
        // Handle errors like invalid hash format
        console.error('Error during password verification:', err);
        return false;
    }
}

/* Example usage
const storedHash = '$argon2id$v=19$m=65536,t=3,p=4$G8NYSxrA+UMGHJbZVIXXXQ$UrHyBcYfCEms+92QVzGmfYqrWtH54WJY9FuROBQi/X8';

verifyPassword(storedHash, 'super_secret_password')
    .then(isValid => {
        if (isValid) {
            console.log('Password is correct!');
        } else {
            console.log('Password is incorrect!');
        }
    })
    .catch(err => console.error(err));

*/