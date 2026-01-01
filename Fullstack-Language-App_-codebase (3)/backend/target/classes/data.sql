-- Seed 25 Mandarin vocabulary rows
INSERT INTO vocab (word, pinyin, translation, audio_url, video_url, difficulty)
VALUES
('你好', 'nǐ hǎo', 'hello', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4', 'easy'),
('谢谢', 'xièxie', 'thank you', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 'https://samplelib.com/lib/preview/mp4/sample-10s.mp4', 'easy'),
('请', 'qǐng', 'please', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', 'https://samplelib.com/lib/preview/mp4/sample-20s.mp4', 'easy'),
('再见', 'zàijiàn', 'goodbye', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', 'https://samplelib.com/lib/preview/mp4/sample-30s.mp4', 'easy'),
('是', 'shì', 'to be', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4', 'easy'),
('不', 'bù', 'not/no', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', 'https://samplelib.com/lib/preview/mp4/sample-10s.mp4', 'easy'),
('我', 'wǒ', 'I/me', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', 'https://samplelib.com/lib/preview/mp4/sample-20s.mp4', 'easy'),
('你', 'nǐ', 'you', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', 'https://samplelib.com/lib/preview/mp4/sample-30s.mp4', 'easy'),
('他', 'tā', 'he/him', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4', 'easy'),
('她', 'tā', 'she/her', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', 'https://samplelib.com/lib/preview/mp4/sample-10s.mp4', 'easy'),
('我们', 'wǒmen', 'we/us', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3', 'https://samplelib.com/lib/preview/mp4/sample-20s.mp4', 'easy'),
('好', 'hǎo', 'good', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3', 'https://samplelib.com/lib/preview/mp4/sample-30s.mp4', 'easy'),
('吗', 'ma', 'question particle', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3', 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4', 'easy'),
('对不起', 'duìbuqǐ', 'sorry', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3', 'https://samplelib.com/lib/preview/mp4/sample-10s.mp4', 'easy'),
('没关系', 'méiguānxi', 'no problem', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3', 'https://samplelib.com/lib/preview/mp4/sample-20s.mp4', 'easy'),
('学生', 'xuéshēng', 'student', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3', 'https://samplelib.com/lib/preview/mp4/sample-30s.mp4', 'medium'),
('老师', 'lǎoshī', 'teacher', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4', 'medium'),
('学校', 'xuéxiào', 'school', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 'https://samplelib.com/lib/preview/mp4/sample-10s.mp4', 'medium'),
('水', 'shuǐ', 'water', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', 'https://samplelib.com/lib/preview/mp4/sample-20s.mp4', 'easy'),
('茶', 'chá', 'tea', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', 'https://samplelib.com/lib/preview/mp4/sample-30s.mp4', 'easy'),
('饭', 'fàn', 'rice/meal', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4', 'easy'),
('菜', 'cài', 'dish/vegetable', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', 'https://samplelib.com/lib/preview/mp4/sample-10s.mp4', 'easy'),
('中国', 'Zhōngguó', 'China', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', 'https://samplelib.com/lib/preview/mp4/sample-20s.mp4', 'medium'),
('英文', 'Yīngwén', 'English (language)', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', 'https://samplelib.com/lib/preview/mp4/sample-30s.mp4', 'medium'),
('多少钱', 'duōshǎo qián', 'how much', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4', 'medium');

-- Note: admin user is created via DataLoader to ensure bcrypt encoding.