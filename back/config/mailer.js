import nodemailer from 'nodemailer';

const mailerConfig = {
    host: "smtp.gmail.com",
    port: 465, 
    secure: true, 
    auth: {
        user: "ecoflowsuport@gmail.com", 
        pass: "dfgs gfcl rhzw yooy" 
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
        
        return true;
    } catch (error) {
        console.error("Erro ao enviar e-mail de recuperação:", error);
        throw new Error("Não foi possível enviar o e-mail de recuperação.");
    }
};


export const sendVerificationEmail = async (to, token) => {
    try {
       
        const verificationLink = `http://10.84.6.136:3000/verificar-conta?token=${token}`;

        await transporter.sendMail({
            from: '"EcoFlow Suporte" <ecoflowsuport@gmail.com>', 
            to: to,
            subject: "Ative sua Conta EcoFlow",
            html: `
                <div style="font-family: sans-serif; text-align: center; padding: 20px;">
                    <h2>Bem-vindo(a) ao EcoFlow!</h2>
                    <p>Seu cadastro foi realizado com sucesso.</p>
                    <p>Por favor, clique no botão abaixo para ativar sua conta. O link é válido por 24 horas.</p>
                    <a href="${verificationLink}" style="background-color: #28a745; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px; font-weight: bold;">
                        Ativar Minha Conta
                    </a>
                </div>
            `,
        });
        
        return true;
    } catch (error) {
        console.error("Erro ao enviar e-mail de verificação:", error);
        throw new Error("Não foi possível enviar o e-mail de verificação.");
    }
}