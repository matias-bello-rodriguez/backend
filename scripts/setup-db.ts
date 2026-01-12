
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';
import * as fs from 'fs';
import * as mysql from 'mysql2/promise';
import { execSync } from 'child_process';

// Entities
import { User } from '../src/entities/User.entity';
import { Vehicle } from '../src/entities/Vehicle.entity';
import { Publication } from '../src/entities/Publication.entity';
import { PublicationPhoto } from '../src/entities/PublicationPhoto.entity';
import { Sede } from '../src/entities/Sede.entity';
import { SedeSchedule } from '../src/entities/SedeSchedule.entity';
import { UserSchedule } from '../src/entities/UserSchedule.entity';
import { Inspection } from '../src/entities/Inspection.entity';
import { InspectionSection } from '../src/entities/InspectionSection.entity';
import { InspectionSubsection } from '../src/entities/InspectionSubsection.entity';
import { Question } from '../src/entities/Question.entity';
import { AnswerOption } from '../src/entities/AnswerOption.entity';
import { InspectionAnswer } from '../src/entities/InspectionAnswer.entity';
import { Payment } from '../src/entities/Payment.entity';
import { InspectionPaymentDetail } from '../src/entities/InspectionPaymentDetail.entity';
import { PublicationPaymentDetail } from '../src/entities/PublicationPaymentDetail.entity';
import { WebpayTransaction } from '../src/entities/WebpayTransaction.entity';
import { PaymentAudit } from '../src/entities/PaymentAudit.entity';
import { PublicationLike } from '../src/entities/PublicationLike.entity';
import { Notification } from '../src/entities/Notification.entity';
import { Message } from '../src/entities/Message.entity';
import { SearchHistory } from '../src/entities/SearchHistory.entity';
import { SystemSetting } from '../src/entities/SystemSetting.entity';
import { Valor } from '../src/entities/Valor.entity';
import { WalletTransaction } from '../src/entities/WalletTransaction.entity';
import { SolicitudInspeccion } from '../src/entities/SolicitudInspeccion.entity';

dotenv.config({ path: join(__dirname, '../.env') });

console.log('Loaded Environment:', {
    path: join(__dirname, '../.env'),
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    pass: process.env.DB_PASSWORD ? '****' : 'CHAR-MISSING',
    db: process.env.DB_DATABASE
});

const DB_CONFIG = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'rayen123%',
    database: process.env.DB_DATABASE || 'auto_box',
};

async function createDatabaseIfNotExists() {
  console.log('Checking database...');
  const connection = await mysql.createConnection({
    host: DB_CONFIG.host,
    port: DB_CONFIG.port,
    user: DB_CONFIG.user,
    password: DB_CONFIG.password,
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_CONFIG.database}\``);
  console.log(`Database ${DB_CONFIG.database} checked/created.`);
  await connection.end();
}

const AppDataSource = new DataSource({
  type: 'mysql',
  host: DB_CONFIG.host,
  port: DB_CONFIG.port,
  username: DB_CONFIG.user, // MAPPED CORRECTLY
  password: DB_CONFIG.password,
  database: DB_CONFIG.database,
  entities: [
    User, Vehicle, Publication, PublicationPhoto, Sede, SedeSchedule, UserSchedule,
    Inspection, InspectionSection, InspectionSubsection, Question, AnswerOption,
    InspectionAnswer, Payment, InspectionPaymentDetail, PublicationPaymentDetail,
    WebpayTransaction, PaymentAudit, PublicationLike, Notification, Message,
    SearchHistory, SystemSetting, Valor, WalletTransaction, SolicitudInspeccion
  ],
  synchronize: true,
  logging: false,
});

async function runSqlFile(filename: string, queryRunner: any) {
    const filePath = join(__dirname, '../migrations', filename);
    if (fs.existsSync(filePath)) {
        console.log(`Processing ${filename}...`);
        const sql = fs.readFileSync(filePath, 'utf8');
        const statements = sql.split(';').filter(s => s.trim().length > 0);
        
        for (const statement of statements) {
            try {
                await queryRunner.query(statement);
            } catch (e: any) {
                // Ignore specific errors that imply "already done"
                const ignoredCodes = ['ER_DUP_ENTRY', 'ER_TABLE_EXISTS_ERROR', 'ER_DUP_FIELDNAME'];
                if (!ignoredCodes.includes(e.code)) {
                    console.warn(`[WARN] Statement in ${filename} failed: ${e.message}`);
                }
            }
        }
    } else {
        console.warn(`[WARN] File ${filename} not found.`);
    }
}

async function main() {
    try {
        await createDatabaseIfNotExists();
        
        console.log('Initializing TypeORM to sync schema...');
        await AppDataSource.initialize();
        console.log('Schema synchronized.');

        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();

        // 1. Critical Base Inserts
        console.log('Running migration scripts...');
        await runSqlFile('create-admin-mechanic-users.sql', queryRunner);
        await runSqlFile('insert-default-sede.sql', queryRunner);
        await runSqlFile('insert-sedes-schedules.sql', queryRunner);
        await runSqlFile('create-system-settings.sql', queryRunner);
        await runSqlFile('update-valor-prices.sql', queryRunner);
        
        // 2. Others that might add columns or fixes (safe to run due to try/catch)
        // Order based on list_dir, prioritized
        const otherMigrations = [
            'add-activo-especialidad.sql',
            'add-cancellation-reason.sql',
            'add-idempotency-column.sql',
            'add-inspection-answers.sql',
            'add-vehicle-getapi-fields.sql',
            'add-weekend-schedules.sql',
            'alter-horario-sede-v2.sql',
            'alter-sede-add-fields.sql',
            'alter-usuario-horario-v2.sql',
            // 'create-*.sql' files are mostly handled by Entities sync, but if they have data inserts they should be checked.
            // We already ran the big ones.
            'fix-payment-enums.sql',
            'translate-payment-enums.sql',
            'update-horario-sede.sql'
        ];

        for (const mig of otherMigrations) {
            await runSqlFile(mig, queryRunner);
        }

        await queryRunner.release();

        // 3. Run TS Seeders
        console.log('Running Inspection Form Seeder...');
        try {
            execSync('npx ts-node scripts/seed-inspection-form.ts', { 
                cwd: join(__dirname, '..'), 
                stdio: 'inherit' 
            });
        } catch (e) {
            console.error('Error running seed-inspection-form.ts');
        }

        console.log('Database setup finished successfully.');
        process.exit(0);

    } catch (error) {
        console.error('Fatal error during setup:', error);
        process.exit(1);
    }
}

main();
