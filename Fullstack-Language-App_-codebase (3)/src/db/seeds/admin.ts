import { db } from '@/db';
import { admin } from '@/db/schema';
import bcrypt from 'bcrypt';

async function main() {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const sampleAdmin = [
        {
            email: 'ahsan.bit@outlook.com',
            password: hashedPassword,
            accessLevel: 3,
            name: 'Super Admin',
            createdAt: new Date().toISOString(),
        }
    ];

    await db.insert(admin).values(sampleAdmin);
    
    console.log('✅ Admin seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});