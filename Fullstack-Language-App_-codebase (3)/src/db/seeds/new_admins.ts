import { db } from '@/db';
import { admin } from '@/db/schema';
import bcrypt from 'bcrypt';

async function main() {
    const hashedPassword1 = await bcrypt.hash('admin123', 10);
    const hashedPassword2 = await bcrypt.hash('admin123', 10);

    const sampleAdmins = [
        {
            email: 'ahsanhq.bit@gmail.com',
            password: hashedPassword1,
            accessLevel: 2,
            name: 'Admin Level 2',
            createdAt: new Date().toISOString(),
        },
        {
            email: 'c3499417@uon.edu.au',
            password: hashedPassword2,
            accessLevel: 1,
            name: 'Admin Level 1',
            createdAt: new Date().toISOString(),
        }
    ];

    await db.insert(admin).values(sampleAdmins);
    
    console.log('✅ Admin seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});