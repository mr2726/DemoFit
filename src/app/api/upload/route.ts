
import { NextRequest, NextResponse } from 'next/server';
import TelegramBot from 'node-telegram-bot-api';
import multer from 'multer';
import { Readable } from 'stream';

const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;

if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    throw new Error("Telegram environment variables (TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID) are not set.");
}

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN);

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Helper to run multer middleware
const runMiddleware = (req: NextRequest, middleware: any): Promise<any> => {
    return new Promise((resolve, reject) => {
        // The 'files' property is what multer uses. We'll trick it into thinking it's an Express request.
        const expressRequest = req as any;
        expressRequest.files = expressRequest.files || [];
        middleware(expressRequest, new NextResponse(), (result: any) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(expressRequest); // Resolve with the modified request
        });
    });
};

export const config = {
    api: {
        bodyParser: false,
    },
};

export async function POST(request: NextRequest) {
    try {
        // We need to get the file buffer from the request
        const data = await request.formData();
        const file: File | null = data.get('file') as unknown as File;

        if (!file) {
            return NextResponse.json({ error: "No file was uploaded." }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const stream = Readable.from(buffer);

        // Send the video to Telegram
        const fileData = await bot.sendVideo(TELEGRAM_CHAT_ID, stream, {}, {
            filename: file.name,
            contentType: file.type,
        });

        if (!fileData.video?.file_id) {
            throw new Error('Failed to get file_id from Telegram.');
        }

        // Get the file path from Telegram
        const fileLink = await bot.getFile(fileData.video.file_id);
        const videoUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${fileLink.file_path}`;

        return NextResponse.json({ url: videoUrl, key: fileData.video.file_id });

    } catch (error: any) {
        console.error("Error handling file upload to Telegram:", error);
        return NextResponse.json({ error: `Failed to upload to Telegram: ${error.message}` }, { status: 500 });
    }
}
