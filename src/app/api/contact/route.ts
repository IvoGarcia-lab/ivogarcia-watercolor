import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
    try {
        const { name, email, message } = await request.json();

        // Validate input
        if (!name || !email || !message) {
            return NextResponse.json(
                { error: 'Todos os campos são obrigatórios.' },
                { status: 400 }
            );
        }

        // Configure Transporter (Use Environment Variables for Production)
        // For development without env vars, this will likely fail or needs Ethereal
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.hostinger.com', // Default Hostinger
            port: parseInt(process.env.SMTP_PORT || '465'),
            secure: true, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER || 'info@ivogarcia.pt', // Placeholder
                pass: process.env.SMTP_PASS,
            },
        });

        // Email Content
        const mailOptions = {
            from: `"Site IvoGarcia Arte" <${process.env.SMTP_USER || 'info@ivogarcia.pt'}>`,
            to: 'info@3dhr.pt', // Target email requested by user
            replyTo: email,
            subject: `Nova Mensagem de ${name} - Portfólio`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
                    <h2 style="color: #2563eb;">Nova Mensagem de Contacto</h2>
                    <p><strong>Nome:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0;">${message.replace(/\n/g, '<br>')}</p>
                    </div>
                    <p style="font-size: 12px; color: #666;">Recebido via formulário de contacto do site.</p>
                </div>
            `,
        };

        // Send Email
        await transporter.sendMail(mailOptions);

        return NextResponse.json({ success: true, message: 'Email enviado com sucesso!' });

    } catch (error) {
        console.error('Error sending email:', error);
        return NextResponse.json(
            { error: 'Erro ao enviar o email.' },
            { status: 500 }
        );
    }
}
