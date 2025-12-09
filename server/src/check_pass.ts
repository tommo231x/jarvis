
import { comparePassword } from './auth';

const testPasswords = async () => {
    const adminHash = "$2b$10$MJn/0ulNa.u2QajVdJdtYuEy.EIOb2U8lQ/Vqf1Nov1F5IjEhLRnO";
    const demoHash = "$2b$10$844rEiFroY5CvK4hSOc7F.wuqh7aHnoas7dSo5DFWGZi5JwHL27Cq";

    console.log("Checking duplicates...");

    // Check Admin
    if (await comparePassword("password", adminHash)) console.log("Admin password is 'password'");
    else if (await comparePassword("admin", adminHash)) console.log("Admin password is 'admin'");
    else if (await comparePassword("123456", adminHash)) console.log("Admin password is '123456'");
    else console.log("Admin password not found in common list");

    // Check Demo
    if (await comparePassword("password", demoHash)) console.log("Demo password is 'password'");
    else if (await comparePassword("demo", demoHash)) console.log("Demo password is 'demo'");
    else if (await comparePassword("123456", demoHash)) console.log("Demo password is '123456'");
    else console.log("Demo password not found in common list");
};

testPasswords();
