import nodemailer from "nodemailer";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const logFile = "mailTestResult.log";

function log(msg) {
    console.log(msg);
    fs.appendFileSync(logFile, msg + "\n");
}

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.APP_EMAIL,
        pass: process.env.APP_PASSWORD,
    },
    tls: { rejectUnauthorized: false },
});

async function testMail() {
    if (fs.existsSync(logFile)) fs.unlinkSync(logFile);

    try {
        log("Testing mail with: " + process.env.APP_EMAIL);
        await transporter.verify();
        log("✅ Transporter is ready");

        await transporter.sendMail({
            from: process.env.APP_EMAIL,
            to: process.env.APP_EMAIL,
            subject: "Test Email",
            text: "This is a test email to verify credentials.",
        });
        log("✅ Email sent successfully");
    } catch (error) {
        log("❌ Mail error: " + error.message);
        if (error.stack) log(error.stack);
    }
}

testMail();
