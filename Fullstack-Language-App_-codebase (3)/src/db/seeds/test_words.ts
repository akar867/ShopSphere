import { db } from '@/db';
import { words } from '@/db/schema';

async function main() {
    const sampleWords = [
        {
            hanzi: '测试1',
            pinyin: 'cèshì1',
            translation: 'test1',
            difficulty: 'easy',
            imageUrl: 'https://example.com/image1.jpg',
            createdAt: new Date('2024-01-15').toISOString(),
        },
        {
            hanzi: '测试2',
            pinyin: 'cèshì2',
            translation: 'test2',
            difficulty: 'medium',
            imageUrl: null,
            createdAt: new Date('2024-01-16').toISOString(),
        }
    ];

    await db.insert(words).values(sampleWords);
    
    console.log('✅ Words seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});