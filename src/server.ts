import express from 'express';
import { Pool } from 'pg';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from './generated/prisma';

const prisma = new PrismaClient();
const app = express();
const port = 3000;

//PostgreSQL接続設定
const pool = new Pool({
    user: 'ashika',
    host: 'localhost',
    database: 'ashika',
    password: 'your_password',
    port: 5432,
});

//Multerの設定
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
  });
  

const upload = multer({ storage: storage });

//JSONのbodyをパースするためのミドルウェア
app.use(express.json());

// 静的ファイルを提供するためのミドルウェア
app.use(express.static('public'));

app.get('/', (req: express.Request, res: express.Response) => {
    res.send('YouTube Clone!');
});

//動画アップロードのエンドポイント (Prisma版)
app.post('/upload', upload.single('video'), (async (req: express.Request, res: express.Response) => {
    if (!req.file) {
        res.status(400).send('No video file uploaded.');
        return;
    }
    const { title, description } = req.body;
    const filePath = req.file.path;
    const originalname = req.file.originalname;

    try {
        const videoData = {
            title: title as string,
            description: req.body.description === undefined ? null : req.body.description as string,
            file_path: filePath,
            original_name: originalname,
            upload_date: new Date(),
        };
        const video = await prisma.video.create({
            data: videoData,
        });
        res.status(201).json({ message: 'Video uploaded successfully!', videoId: video.id });
    } catch (error) {
        console.error('Error uploading video:', error);
        res.status(500).send('Error uploading video to database.');
    }
}) as express.RequestHandler);

//動画リストを取得するエンドポイント (Prisma版)
const getVideosHandler: express.RequestHandler = async (req, res) => {
    try {
        const videos = await prisma.video.findMany({
            orderBy: {
                upload_date: 'desc',
            },
        });
        res.status(200).json(videos);
    } catch (error) {
        console.error('Error fetching videos', error);
        res.status(500).send('Error fetching videos.');
    }
};

app.get('/videos', getVideosHandler);

//uploads ディレクトリが存在しない場合は作成
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});