import 'dotenv/config';
import app from './app.js';
import prisma from './config/prisma.js';

const PORT = process.env.PORT || 3333;

async function bootstrap() {
  try {
    await prisma.$connect();
    console.log('Database connected successfully.');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

bootstrap();