import nodemailer from 'nodemailer';

// IMPORTANTE: Coloque essas informações em variáveis de ambiente (.env) em um projeto real!
const mailerConfig = {
    host: "smtp.gmail.com",
    port: 465, // ou 587 para TLS
    secure: true, // true para 465, false para outras portas
    auth: {
        user: "ecoflowsuport@gmail.com", // O seu e-mail do Gmail
        pass: "dfgs gfcl rhzw yooy" // A senha de app que você gerou
    }
};

const transporter = nodemailer.createTransport(mailerConfig);

export const sendRecoveryEmail = async (to, code) => {
    try {
        await transporter.sendMail({
            from: '"EcoFlow Suporte" <seu.email@gmail.com>',
            to: to,
            subject: "Seu Código de Recuperação de Senha",
            html: `
                <div style="font-family: sans-serif; text-align: center; padding: 20px;">
                    <h2>Recuperação de Senha - EcoFlow</h2>
                    <p>Você solicitou a redefinição de sua senha.</p>
                    <p>Use o código abaixo para continuar. Ele é válido por 5 minutos.</p>
                    <p style="font-size: 24px; font-weight: bold; letter-spacing: 5px; background: #f0f0f0; padding: 10px 20px; border-radius: 5px; display: inline-block;">
                        ${code}
                    </p>
                </div>
            `,
        });
        console.log(`E-mail de recuperação enviado para ${to}`);
        return true;
    } catch (error) {
        console.error("Erro ao enviar e-mail de recuperação:", error);
        throw new Error("Não foi possível enviar o e-mail de recuperação.");
    }
};