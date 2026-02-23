const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

// Load env from the same directory
dotenv.config({ path: path.join(__dirname, '.env') });

async function testConnection() {
    console.log('--- SMTP Diagnostic Tool ---');
    console.log(`Host: ${process.env.SMTP_HOST}`);
    console.log(`Port: ${process.env.SMTP_PORT}`);
    console.log(`User: ${process.env.SMTP_USER}`);
    console.log(`Pass: ${process.env.SMTP_PASS ? '******** (Hidden)' : 'MISSING'}`);
    console.log('----------------------------');

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.error('ERROR: Missing SMTP credentials in .env file.');
        process.exit(1);
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_PORT === '465',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    try {
        console.log('Testing connection to SMTP server...');
        await transporter.verify();
        console.log('✅ Connection successful!');

        console.log('Sending test email...');
        const info = await transporter.sendMail({
            from: `"${process.env.FROM_NAME || 'MoralVerse'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER, // Send it to self
            subject: 'SMTP Test Connection',
            text: 'If you are reading this, your SMTP configuration is working perfectly!',
        });

        console.log('✅ Test email sent successfully!');
        console.log(`Message ID: ${info.messageId}`);
        console.log(`Check your inbox at: ${process.env.SMTP_USER}`);
    } catch (error) {
        console.error('❌ SMTP Test Failed:');
        console.error(error);
        if (error.code === 'EAUTH') {
            console.error('\nTIP: Authentication failed. If using Gmail, make sure you are using an APP PASSWORD, not your regular password.');
        } else if (error.code === 'ESOCKET') {
            console.error('\nTIP: Connection timed out. Check your firewall or port settings (try port 587).');
        }
    }
}

testConnection();
