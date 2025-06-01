import express, { Request, Response, NextFunction, RequestHandler } from 'express';
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
    destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        cb(null, 'uploads/');
    },
    filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

//JSONのbodyをパースするためのミドルウェア
app.use(express.json());

// 静的ファイルを提供するためのミドルウェア
app.use(express.static('public'));

app.get('/', (req: Request, res: Response) => {
    res.send('YouTube Clone!');
});

//動画アップロードのエンドポイント
app.post('/upload', upload.single('video'), (async (req: Request, res: Response): Promise<Response | undefined> => {
    if (!req.file) {
       return res.status(400).send('No video file uploaded.');
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
        })
        return res.status(201).json({ message: 'Video uploaded successfully!', videoId: video.id });
    } catch (error) {
        console.error('Error uploading video:', error);
        return res.status(500).send('Error uploading video to database.');
    }
}) as RequestHandler);

//uploads ディレクトリが存在しない場合は作成
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});